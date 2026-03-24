package com.ticketbooking.service.impl;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.Instant;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Locale;
import java.util.Set;

import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import com.ticketbooking.dto.booking.BookingReviewDto;
import com.ticketbooking.dto.booking.BookingReviewRequestDto;
import com.ticketbooking.dto.booking.BookingSummaryDto;
import com.ticketbooking.dto.booking.ConfirmBookingRequestDto;
import com.ticketbooking.dto.showtime.SeatDto;
import com.ticketbooking.dto.showtime.SeatMapUpdateDto;
import com.ticketbooking.entity.Booking;
import com.ticketbooking.entity.BookingStatus;
import com.ticketbooking.entity.EventType;
import com.ticketbooking.entity.NotificationType;
import com.ticketbooking.entity.PaymentMethod;
import com.ticketbooking.entity.PaymentStatus;
import com.ticketbooking.entity.Seat;
import com.ticketbooking.entity.SeatCategory;
import com.ticketbooking.entity.SeatStatus;
import com.ticketbooking.entity.Showtime;
import com.ticketbooking.entity.ShowtimeStatus;
import com.ticketbooking.entity.UserAccount;
import com.ticketbooking.exception.BadRequestException;
import com.ticketbooking.exception.ResourceNotFoundException;
import com.ticketbooking.exception.SeatUnavailableException;
import com.ticketbooking.repository.BookingRepository;
import com.ticketbooking.repository.SeatRepository;
import com.ticketbooking.repository.ShowtimeRepository;
import com.ticketbooking.repository.UserAccountRepository;
import com.ticketbooking.service.BookingService;
import com.ticketbooking.service.EmailNotificationService;
import com.ticketbooking.service.NotificationService;
import com.ticketbooking.service.RazorpayService;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class BookingServiceImpl implements BookingService {

    private static final BigDecimal CONVENIENCE_FEE_RATE = new BigDecimal("0.05");
    private static final BigDecimal ZERO = new BigDecimal("0.00");

    private final BookingRepository bookingRepository;
    private final ShowtimeRepository showtimeRepository;
    private final SeatRepository seatRepository;
    private final UserAccountRepository userAccountRepository;
    private final RazorpayService razorpayService;
    private final NotificationService notificationService;
    private final EmailNotificationService emailNotificationService;
    private final SimpMessagingTemplate messagingTemplate;

    @Override
    @Transactional
    public BookingReviewDto createBookingReview(Long userId, BookingReviewRequestDto request) {
        validateClientSession(request.clientSessionId());
        UserAccount userAccount = getUser(userId);
        Showtime showtime = getBookableShowtime(request.showtimeId());
        List<Seat> seats = getLockedSeats(showtime.getId(), request.seatIds());
        validateSelectedSeats(seats, request.clientSessionId(), userAccount.getId());

        if (request.existingBookingId() != null) {
            getModifiableBooking(userId, request.existingBookingId());
        }

        BigDecimal subtotal = calculateSubtotal(seats);
        PromoResult promoResult = applyPromo(request.promoCode(), subtotal, seats, showtime);
        BigDecimal convenienceFee = calculateConvenienceFee(subtotal);
        BigDecimal totalAmount = calculateTotal(subtotal, promoResult.discountAmount(), convenienceFee);

        RazorpayService.RazorpayOrder order = razorpayService.createOrder(
                totalAmount,
                "showtime-" + showtime.getId() + "-user-" + userAccount.getId()
        );

        return new BookingReviewDto(
                showtime.getId(),
                showtime.getMovie().getTitle(),
                resolveEventType(showtime),
                showtime.getTheater().getName(),
                showtime.getTheater().getCity(),
                showtime.getScreenName(),
                showtime.getShowFormat(),
                showtime.getStartTime(),
                mapSeatLabels(seats),
                subtotal,
                promoResult.discountAmount(),
                convenienceFee,
                totalAmount,
                order.orderId(),
                promoResult.code(),
                promoResult.description(),
                request.existingBookingId() != null
        );
    }

    @Override
    @Transactional
    public BookingSummaryDto confirmBooking(Long userId, ConfirmBookingRequestDto request) {
        validateClientSession(request.clientSessionId());
        UserAccount userAccount = getUser(userId);
        Showtime showtime = getBookableShowtime(request.showtimeId());
        List<Seat> seats = getLockedSeats(showtime.getId(), request.seatIds());
        validateSelectedSeats(seats, request.clientSessionId(), userAccount.getId());

        Booking existingBooking = request.existingBookingId() != null
                ? getModifiableBooking(userId, request.existingBookingId())
                : null;

        BigDecimal subtotal = calculateSubtotal(seats);
        PromoResult promoResult = applyPromo(request.promoCode(), subtotal, seats, showtime);
        BigDecimal convenienceFee = calculateConvenienceFee(subtotal);
        BigDecimal totalAmount = calculateTotal(subtotal, promoResult.discountAmount(), convenienceFee);
        PaymentMethod paymentMethod = parsePaymentMethod(request.paymentMethod());

        String paymentReference = paymentMethod == PaymentMethod.CASH_AT_VENUE
                ? "venue_" + Instant.now().toEpochMilli()
                : razorpayService.capturePayment(request.paymentOrderId(), request.paymentReferenceId());
        PaymentStatus paymentStatus = paymentMethod == PaymentMethod.CASH_AT_VENUE
                ? PaymentStatus.INITIATED
                : PaymentStatus.SUCCESS;

        seats.forEach(seat -> {
            seat.setStatus(SeatStatus.BOOKED);
            seat.setSelectedBySessionId(null);
            seat.setSelectedByUserId(null);
        });
        seatRepository.saveAll(seats);

        Long previousShowtimeId = null;
        Booking booking;
        BigDecimal refundAmount = ZERO;
        if (existingBooking != null) {
            previousShowtimeId = existingBooking.getShowtime().getId();
            List<Seat> previousSeats = new ArrayList<>(existingBooking.getSeats());
            previousSeats.forEach(this::releaseBookedSeat);
            seatRepository.saveAll(previousSeats);

            BigDecimal previousTotal = safeAmount(existingBooking.getTotalAmount());
            refundAmount = previousTotal.compareTo(totalAmount) > 0
                    ? previousTotal.subtract(totalAmount).setScale(2, RoundingMode.HALF_UP)
                    : ZERO;

            existingBooking.setShowtime(showtime);
            existingBooking.setSeats(new ArrayList<>(seats));
            existingBooking.setSubtotalAmount(subtotal);
            existingBooking.setDiscountAmount(promoResult.discountAmount());
            existingBooking.setTotalAmount(totalAmount);
            existingBooking.setRefundAmount(refundAmount);
            existingBooking.setBookingStatus(BookingStatus.CONFIRMED);
            existingBooking.setPaymentStatus(paymentStatus);
            existingBooking.setPaymentMethod(paymentMethod);
            existingBooking.setPromoCode(promoResult.code());
            existingBooking.setRazorpayOrderId(request.paymentOrderId());
            existingBooking.setRazorpayPaymentId(paymentReference);
            existingBooking.setLastModifiedAt(LocalDateTime.now());
            booking = bookingRepository.save(existingBooking);

            notificationService.notifyUser(
                    userId,
                    NotificationType.BOOKING_UPDATED,
                    "Booking updated",
                    "Your reservation for " + showtime.getMovie().getTitle() + " has been updated successfully.",
                    "/bookings"
            );
        } else {
            booking = bookingRepository.save(Booking.builder()
                    .userAccount(userAccount)
                    .showtime(showtime)
                    .bookingReference("TB-" + Instant.now().toEpochMilli())
                    .subtotalAmount(subtotal)
                    .discountAmount(promoResult.discountAmount())
                    .totalAmount(totalAmount)
                    .refundAmount(ZERO)
                    .bookingStatus(BookingStatus.CONFIRMED)
                    .paymentStatus(paymentStatus)
                    .paymentMethod(paymentMethod)
                    .promoCode(promoResult.code())
                    .razorpayOrderId(request.paymentOrderId())
                    .razorpayPaymentId(paymentReference)
                    .lastModifiedAt(LocalDateTime.now())
                    .seats(new ArrayList<>(seats))
                    .build());

            notificationService.notifyUser(
                    userId,
                    NotificationType.BOOKING_CONFIRMED,
                    "Booking confirmed",
                    "Your seats for " + showtime.getMovie().getTitle() + " are confirmed.",
                    "/bookings"
            );
        }

        if (refundAmount.compareTo(ZERO) > 0) {
            notificationService.notifyUser(
                    userId,
                    NotificationType.REFUND_INITIATED,
                    "Refund initiated",
                    "A refund of Rs." + refundAmount + " has been initiated for your updated booking.",
                    "/bookings"
            );
        }

        if (previousShowtimeId != null && !previousShowtimeId.equals(showtime.getId())) {
            publishSeatMap(previousShowtimeId);
        }
        publishSeatMap(showtime.getId());

        // Booking should succeed even if external email delivery fails.
        emailNotificationService.sendBookingConfirmation(userAccount, booking);
        return toBookingSummary(booking);
    }

    @Override
    @Transactional(readOnly = true)
    public List<BookingSummaryDto> getBookingsForUser(Long userId) {
        getUser(userId);
        return bookingRepository.findByUserAccountIdOrderByCreatedAtDesc(userId)
                .stream()
                .map(this::toBookingSummary)
                .toList();
    }

    @Override
    @Transactional
    public BookingSummaryDto cancelBooking(Long userId, Long bookingId) {
        Booking booking = getUserBooking(userId, bookingId);
        if (booking.getBookingStatus() != BookingStatus.CONFIRMED) {
            throw new BadRequestException("Only confirmed bookings can be cancelled");
        }
        if (!canCancel(booking)) {
            throw new BadRequestException("This booking is no longer eligible for cancellation");
        }

        BigDecimal refundAmount = calculateRefundAmount(booking);
        booking.setBookingStatus(BookingStatus.CANCELLED);
        booking.setRefundAmount(refundAmount);
        booking.setLastModifiedAt(LocalDateTime.now());
        if (booking.getPaymentStatus() == PaymentStatus.SUCCESS && refundAmount.compareTo(ZERO) >= 0) {
            booking.setPaymentStatus(PaymentStatus.REFUNDED);
        }

        List<Seat> seats = booking.getSeats();
        seats.forEach(this::releaseBookedSeat);
        seatRepository.saveAll(seats);
        Booking savedBooking = bookingRepository.save(booking);

        notificationService.notifyUser(
                userId,
                NotificationType.BOOKING_CANCELLED,
                "Booking cancelled",
                "Your reservation for " + booking.getShowtime().getMovie().getTitle() + " has been cancelled.",
                "/bookings"
        );
        if (refundAmount.compareTo(ZERO) > 0) {
            notificationService.notifyUser(
                    userId,
                    NotificationType.REFUND_INITIATED,
                    "Refund initiated",
                    "A refund of Rs." + refundAmount + " will be processed based on the cancellation policy.",
                    "/bookings"
            );
        }

        publishSeatMap(booking.getShowtime().getId());
        return toBookingSummary(savedBooking);
    }

    private UserAccount getUser(Long userId) {
        return userAccountRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
    }

    private Showtime getBookableShowtime(Long showtimeId) {
        Showtime showtime = getShowtime(showtimeId);
        if (showtime.getStatus() != ShowtimeStatus.SCHEDULED) {
            throw new BadRequestException("This showtime is not available for bookings");
        }
        return showtime;
    }

    private Showtime getShowtime(Long showtimeId) {
        return showtimeRepository.findDetailedShowtimeById(showtimeId)
                .orElseThrow(() -> new ResourceNotFoundException("Showtime not found"));
    }

    private List<Seat> getLockedSeats(Long showtimeId, List<Long> seatIds) {
        Set<Long> uniqueSeatIds = new LinkedHashSet<>(seatIds);
        List<Seat> seats = seatRepository.findAllByShowtimeIdAndIdInForUpdate(showtimeId, uniqueSeatIds);
        if (seats.size() != uniqueSeatIds.size()) {
            throw new ResourceNotFoundException("One or more seats could not be found");
        }
        return seats;
    }

    private Booking getUserBooking(Long userId, Long bookingId) {
        return bookingRepository.findByIdAndUserAccountId(bookingId, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Booking not found"));
    }

    private Booking getModifiableBooking(Long userId, Long bookingId) {
        Booking booking = getUserBooking(userId, bookingId);
        if (!canModify(booking)) {
            throw new BadRequestException("This booking can no longer be modified");
        }
        return booking;
    }

    private void validateSelectedSeats(List<Seat> seats, String clientSessionId, Long userId) {
        for (Seat seat : seats) {
            if (seat.getStatus() == SeatStatus.BOOKED) {
                throw new SeatUnavailableException("Seat " + seat.getLabel() + " is already booked");
            }
            if (seat.getStatus() != SeatStatus.SELECTED || !clientSessionId.equals(seat.getSelectedBySessionId())) {
                throw new SeatUnavailableException("Seat " + seat.getLabel() + " is no longer held by your session");
            }
            if (seat.getSelectedByUserId() != null && !seat.getSelectedByUserId().equals(userId)) {
                throw new SeatUnavailableException("Seat " + seat.getLabel() + " is held by another user");
            }
        }
    }

    private BigDecimal calculateSubtotal(List<Seat> seats) {
        return seats.stream()
                .map(Seat::getPrice)
                .reduce(BigDecimal.ZERO, BigDecimal::add)
                .setScale(2, RoundingMode.HALF_UP);
    }

    private PromoResult applyPromo(String rawPromoCode, BigDecimal subtotal, List<Seat> seats, Showtime showtime) {
        if (!StringUtils.hasText(rawPromoCode)) {
            return new PromoResult(null, null, ZERO);
        }

        String code = rawPromoCode.trim().toUpperCase(Locale.ROOT);
        BigDecimal discount;
        String description;
        switch (code) {
            case "WELCOME10" -> {
                discount = subtotal.multiply(new BigDecimal("0.10"));
                description = "10% off welcome reward";
            }
            case "GROUPSAVE" -> {
                if (seats.size() < 4) {
                    throw new BadRequestException("GROUPSAVE requires at least four seats");
                }
                discount = subtotal.multiply(new BigDecimal("0.15"));
                description = "15% off group booking";
            }
            case "VIPPASS" -> {
                boolean hasVipSeat = seats.stream().anyMatch(seat -> seat.getSeatCategory() == SeatCategory.VIP);
                if (!hasVipSeat) {
                    throw new BadRequestException("VIPPASS applies only when a VIP seat is selected");
                }
                discount = new BigDecimal("120.00");
                description = "Rs.120 VIP access discount";
            }
            case "EARLYBIRD" -> {
                if (showtime.getStartTime().isBefore(LocalDateTime.now().plusHours(24))) {
                    throw new BadRequestException("EARLYBIRD is available only for events more than 24 hours away");
                }
                discount = subtotal.multiply(new BigDecimal("0.12"));
                description = "12% off early planner offer";
            }
            default -> throw new BadRequestException("Promo code not recognized");
        }

        return new PromoResult(code, description, discount.min(subtotal).setScale(2, RoundingMode.HALF_UP));
    }

    private BigDecimal calculateConvenienceFee(BigDecimal subtotal) {
        return subtotal.multiply(CONVENIENCE_FEE_RATE).setScale(2, RoundingMode.HALF_UP);
    }

    private BigDecimal calculateTotal(BigDecimal subtotal, BigDecimal discountAmount, BigDecimal convenienceFee) {
        return subtotal
                .subtract(discountAmount)
                .add(convenienceFee)
                .max(BigDecimal.ZERO)
                .setScale(2, RoundingMode.HALF_UP);
    }

    private List<String> mapSeatLabels(List<Seat> seats) {
        return seats.stream()
                .map(Seat::getLabel)
                .sorted()
                .toList();
    }

    private BookingSummaryDto toBookingSummary(Booking booking) {
        return new BookingSummaryDto(
                booking.getId(),
                booking.getBookingReference(),
                booking.getShowtime().getId(),
                booking.getShowtime().getMovie().getTitle(),
                resolveEventType(booking.getShowtime()),
                booking.getShowtime().getTheater().getName(),
                booking.getShowtime().getTheater().getCity(),
                booking.getShowtime().getScreenName(),
                booking.getShowtime().getStartTime(),
                booking.getShowtime().getEndTime(),
                booking.getSeats().stream().map(Seat::getLabel).sorted().toList(),
                safeAmount(booking.getSubtotalAmount()),
                safeAmount(booking.getDiscountAmount()),
                safeAmount(booking.getTotalAmount()),
                safeAmount(booking.getRefundAmount()),
                booking.getBookingStatus().name(),
                booking.getPaymentStatus().name(),
                booking.getPaymentMethod() != null ? booking.getPaymentMethod().name() : PaymentMethod.CARD.name(),
                booking.getRazorpayOrderId(),
                booking.getRazorpayPaymentId(),
                booking.getPromoCode(),
                canCancel(booking),
                canModify(booking),
                determineTimingCategory(booking),
                booking.getCreatedAt()
        );
    }

    private PaymentMethod parsePaymentMethod(String rawPaymentMethod) {
        try {
            return PaymentMethod.valueOf(rawPaymentMethod.trim().toUpperCase(Locale.ROOT));
        } catch (Exception exception) {
            throw new BadRequestException("Unsupported payment method");
        }
    }

    private boolean canCancel(Booking booking) {
        return booking.getBookingStatus() == BookingStatus.CONFIRMED
                && booking.getShowtime().getStartTime().isAfter(LocalDateTime.now().plusHours(1));
    }

    private boolean canModify(Booking booking) {
        return booking.getBookingStatus() == BookingStatus.CONFIRMED
                && booking.getShowtime().getStartTime().isAfter(LocalDateTime.now().plusHours(1));
    }

    private BigDecimal calculateRefundAmount(Booking booking) {
        LocalDateTime startTime = booking.getShowtime().getStartTime();
        BigDecimal totalAmount = safeAmount(booking.getTotalAmount());
        if (startTime.isAfter(LocalDateTime.now().plusHours(24))) {
            return totalAmount;
        }
        if (startTime.isAfter(LocalDateTime.now().plusHours(2))) {
            return totalAmount.multiply(new BigDecimal("0.50")).setScale(2, RoundingMode.HALF_UP);
        }
        return totalAmount.multiply(new BigDecimal("0.25")).setScale(2, RoundingMode.HALF_UP);
    }

    private String determineTimingCategory(Booking booking) {
        if (booking.getBookingStatus() == BookingStatus.CANCELLED) {
            return "CANCELLED";
        }
        LocalDateTime now = LocalDateTime.now();
        if (now.isBefore(booking.getShowtime().getStartTime())) {
            return "UPCOMING";
        }
        if (now.isBefore(booking.getShowtime().getEndTime())) {
            return "CURRENT";
        }
        return "PAST";
    }

    private void validateClientSession(String clientSessionId) {
        if (!StringUtils.hasText(clientSessionId)) {
            throw new BadRequestException("Client session id is required");
        }
    }

    private void releaseBookedSeat(Seat seat) {
        seat.setStatus(SeatStatus.AVAILABLE);
        seat.setSelectedBySessionId(null);
        seat.setSelectedByUserId(null);
    }

    private void publishSeatMap(Long showtimeId) {
        List<SeatDto> seats = seatRepository.findByShowtimeIdOrderBySeatRowAscSeatNumberAsc(showtimeId)
                .stream()
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

        messagingTemplate.convertAndSend(
                "/topic/showtimes/" + showtimeId + "/seats",
                new SeatMapUpdateDto(showtimeId, Instant.now(), seats)
        );
    }

    private BigDecimal safeAmount(BigDecimal value) {
        return value != null ? value.setScale(2, RoundingMode.HALF_UP) : ZERO;
    }

    private String resolveEventType(Showtime showtime) {
        return showtime.getMovie().getEventType() != null
                ? showtime.getMovie().getEventType().name()
                : EventType.MOVIE.name();
    }

    private record PromoResult(String code, String description, BigDecimal discountAmount) {
    }
}
