package com.ticketbooking.service;

import java.util.List;

import com.ticketbooking.dto.showtime.SeatMapUpdateDto;
import com.ticketbooking.dto.showtime.ShowtimeDetailsDto;

public interface ShowtimeService {

    ShowtimeDetailsDto getShowtimeDetails(Long showtimeId);

    SeatMapUpdateDto getSeatMapUpdate(Long showtimeId);

    SeatMapUpdateDto selectSeats(Long showtimeId, List<Long> seatIds, Long userId, String clientSessionId);

    SeatMapUpdateDto releaseSeats(Long showtimeId, List<Long> seatIds, Long userId, String clientSessionId);

    void releaseAllSelectedSeatsForSession(String clientSessionId);
}
