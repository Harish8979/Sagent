package com.ticketbooking.service.impl;

import java.time.LocalDateTime;
import java.util.Comparator;
import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.ticketbooking.dto.discovery.FeaturedMovieDto;
import com.ticketbooking.dto.discovery.HomeDiscoveryDto;
import com.ticketbooking.dto.discovery.PromoHighlightDto;
import com.ticketbooking.dto.discovery.UpcomingShowtimeDto;
import com.ticketbooking.entity.EventType;
import com.ticketbooking.entity.Movie;
import com.ticketbooking.entity.Showtime;
import com.ticketbooking.entity.ShowtimeStatus;
import com.ticketbooking.repository.MovieRepository;
import com.ticketbooking.repository.ShowtimeRepository;
import com.ticketbooking.service.DiscoveryService;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class DiscoveryServiceImpl implements DiscoveryService {

    private static final List<PromoHighlightDto> PROMO_HIGHLIGHTS = List.of(
            new PromoHighlightDto("WELCOME10", "First booking offer", "Save 10% on your first checkout with email, mobile, or social sign-in."),
            new PromoHighlightDto("GROUPSAVE", "Group booking bonus", "Unlock 15% off when you reserve four or more seats together."),
            new PromoHighlightDto("VIPPASS", "VIP upgrade", "Get an instant Rs.120 discount when your cart includes VIP seating."),
            new PromoHighlightDto("EARLYBIRD", "Early bird pricing", "Book more than 24 hours ahead and claim a 12% planner discount.")
    );

    private final MovieRepository movieRepository;
    private final ShowtimeRepository showtimeRepository;

    @Override
    @Transactional(readOnly = true)
    public HomeDiscoveryDto getHomeDiscovery() {
        List<FeaturedMovieDto> featuredMovies = movieRepository.findTop12ByUpcomingTrueOrderByReleaseDateAsc()
                .stream()
                .map(this::toFeaturedMovie)
                .toList();

        List<UpcomingShowtimeDto> upcomingShowtimes = showtimeRepository
                .findByStartTimeAfterAndStatusOrderByStartTimeAsc(LocalDateTime.now(), ShowtimeStatus.SCHEDULED)
                .stream()
                .map(this::toUpcomingShowtime)
                .toList();

        List<String> availableGenres = upcomingShowtimes.stream()
                .map(UpcomingShowtimeDto::genre)
                .filter(value -> value != null && !value.isBlank())
                .distinct()
                .sorted()
                .toList();

        List<String> availableCities = upcomingShowtimes.stream()
                .map(UpcomingShowtimeDto::city)
                .filter(value -> value != null && !value.isBlank())
                .distinct()
                .sorted(Comparator.naturalOrder())
                .toList();

        List<String> availableEventTypes = upcomingShowtimes.stream()
                .map(UpcomingShowtimeDto::eventType)
                .filter(value -> value != null && !value.isBlank())
                .distinct()
                .sorted()
                .toList();

        List<String> availableVenues = upcomingShowtimes.stream()
                .map(UpcomingShowtimeDto::theaterName)
                .filter(value -> value != null && !value.isBlank())
                .distinct()
                .sorted()
                .toList();

        List<String> availableDates = upcomingShowtimes.stream()
                .map(showtime -> showtime.startTime().toLocalDate().toString())

                .distinct()
                .sorted()
                .toList();

        return new HomeDiscoveryDto(
                featuredMovies,
                upcomingShowtimes,
                availableGenres,
                availableCities,
                availableEventTypes,
                availableVenues,
                availableDates,
                PROMO_HIGHLIGHTS
        );
    }

    private FeaturedMovieDto toFeaturedMovie(Movie movie) {
        return new FeaturedMovieDto(
                movie.getId(),
                movie.getTitle(),
                movie.getDescription(),
                resolveEventType(movie.getEventType()),
                movie.getGenre(),
                movie.getLanguage(),
                movie.getDurationMinutes(),
                movie.getRating(),
                movie.getPosterUrl(),
                movie.getBannerUrl(),
                movie.getReleaseDate(),
                movie.getBasePrice(),
                movie.getCastMembers(),
                movie.getOrganizerName(),
                movie.getAgeRestriction()
        );
    }

    private UpcomingShowtimeDto toUpcomingShowtime(Showtime showtime) {
        return new UpcomingShowtimeDto(
                showtime.getId(),
                showtime.getMovie().getId(),
                showtime.getMovie().getTitle(),
                resolveEventType(showtime.getMovie().getEventType()),
                showtime.getMovie().getGenre(),
                showtime.getMovie().getPosterUrl(),
                showtime.getTheater().getName(),
                showtime.getTheater().getCity(),
                showtime.getTheater().getVenueType(),
                showtime.getScreenName(),
                showtime.getShowFormat(),
                showtime.getStartTime(),
                showtime.getPrice(),
                showtime.getMovie().getRating(),
                showtime.getMovie().getDurationMinutes(),
                showtime.getMovie().getOrganizerName(),
                showtime.getMovie().getCastMembers(),
                showtime.getMovie().getAgeRestriction()
        );
    }

    private String resolveEventType(EventType eventType) {
        return eventType != null ? eventType.name() : EventType.MOVIE.name();
    }
}
