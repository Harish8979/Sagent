package com.ticketbooking.service;

import java.util.List;

import com.ticketbooking.dto.booking.BookingReviewDto;
import com.ticketbooking.dto.booking.BookingReviewRequestDto;
import com.ticketbooking.dto.booking.BookingSummaryDto;
import com.ticketbooking.dto.booking.ConfirmBookingRequestDto;

public interface BookingService {

    BookingReviewDto createBookingReview(Long userId, BookingReviewRequestDto request);

    BookingSummaryDto confirmBooking(Long userId, ConfirmBookingRequestDto request);

    List<BookingSummaryDto> getBookingsForUser(Long userId);

    BookingSummaryDto cancelBooking(Long userId, Long bookingId);
}
