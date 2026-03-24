package com.ticketbooking.service.impl;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Locale;
import java.util.Optional;
import java.util.stream.Collectors;

import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.ticketbooking.dto.admin.AdminAnalyticsDto;
import com.ticketbooking.dto.admin.AdminBookingSummaryDto;
import com.ticketbooking.dto.admin.AdminCancelShowtimeRequestDto;
import com.ticketbooking.dto.admin.AdminCancellationSummaryDto;
import com.ticketbooking.dto.admin.AdminCreateUserRequestDto;
import com.ticketbooking.dto.admin.AdminCreateShowtimeRequestDto;
import com.ticketbooking.dto.admin.AdminDashboardDto;
import com.ticketbooking.dto.admin.AdminEventSeatSummaryDto;
import com.ticketbooking.dto.admin.AdminEventSummaryDto;
import com.ticketbooking.dto.admin.AdminPaymentSummaryDto;
import com.ticketbooking.dto.admin.AdminRemoveEventRequestDto;
import com.ticketbooking.dto.admin.AdminSeatInventoryDto;
import com.ticketbooking.dto.admin.AdminSendTestEmailRequestDto;
import com.ticketbooking.dto.admin.AdminShowtimeSummaryDto;
import com.ticketbooking.dto.admin.AdminUpdateUserRequestDto;
import com.ticketbooking.dto.admin.AdminUserSummaryDto;
import com.ticketbooking.dto.admin.AdminVenueSummaryDto;
import com.ticketbooking.entity.AuthProvider;
import com.ticketbooking.entity.Booking;
import com.ticketbooking.entity.BookingStatus;
import com.ticketbooking.entity.EventType;
import com.ticketbooking.entity.Movie;
import com.ticketbooking.entity.NotificationType;
import com.ticketbooking.entity.OtpChannel;
import com.ticketbooking.entity.PaymentStatus;
import com.ticketbooking.entity.Seat;
import com.ticketbooking.entity.SeatCategory;
import com.ticketbooking.entity.SeatStatus;
import com.ticketbooking.entity.Showtime;
import com.ticketbooking.entity.ShowtimeStatus;
import com.ticketbooking.entity.Theater;
import com.ticketbooking.entity.UserAccount;
import com.ticketbooking.entity.UserRole;
import com.ticketbooking.exception.BadRequestException;
import com.ticketbooking.exception.ResourceNotFoundException;
import com.ticketbooking.repository.BookingRepository;
import com.ticketbooking.repository.MovieRepository;
import com.ticketbooking.repository.OtpVerificationRepository;
import com.ticketbooking.repository.SeatRepository;
import com.ticketbooking.repository.ShowtimeRepository;
import com.ticketbooking.repository.TheaterRepository;
import com.ticketbooking.repository.UserAccountRepository;
import com.ticketbooking.repository.UserNotificationRepository;
import com.ticketbooking.service.AdminService;
import com.ticketbooking.service.EmailNotificationService;
import com.ticketbooking.service.NotificationService;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class AdminServiceImpl implements AdminService {

    private static final BigDecimal ZERO = new BigDecimal("0.00");
    private static final String MOVIES_GENRE = "Movies";
    private static final String CONCERTS_GENRE = "Concerts";
    private static final String STAND_UP_COMEDY_SHOW_GENRE = "Stand-up Comedy Show";
    private static final String ALLOWED_GENRES_ERROR = "Only Movies, Concerts, and Stand-up Comedy Show are supported";

    private final ShowtimeRepository showtimeRepository;
    private final MovieRepository movieRepository;
    private final TheaterRepository theaterRepository;
    private final SeatRepository seatRepository;
    private final BookingRepository bookingRepository;
    private final UserAccountRepository userAccountRepository;
    private final UserNotificationRepository userNotificationRepository;
    private final OtpVerificationRepository otpVerificationRepository;
    private final NotificationService notificationService;
    private final EmailNotificationService emailNotificationService;

    @Override
    @Transactional(readOnly = true)
    public AdminDashboardDto getDashboard() {
        List<Showtime> showtimes = showtimeRepository.findAllByOrderByStartTimeDesc();
        List<Movie> events = movieRepository.findAll(Sort.by(Sort.Direction.DESC, "releaseDate", "createdAt"))
                .stream()
                .filter(Movie::isUpcoming)
                .toList();
        List<Theater> venues = theaterRepository.findAll(Sort.by(Sort.Direction.ASC, "name", "city"));
        List<UserAccount> users = userAccountRepository.findAll(Sort.by(Sort.Direction.DESC, "createdAt"));
        List<Booking> bookings = bookingRepository.findAllByOrderByCreatedAtDesc();

        long totalBookings = bookings.size();
        long confirmedBookings = bookings.stream().filter(booking -> booking.getBookingStatus() == BookingStatus.CONFIRMED).count();
        long cancelledBookings = bookings.stream().filter(booking -> booking.getBookingStatus() == BookingStatus.CANCELLED).count();
        BigDecimal grossRevenue = bookings.stream()
                .filter(booking -> booking.getBookingStatus() == BookingStatus.CONFIRMED)
                .map(Booking::getTotalAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add)
                .setScale(2, RoundingMode.HALF_UP);
        BigDecimal refundAmount = bookings.stream()
                .map(Booking::getRefundAmount)
                .filter(value -> value != null)
                .reduce(BigDecimal.ZERO, BigDecimal::add)
                .setScale(2, RoundingMode.HALF_UP);

        long totalSeats = 0;
        long bookedSeats = 0;
        List<AdminShowtimeSummaryDto> schedules = new ArrayList<>();
        List<AdminSeatInventoryDto> seatInventory = new ArrayList<>();
        List<AdminEventSeatSummaryDto> eventSeats = new ArrayList<>();
        List<AdminCancellationSummaryDto> cancellations = new ArrayList<>();
        for (Showtime showtime : showtimes) {
            List<Seat> seats = seatRepository.findByShowtimeIdOrderBySeatRowAscSeatNumberAsc(showtime.getId());
            long showtimeBookedSeats = seats.stream().filter(seat -> seat.getStatus() == SeatStatus.BOOKED).count();
            totalSeats += seats.size();
            bookedSeats += showtimeBookedSeats;
            schedules.add(toSummary(showtime, seats.size(), showtimeBookedSeats));
            seatInventory.add(toSeatInventory(showtime, seats, showtimeBookedSeats));
            eventSeats.add(toEventSeatSummary(showtime, seats, showtimeBookedSeats));
            if (showtime.getStatus() == ShowtimeStatus.CANCELLED) {
                cancellations.add(new AdminCancellationSummaryDto(
                        "SHOWTIME",
                        showtime.getId(),
                        "Showtime #" + showtime.getId(),
                        showtime.getMovie().getTitle(),
                        null,
                        showtime.getStatus().name(),
                        ZERO,
                        "Showtime cancelled by admin.",
                        resolveShowtimeTimestamp(showtime)
                ));
            }
        }

        BigDecimal occupancyRate = totalSeats == 0
                ? ZERO
                : BigDecimal.valueOf(bookedSeats * 100.0 / totalSeats).setScale(2, RoundingMode.HALF_UP);

        List<AdminBookingSummaryDto> bookingSummaries = bookings.stream()
                .map(this::toBookingSummary)
                .toList();
        List<AdminPaymentSummaryDto> payments = bookings.stream()
                .map(this::toPaymentSummary)
                .toList();
        cancellations.addAll(bookings.stream()
                .filter(booking -> booking.getBookingStatus() == BookingStatus.CANCELLED
                        || booking.getPaymentStatus() == PaymentStatus.REFUNDED)
                .map(this::toBookingCancellationSummary)
                .toList());

        List<AdminCancellationSummaryDto> sortedCancellations = cancellations.stream()
                .sorted((left, right) -> right.updatedAt().compareTo(left.updatedAt()))
                .toList();

        return new AdminDashboardDto(
                new AdminAnalyticsDto(
                        totalBookings,
                        confirmedBookings,
                        cancelledBookings,
                        grossRevenue,
                        refundAmount,
                        occupancyRate
                ),
                events.stream().map(this::toEventSummary).toList(),
                venues.stream().map(this::toVenueSummary).toList(),
                seatInventory,
                schedules,
                eventSeats,
                bookingSummaries,
                users.stream().map(this::toUserSummary).toList(),
                payments,
                sortedCancellations
        );
    }

    @Override
    @Transactional
    public AdminShowtimeSummaryDto createShowtime(AdminCreateShowtimeRequestDto request) {
        if (request.vipRows() + request.premiumRows() > request.totalRows()) {
            throw new BadRequestException("VIP and premium rows cannot exceed total rows");
        }
        AllowedEventTypeGenre eventTypeGenre = resolveAllowedEventTypeGenre(request.eventType(), request.genre());

        Theater theater = theaterRepository.findByNameIgnoreCaseAndCityIgnoreCase(request.venueName(), request.city())
                .orElseGet(Theater::new);
        theater.setName(request.venueName().trim());
        theater.setCity(request.city().trim());
        theater.setAddressLine(request.addressLine().trim());
        theater.setVenueType(request.venueType());
        theater.setTotalRows(request.totalRows());
        theater.setSeatsPerRow(request.seatsPerRow());
        theater = theaterRepository.save(theater);

        Movie movie = movieRepository.save(Movie.builder()
                .title(request.title().trim())
                .description(request.description().trim())
                .eventType(eventTypeGenre.eventType())
                .genre(eventTypeGenre.genre())
                .language(request.language().trim())
                .durationMinutes(request.durationMinutes())
                .posterUrl(request.posterUrl())
                .bannerUrl(request.bannerUrl())
                .releaseDate(request.startTime().toLocalDate())
                .rating(request.rating().setScale(1, RoundingMode.HALF_UP))
                .basePrice(request.regularPrice().setScale(2, RoundingMode.HALF_UP))
                .castMembers(request.castMembers())
                .organizerName(request.organizerName())
                .ageRestriction(request.ageRestriction())
                .upcoming(true)
                .build());

        Showtime showtime = showtimeRepository.save(Showtime.builder()
                .movie(movie)
                .theater(theater)
                .startTime(request.startTime())
                .endTime(request.startTime().plusMinutes(request.durationMinutes()))
                .screenName(request.screenName().trim())
                .showFormat(request.showFormat().trim())
                .price(request.regularPrice().setScale(2, RoundingMode.HALF_UP))
                .status(ShowtimeStatus.SCHEDULED)
                .build());

        List<Seat> seats = createSeats(showtime, request);
        seatRepository.saveAll(seats);
        return toSummary(showtime, seats.size(), 0);
    }

    @Override
    @Transactional
    public void cancelShowtime(Long showtimeId, AdminCancelShowtimeRequestDto request) {
        Showtime showtime = showtimeRepository.findDetailedShowtimeById(showtimeId)
                .orElseThrow(() -> new ResourceNotFoundException("Showtime not found"));
        if (showtime.getStatus() == ShowtimeStatus.CANCELLED) {
            throw new BadRequestException("Showtime is already cancelled");
        }

        cancelShowtimeAndRefundBookings(showtime, request.reason().trim());
    }

    @Override
    @Transactional
    public void removeEvent(Long eventId, AdminRemoveEventRequestDto request) {
        Movie movie = movieRepository.findById(eventId)
                .orElseThrow(() -> new ResourceNotFoundException("Event not found"));

        List<Showtime> showtimes = showtimeRepository.findByMovieIdOrderByStartTimeDesc(eventId);
        String reason = request.reason().trim();
        for (Showtime showtime : showtimes) {
            if (showtime.getStatus() == ShowtimeStatus.CANCELLED) {
                continue;
            }
            cancelShowtimeAndRefundBookings(showtime, reason);
        }

        movie.setUpcoming(false);
    }

    @Override
    @Transactional(readOnly = true)
    public void sendTestEmail(AdminSendTestEmailRequestDto request) {
        emailNotificationService.sendTestEmail(request.email().trim(), "Admin");
    }

    @Override
    @Transactional
    public AdminUserSummaryDto createUser(AdminCreateUserRequestDto request, Long adminUserId) {
        String fullName = request.fullName().trim();
        String email = normalizeOptionalEmail(request.email());
        String phoneNumber = normalizeOptionalPhone(request.phoneNumber());
        validateAtLeastOneContact(email, phoneNumber);
        validateUniqueContacts(null, email, phoneNumber);

        OtpChannel preferredChannel = resolvePreferredChannel(request.preferredChannel(), email, phoneNumber, null);
        UserRole role = parseUserRole(request.role());
        AuthProvider authProvider = parseAuthProvider(request.authProvider(), AuthProvider.OTP);

        UserAccount userAccount = UserAccount.builder()
                .fullName(fullName)
                .email(email)
                .phoneNumber(phoneNumber)
                .preferredChannel(preferredChannel)
                .verified(Boolean.TRUE.equals(request.verified()))
                .authProvider(authProvider)
                .role(role)
                .build();

        return toUserSummary(userAccountRepository.save(userAccount));
    }

    @Override
    @Transactional
    public AdminUserSummaryDto updateUser(Long userId, AdminUpdateUserRequestDto request, Long adminUserId) {
        UserAccount userAccount = userAccountRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        String fullName = request.fullName().trim();
        String email = normalizeOptionalEmail(request.email());
        String phoneNumber = normalizeOptionalPhone(request.phoneNumber());
        validateAtLeastOneContact(email, phoneNumber);
        validateUniqueContacts(userId, email, phoneNumber);

        UserRole role = parseUserRole(request.role());
        if (adminUserId != null && adminUserId.equals(userId) && role != UserRole.ADMIN) {
            throw new BadRequestException("You cannot remove your own admin role");
        }
        if (userAccount.getRole() == UserRole.ADMIN && role != UserRole.ADMIN && userAccountRepository.countByRole(UserRole.ADMIN) <= 1) {
            throw new BadRequestException("At least one admin account must remain");
        }

        OtpChannel preferredChannel = resolvePreferredChannel(request.preferredChannel(), email, phoneNumber, userAccount.getPreferredChannel());
        AuthProvider authProvider = parseAuthProvider(request.authProvider(), userAccount.getAuthProvider());

        userAccount.setFullName(fullName);
        userAccount.setEmail(email);
        userAccount.setPhoneNumber(phoneNumber);
        userAccount.setVerified(Boolean.TRUE.equals(request.verified()));
        userAccount.setRole(role);
        userAccount.setAuthProvider(authProvider);
        userAccount.setPreferredChannel(preferredChannel);

        return toUserSummary(userAccountRepository.save(userAccount));
    }

    @Override
    @Transactional
    public void deleteUser(Long userId, Long adminUserId) {
        UserAccount userAccount = userAccountRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        if (adminUserId != null && adminUserId.equals(userId)) {
            throw new BadRequestException("You cannot delete your own account");
        }
        if (userAccount.getRole() == UserRole.ADMIN && userAccountRepository.countByRole(UserRole.ADMIN) <= 1) {
            throw new BadRequestException("At least one admin account must remain");
        }

        List<Booking> bookings = bookingRepository.findByUserAccountIdOrderByCreatedAtDesc(userId);
        if (!bookings.isEmpty()) {
            List<Seat> seatsToRelease = new ArrayList<>();
            for (Booking booking : bookings) {
                booking.getSeats().forEach(seat -> {
                    seat.setStatus(SeatStatus.AVAILABLE);
                    seat.setSelectedBySessionId(null);
                    seat.setSelectedByUserId(null);
                    seatsToRelease.add(seat);
                });
                booking.getSeats().clear();
            }

            if (!seatsToRelease.isEmpty()) {
                seatRepository.saveAll(seatsToRelease);
            }
            bookingRepository.saveAll(bookings);
            bookingRepository.deleteAll(bookings);
        }

        userNotificationRepository.deleteByUserAccountId(userId);
        otpVerificationRepository.deleteByUserAccountId(userId);
        userAccountRepository.delete(userAccount);
    }

    private void cancelShowtimeAndRefundBookings(Showtime showtime, String reason) {
        Long showtimeId = showtime.getId();
        showtime.setStatus(ShowtimeStatus.CANCELLED);
        List<Seat> seats = seatRepository.findByShowtimeIdOrderBySeatRowAscSeatNumberAsc(showtimeId);
        seats.forEach(seat -> {
            seat.setStatus(SeatStatus.AVAILABLE);
            seat.setSelectedBySessionId(null);
            seat.setSelectedByUserId(null);
        });
        seatRepository.saveAll(seats);

        List<Booking> bookings = bookingRepository.findByShowtimeIdAndBookingStatus(showtimeId, BookingStatus.CONFIRMED);
        for (Booking booking : bookings) {
            booking.setBookingStatus(BookingStatus.CANCELLED);
            booking.setRefundAmount(booking.getTotalAmount() != null ? booking.getTotalAmount() : ZERO);
            booking.setLastModifiedAt(LocalDateTime.now());
            if (booking.getPaymentStatus() == PaymentStatus.SUCCESS) {
                booking.setPaymentStatus(PaymentStatus.REFUNDED);
            }
            notificationService.notifyUser(
                    booking.getUserAccount().getId(),
                    NotificationType.EVENT_UPDATED,
                    "Event cancelled",
                    showtime.getMovie().getTitle() + " was cancelled. " + reason,
                    "/bookings"
            );
            if (booking.getRefundAmount() != null && booking.getRefundAmount().compareTo(ZERO) > 0) {
                notificationService.notifyUser(
                        booking.getUserAccount().getId(),
                        NotificationType.REFUND_INITIATED,
                        "Refund initiated",
                        "A refund for booking " + booking.getBookingReference() + " has been initiated.",
                        "/bookings"
                );
            }
        }
        bookingRepository.saveAll(bookings);
    }

    private List<Seat> createSeats(Showtime showtime, AdminCreateShowtimeRequestDto request) {
        List<Seat> seats = new ArrayList<>();
        BigDecimal regularPrice = request.regularPrice().setScale(2, RoundingMode.HALF_UP);
        BigDecimal premiumPrice = request.premiumPrice() != null
                ? request.premiumPrice().setScale(2, RoundingMode.HALF_UP)
                : regularPrice.add(new BigDecimal("120.00"));
        BigDecimal vipPrice = request.vipPrice() != null
                ? request.vipPrice().setScale(2, RoundingMode.HALF_UP)
                : regularPrice.add(new BigDecimal("240.00"));

        for (int rowIndex = 0; rowIndex < request.totalRows(); rowIndex++) {
            String row = String.valueOf((char) ('A' + rowIndex));
            SeatCategory seatCategory = rowIndex < request.vipRows()
                    ? SeatCategory.VIP
                    : rowIndex < request.vipRows() + request.premiumRows()
                    ? SeatCategory.PREMIUM
                    : SeatCategory.REGULAR;

            BigDecimal seatPrice = switch (seatCategory) {
                case VIP -> vipPrice;
                case PREMIUM -> premiumPrice;
                case REGULAR -> regularPrice;
            };

            for (int number = 1; number <= request.seatsPerRow(); number++) {
                seats.add(Seat.builder()
                        .showtime(showtime)
                        .seatRow(row)
                        .seatNumber(number)
                        .label(row + number)
                        .price(seatPrice)
                        .seatCategory(seatCategory)
                        .status(SeatStatus.AVAILABLE)
                        .build());
            }
        }
        return seats;
    }

    private AdminShowtimeSummaryDto toSummary(Showtime showtime, long totalSeats, long bookedSeats) {
        BigDecimal occupancyRate = totalSeats == 0
                ? ZERO
                : BigDecimal.valueOf(bookedSeats * 100.0 / totalSeats).setScale(2, RoundingMode.HALF_UP);

        return new AdminShowtimeSummaryDto(
                showtime.getId(),
                showtime.getMovie().getTitle(),
                showtime.getMovie().getEventType() != null ? showtime.getMovie().getEventType().name() : EventType.MOVIE.name(),
                showtime.getTheater().getName(),
                showtime.getTheater().getCity(),
                showtime.getScreenName(),
                showtime.getShowFormat(),
                showtime.getStartTime(),
                showtime.getEndTime(),
                showtime.getStatus().name(),
                showtime.getPrice(),
                totalSeats,
                bookedSeats,
                occupancyRate
        );
    }

    private AdminEventSummaryDto toEventSummary(Movie movie) {
        return new AdminEventSummaryDto(
                movie.getId(),
                movie.getTitle(),
                movie.getEventType() != null ? movie.getEventType().name() : EventType.MOVIE.name(),
                movie.getGenre(),
                movie.getLanguage(),
                movie.getDurationMinutes(),
                movie.getRating(),
                movie.getBasePrice(),
                movie.getOrganizerName(),
                movie.getAgeRestriction(),
                movie.getReleaseDate(),
                movie.isUpcoming()
        );
    }

    private AdminVenueSummaryDto toVenueSummary(Theater theater) {
        long totalConfiguredSeats = (long) theater.getTotalRows() * theater.getSeatsPerRow();
        return new AdminVenueSummaryDto(
                theater.getId(),
                theater.getName(),
                theater.getCity(),
                theater.getVenueType(),
                theater.getAddressLine(),
                theater.getTotalRows(),
                theater.getSeatsPerRow(),
                totalConfiguredSeats
        );
    }

    private AdminSeatInventoryDto toSeatInventory(Showtime showtime, List<Seat> seats, long bookedSeats) {
        long heldSeats = seats.stream().filter(seat -> seat.getStatus() == SeatStatus.SELECTED).count();
        long availableSeats = seats.stream().filter(seat -> seat.getStatus() == SeatStatus.AVAILABLE).count();
        BigDecimal lowestPrice = seats.stream()
                .map(Seat::getPrice)
                .min(BigDecimal::compareTo)
                .orElse(ZERO);
        BigDecimal highestPrice = seats.stream()
                .map(Seat::getPrice)
                .max(BigDecimal::compareTo)
                .orElse(ZERO);

        return new AdminSeatInventoryDto(
                showtime.getId(),
                showtime.getMovie().getTitle(),
                showtime.getTheater().getName(),
                showtime.getScreenName(),
                seats.size(),
                availableSeats,
                heldSeats,
                bookedSeats,
                lowestPrice,
                highestPrice
        );
    }

    private AdminEventSeatSummaryDto toEventSeatSummary(Showtime showtime, List<Seat> seats, long bookedSeats) {
        long vipSeats = seats.stream().filter(seat -> seat.getSeatCategory() == SeatCategory.VIP).count();
        long premiumSeats = seats.stream().filter(seat -> seat.getSeatCategory() == SeatCategory.PREMIUM).count();
        long regularSeats = seats.stream().filter(seat -> seat.getSeatCategory() == SeatCategory.REGULAR).count();
        BigDecimal occupancyRate = seats.isEmpty()
                ? ZERO
                : BigDecimal.valueOf(bookedSeats * 100.0 / seats.size()).setScale(2, RoundingMode.HALF_UP);

        return new AdminEventSeatSummaryDto(
                showtime.getId(),
                showtime.getMovie().getTitle(),
                showtime.getMovie().getEventType() != null ? showtime.getMovie().getEventType().name() : EventType.MOVIE.name(),
                showtime.getTheater().getName(),
                showtime.getScreenName(),
                vipSeats,
                premiumSeats,
                regularSeats,
                bookedSeats,
                seats.size(),
                occupancyRate
        );
    }

    private AdminBookingSummaryDto toBookingSummary(Booking booking) {
        return new AdminBookingSummaryDto(
                booking.getId(),
                booking.getBookingReference(),
                booking.getUserAccount().getFullName(),
                resolveCustomerContact(booking.getUserAccount()),
                booking.getShowtime().getMovie().getTitle(),
                joinSeatLabels(booking.getSeats()),
                booking.getBookingStatus().name(),
                booking.getPaymentStatus().name(),
                booking.getTotalAmount(),
                booking.getRefundAmount() != null ? booking.getRefundAmount() : ZERO,
                booking.getCreatedAt()
        );
    }

    private AdminUserSummaryDto toUserSummary(UserAccount userAccount) {
        return new AdminUserSummaryDto(
                userAccount.getId(),
                userAccount.getFullName(),
                userAccount.getEmail(),
                userAccount.getPhoneNumber(),
                userAccount.isVerified(),
                userAccount.getAuthProvider() != null ? userAccount.getAuthProvider().name() : "UNKNOWN",
                userAccount.getRole() != null ? userAccount.getRole().name() : "USER",
                userAccount.getCreatedAt()
        );
    }

    private AdminPaymentSummaryDto toPaymentSummary(Booking booking) {
        return new AdminPaymentSummaryDto(
                booking.getId(),
                booking.getBookingReference(),
                booking.getUserAccount().getFullName(),
                booking.getShowtime().getMovie().getTitle(),
                booking.getPaymentMethod() != null ? booking.getPaymentMethod().name() : "UNSPECIFIED",
                booking.getPaymentStatus().name(),
                booking.getTotalAmount(),
                booking.getRefundAmount() != null ? booking.getRefundAmount() : ZERO,
                booking.getRazorpayPaymentId() != null ? booking.getRazorpayPaymentId() : booking.getRazorpayOrderId(),
                resolveBookingTimestamp(booking)
        );
    }

    private AdminCancellationSummaryDto toBookingCancellationSummary(Booking booking) {
        BigDecimal refundAmount = booking.getRefundAmount() != null ? booking.getRefundAmount() : ZERO;
        return new AdminCancellationSummaryDto(
                "BOOKING",
                booking.getId(),
                booking.getBookingReference(),
                booking.getShowtime().getMovie().getTitle(),
                booking.getUserAccount().getFullName(),
                booking.getBookingStatus().name(),
                refundAmount,
                refundAmount.compareTo(ZERO) > 0 ? "Refund initiated for this cancellation." : "Booking cancelled without refund.",
                resolveBookingTimestamp(booking)
        );
    }

    private String resolveCustomerContact(UserAccount userAccount) {
        if (userAccount.getEmail() != null && !userAccount.getEmail().isBlank()) {
            return userAccount.getEmail();
        }
        if (userAccount.getPhoneNumber() != null && !userAccount.getPhoneNumber().isBlank()) {
            return userAccount.getPhoneNumber();
        }
        return "No contact";
    }

    private String joinSeatLabels(List<Seat> seats) {
        return seats.stream()
                .map(Seat::getLabel)
                .sorted()
                .collect(Collectors.joining(", "));
    }

    private LocalDateTime resolveBookingTimestamp(Booking booking) {
        if (booking.getLastModifiedAt() != null) {
            return booking.getLastModifiedAt();
        }
        if (booking.getUpdatedAt() != null) {
            return booking.getUpdatedAt();
        }
        return booking.getCreatedAt();
    }

    private LocalDateTime resolveShowtimeTimestamp(Showtime showtime) {
        if (showtime.getUpdatedAt() != null) {
            return showtime.getUpdatedAt();
        }
        return showtime.getCreatedAt();
    }

    private String normalizeOptionalEmail(String email) {
        if (email == null || email.isBlank()) {
            return null;
        }
        return email.trim().toLowerCase(Locale.ROOT);
    }

    private String normalizeOptionalPhone(String phoneNumber) {
        if (phoneNumber == null || phoneNumber.isBlank()) {
            return null;
        }
        String normalized = phoneNumber.replaceAll("[^\\d+]", "");
        if (normalized.isBlank()) {
            throw new BadRequestException("Phone number is invalid");
        }
        return normalized;
    }

    private void validateAtLeastOneContact(String email, String phoneNumber) {
        if ((email == null || email.isBlank()) && (phoneNumber == null || phoneNumber.isBlank())) {
            throw new BadRequestException("Either email or phone number is required");
        }
    }

    private void validateUniqueContacts(Long userId, String email, String phoneNumber) {
        if (email != null && !email.isBlank()) {
            Optional<UserAccount> byEmail = userAccountRepository.findByEmailIgnoreCase(email);
            if (byEmail.isPresent() && !byEmail.get().getId().equals(userId)) {
                throw new BadRequestException("Email is already linked to another account");
            }
        }
        if (phoneNumber != null && !phoneNumber.isBlank()) {
            Optional<UserAccount> byPhone = userAccountRepository.findByPhoneNumber(phoneNumber);
            if (byPhone.isPresent() && !byPhone.get().getId().equals(userId)) {
                throw new BadRequestException("Phone number is already linked to another account");
            }
        }
    }

    private OtpChannel resolvePreferredChannel(String preferredChannel, String email, String phoneNumber, OtpChannel fallbackChannel) {
        if (preferredChannel != null && !preferredChannel.isBlank()) {
            OtpChannel parsedChannel;
            try {
                parsedChannel = OtpChannel.valueOf(preferredChannel.trim().toUpperCase(Locale.ROOT));
            } catch (Exception exception) {
                throw new BadRequestException("Unsupported preferred channel");
            }

            if (parsedChannel == OtpChannel.EMAIL && (email == null || email.isBlank())) {
                throw new BadRequestException("Preferred channel EMAIL requires an email address");
            }
            if (parsedChannel == OtpChannel.MOBILE && (phoneNumber == null || phoneNumber.isBlank())) {
                throw new BadRequestException("Preferred channel MOBILE requires a phone number");
            }
            return parsedChannel;
        }

        if (email != null && !email.isBlank()) {
            return OtpChannel.EMAIL;
        }
        if (phoneNumber != null && !phoneNumber.isBlank()) {
            return OtpChannel.MOBILE;
        }
        if (fallbackChannel != null) {
            return fallbackChannel;
        }
        return OtpChannel.EMAIL;
    }

    private UserRole parseUserRole(String rawRole) {
        try {
            return UserRole.valueOf(rawRole.trim().toUpperCase(Locale.ROOT));
        } catch (Exception exception) {
            throw new BadRequestException("Unsupported user role");
        }
    }

    private AuthProvider parseAuthProvider(String rawProvider, AuthProvider fallback) {
        if (rawProvider == null || rawProvider.isBlank()) {
            return fallback != null ? fallback : AuthProvider.OTP;
        }
        try {
            return AuthProvider.valueOf(rawProvider.trim().toUpperCase(Locale.ROOT));
        } catch (Exception exception) {
            throw new BadRequestException("Unsupported auth provider");
        }
    }

    private EventType parseEventType(String rawEventType) {
        try {
            return EventType.valueOf(rawEventType.trim().toUpperCase(Locale.ROOT));
        } catch (Exception exception) {
            throw new BadRequestException("Unsupported event type");
        }
    }

    private AllowedEventTypeGenre resolveAllowedEventTypeGenre(String rawEventType, String rawGenre) {
        EventType eventType = parseEventType(rawEventType);
        String genre = normalizeGenre(rawGenre);
        if (eventType == EventType.MOVIE && genre.equalsIgnoreCase(MOVIES_GENRE)) {
            return new AllowedEventTypeGenre(EventType.MOVIE, MOVIES_GENRE);
        }
        if (eventType == EventType.CONCERT && genre.equalsIgnoreCase(CONCERTS_GENRE)) {
            return new AllowedEventTypeGenre(EventType.CONCERT, CONCERTS_GENRE);
        }
        if (eventType == EventType.EVENT && genre.equalsIgnoreCase(STAND_UP_COMEDY_SHOW_GENRE)) {
            return new AllowedEventTypeGenre(EventType.EVENT, STAND_UP_COMEDY_SHOW_GENRE);
        }
        throw new BadRequestException(ALLOWED_GENRES_ERROR);
    }

    private String normalizeGenre(String rawGenre) {
        if (rawGenre == null) {
            return "";
        }
        return rawGenre.trim().replaceAll("\\s+", " ");
    }

    private record AllowedEventTypeGenre(EventType eventType, String genre) {
    }
}
