package com.ticketbooking.service.impl;

import java.time.Instant;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;

import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import com.ticketbooking.dto.showtime.SeatDto;
import com.ticketbooking.dto.showtime.SeatMapUpdateDto;
import com.ticketbooking.dto.showtime.ShowtimeDetailsDto;
import com.ticketbooking.entity.EventType;
import com.ticketbooking.entity.Seat;
import com.ticketbooking.entity.SeatCategory;
import com.ticketbooking.entity.SeatStatus;
import com.ticketbooking.entity.Showtime;
import com.ticketbooking.entity.ShowtimeStatus;
import com.ticketbooking.exception.BadRequestException;
import com.ticketbooking.exception.ResourceNotFoundException;
import com.ticketbooking.exception.SeatUnavailableException;
import com.ticketbooking.repository.SeatRepository;
import com.ticketbooking.repository.ShowtimeRepository;
import com.ticketbooking.service.ShowtimeService;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class ShowtimeServiceImpl implements ShowtimeService {

    private final ShowtimeRepository showtimeRepository;
    private final SeatRepository seatRepository;
    private final SimpMessagingTemplate messagingTemplate;

    @Override
    @Transactional(readOnly = true)
    public ShowtimeDetailsDto getShowtimeDetails(Long showtimeId) {
        Showtime showtime = getShowtime(showtimeId);
        List<SeatDto> seats = mapSeats(seatRepository.findByShowtimeIdOrderBySeatRowAscSeatNumberAsc(showtimeId));
        return new ShowtimeDetailsDto(
                showtime.getId(),
                showtime.getMovie().getId(),
                showtime.getMovie().getTitle(),
                showtime.getMovie().getDescription(),
                showtime.getMovie().getEventType() != null ? showtime.getMovie().getEventType().name() : EventType.MOVIE.name(),
                showtime.getMovie().getGenre(),
                showtime.getMovie().getLanguage(),
                showtime.getMovie().getDurationMinutes(),
                showtime.getMovie().getRating(),
                showtime.getMovie().getCastMembers(),
                showtime.getMovie().getOrganizerName(),
                showtime.getMovie().getAgeRestriction(),
                showtime.getMovie().getBannerUrl(),
                showtime.getMovie().getPosterUrl(),
                showtime.getTheater().getName(),
                showtime.getTheater().getCity(),
                showtime.getTheater().getAddressLine(),
                showtime.getTheater().getVenueType(),
                showtime.getScreenName(),
                showtime.getShowFormat(),
                showtime.getStatus().name(),
                showtime.getStartTime(),
                showtime.getEndTime(),
                showtime.getPrice(),
                seats
        );
    }

    @Override
    @Transactional(readOnly = true)
    public SeatMapUpdateDto getSeatMapUpdate(Long showtimeId) {
        getShowtime(showtimeId);
        return new SeatMapUpdateDto(
                showtimeId,
                Instant.now(),
                mapSeats(seatRepository.findByShowtimeIdOrderBySeatRowAscSeatNumberAsc(showtimeId))
        );
    }

    @Override
    @Transactional
    public SeatMapUpdateDto selectSeats(Long showtimeId, List<Long> seatIds, Long userId, String clientSessionId) {
        validateClientSession(clientSessionId);
        Showtime showtime = getShowtime(showtimeId);
        validateShowtimeIsActive(showtime);

        Set<Long> requestedSeatIds = new LinkedHashSet<>(seatIds);
        List<Seat> seats = seatRepository.findAllByShowtimeIdAndIdInForUpdate(showtimeId, requestedSeatIds);
        validateSeatCount(requestedSeatIds, seats);

        for (Seat seat : seats) {
            if (seat.getStatus() == SeatStatus.BOOKED) {
                throw new SeatUnavailableException("Seat " + seat.getLabel() + " is already booked");
            }
            if (seat.getStatus() == SeatStatus.SELECTED && !clientSessionId.equals(seat.getSelectedBySessionId())) {
                throw new SeatUnavailableException("Seat " + seat.getLabel() + " is selected by another user");
            }
            seat.setStatus(SeatStatus.SELECTED);
            seat.setSelectedBySessionId(clientSessionId);
            seat.setSelectedByUserId(userId);
        }
        seatRepository.saveAll(seats);
        return publishSeatMap(showtimeId);
    }

    @Override
    @Transactional
    public SeatMapUpdateDto releaseSeats(Long showtimeId, List<Long> seatIds, Long userId, String clientSessionId) {
        validateClientSession(clientSessionId);
        Showtime showtime = getShowtime(showtimeId);
        validateShowtimeIsActive(showtime);

        Set<Long> requestedSeatIds = new LinkedHashSet<>(seatIds);
        List<Seat> seats = seatRepository.findAllByShowtimeIdAndIdInForUpdate(showtimeId, requestedSeatIds);
        validateSeatCount(requestedSeatIds, seats);

        for (Seat seat : seats) {
            if (seat.getStatus() == SeatStatus.SELECTED
                    && clientSessionId.equals(seat.getSelectedBySessionId())
                    && (seat.getSelectedByUserId() == null || seat.getSelectedByUserId().equals(userId))) {
                resetSeat(seat);
            }
        }
        seatRepository.saveAll(seats);
        return publishSeatMap(showtimeId);
    }

    @Override
    @Transactional
    public void releaseAllSelectedSeatsForSession(String clientSessionId) {
        if (!StringUtils.hasText(clientSessionId)) {
            return;
        }

        List<Seat> seats = seatRepository.findBySelectedBySessionIdAndStatus(clientSessionId, SeatStatus.SELECTED);
        if (seats.isEmpty()) {
            return;
        }

        Map<Long, List<Seat>> seatsByShowtime = seats.stream()
                .collect(Collectors.groupingBy(seat -> seat.getShowtime().getId()));

        seats.forEach(this::resetSeat);
        seatRepository.saveAll(seats);

        seatsByShowtime.keySet().forEach(this::publishSeatMap);
    }

    private void validateClientSession(String clientSessionId) {
        if (!StringUtils.hasText(clientSessionId)) {
            throw new BadRequestException("Client session id is required");
        }
    }

    private void validateSeatCount(Set<Long> requestedSeatIds, List<Seat> seats) {
        if (seats.size() != requestedSeatIds.size()) {
            throw new ResourceNotFoundException("One or more seats could not be found");
        }
    }

    private void validateShowtimeIsActive(Showtime showtime) {
        if (showtime.getStatus() != ShowtimeStatus.SCHEDULED) {
            throw new BadRequestException("This showtime is not open for bookings");
        }
    }

    private Showtime getShowtime(Long showtimeId) {
        return showtimeRepository.findDetailedShowtimeById(showtimeId)
                .orElseThrow(() -> new ResourceNotFoundException("Showtime not found"));
    }

    private List<SeatDto> mapSeats(List<Seat> seats) {
        return seats.stream()
                .map(seat -> new SeatDto(
                        seat.getId(),
                        seat.getLabel(),
                        seat.getSeatRow(),
                        seat.getSeatNumber(),
                        seat.getPrice(),
                        (seat.getSeatCategory() != null ? seat.getSeatCategory() : SeatCategory.REGULAR).name(),
                        seat.getStatus(),
                        seat.getSelectedBySessionId()
                ))
                .toList();
    }

    private void resetSeat(Seat seat) {
        seat.setStatus(SeatStatus.AVAILABLE);
        seat.setSelectedBySessionId(null);
        seat.setSelectedByUserId(null);
    }

    private SeatMapUpdateDto publishSeatMap(Long showtimeId) {
        SeatMapUpdateDto update = getSeatMapUpdate(showtimeId);
        messagingTemplate.convertAndSend(seatTopic(showtimeId), update);
        return update;
    }

    private String seatTopic(Long showtimeId) {
        return "/topic/showtimes/" + showtimeId + "/seats";
    }
}
