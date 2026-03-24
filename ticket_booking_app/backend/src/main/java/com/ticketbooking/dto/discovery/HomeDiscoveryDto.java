package com.ticketbooking.dto.discovery;

import java.util.List;

public record HomeDiscoveryDto(
        List<FeaturedMovieDto> featuredMovies,
        List<UpcomingShowtimeDto> upcomingShowtimes,
        List<String> availableGenres,
        List<String> availableCities,
        List<String> availableEventTypes,
        List<String> availableVenues,
        List<String> availableDates,
        List<PromoHighlightDto> promoHighlights
) {
}
