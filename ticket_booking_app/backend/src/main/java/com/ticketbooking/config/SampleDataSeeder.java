package com.ticketbooking.config;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import com.ticketbooking.entity.EventType;
import com.ticketbooking.entity.Movie;
import com.ticketbooking.entity.Seat;
import com.ticketbooking.entity.SeatCategory;
import com.ticketbooking.entity.SeatStatus;
import com.ticketbooking.entity.Showtime;
import com.ticketbooking.entity.ShowtimeStatus;
import com.ticketbooking.entity.Theater;
import com.ticketbooking.repository.MovieRepository;
import com.ticketbooking.repository.SeatRepository;
import com.ticketbooking.repository.ShowtimeRepository;
import com.ticketbooking.repository.TheaterRepository;

@Configuration
public class SampleDataSeeder {

    private static final List<CatalogSeed> INDIA_FOCUSED_CATALOG = List.of(
            entry(
                    movie(
                            "Dhurandhar: The Revenge",
                            "A globe-spanning spy thriller that pushes a covert Indian strike team into a race against time across hostile borders.",
                            EventType.MOVIE,
                            "Spy Action",
                            "Hindi",
                            158,
                            "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=900&q=80",
                            "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1400&q=80",
                            LocalDate.of(2026, 3, 19),
                            money("8.7"),
                            money("230.00"),
                            "Ranveer Singh, Sanjay Dutt, R. Madhavan",
                            "Dhar Pictures",
                            "U/A 13+"
                    ),
                    showtime(
                            "PVR Luxe BKC",
                            "Mumbai",
                            "Bandra Kurla Complex, Mumbai",
                            "Multiplex",
                            6,
                            10,
                            LocalDateTime.of(2026, 3, 19, 19, 30),
                            "Screen 1",
                            "IMAX",
                            money("260.00")
                    )
            ),
            entry(
                    movie(
                            "Satrangi Re by Sonu Nigam India Tour",
                            "Sonu Nigam brings a seven-colour concert concept to a large-format stage with romantic ballads, retro favourites, and arena-scale singalongs.",
                            EventType.CONCERT,
                            "Live Music",
                            "Hindi",
                            180,
                            "https://images.unsplash.com/photo-1501386761578-eac5c94b800a?auto=format&fit=crop&w=900&q=80",
                            "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?auto=format&fit=crop&w=1400&q=80",
                            LocalDate.of(2026, 3, 28),
                            money("9.2"),
                            money("1499.00"),
                            "Sonu Nigam",
                            "Sonu Nigam Live",
                            "5+"
                    ),
                    showtime(
                            "Delhi NCR Live Arena",
                            "Delhi NCR",
                            "Dwarka Expressway, Delhi NCR",
                            "Concert Ground",
                            7,
                            12,
                            LocalDateTime.of(2026, 3, 28, 19, 0),
                            "Main Stage",
                            "Live Concert",
                            money("1499.00")
                    )
            ),
            entry(
                    movie(
                            "Chak De India Tour 2026 - Salim-Sulaiman",
                            "A high-energy touring concert built around patriotic anthems, Bollywood favourites, Sufi textures, and a full live ensemble.",
                            EventType.CONCERT,
                            "Live Music",
                            "Hindi",
                            180,
                            "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=900&q=80",
                            "https://images.unsplash.com/photo-1503095396549-807759245b35?auto=format&fit=crop&w=1400&q=80",
                            LocalDate.of(2026, 3, 29),
                            money("8.9"),
                            money("899.00"),
                            "Salim Merchant, Sulaiman Merchant",
                            "Merchant Live",
                            "5+"
                    ),
                    showtime(
                            "Jaipur Exhibition Grounds",
                            "Jaipur",
                            "Tonk Road Exhibition District, Jaipur",
                            "Open Air Arena",
                            7,
                            12,
                            LocalDateTime.of(2026, 3, 29, 19, 0),
                            "Freedom Stage",
                            "Live Concert",
                            money("899.00")
                    )
            ),
            entry(
                    movie(
                            "Anuv Jain - Dastakhat India Tour 2026",
                            "An intimate multi-city concert built around acoustic storytelling, stripped-back arrangements, and crowd-favourite heartbreak anthems.",
                            EventType.CONCERT,
                            "Indie Pop",
                            "Hindi",
                            150,
                            "https://images.unsplash.com/photo-1516280440614-37939bbacd81?auto=format&fit=crop&w=900&q=80",
                            "https://images.unsplash.com/photo-1511379938547-c1f69419868d?auto=format&fit=crop&w=1400&q=80",
                            LocalDate.of(2026, 4, 4),
                            money("9.0"),
                            money("2500.00"),
                            "Anuv Jain",
                            "Dastakhat Live",
                            "5+"
                    ),
                    showtime(
                            "Good Shepherd Auditorium",
                            "Bengaluru",
                            "Museum Road, Bengaluru",
                            "Auditorium",
                            6,
                            11,
                            LocalDateTime.of(2026, 4, 4, 19, 30),
                            "Acoustic Hall",
                            "Live Concert",
                            money("2500.00")
                    )
            ),
            entry(
                    movie(
                            "VIR DAS - SOUNDS OF INDIA",
                            "A stand-up special that blends travel stories, political wit, and crowd work into a sharp live performance designed for touring auditoriums.",
                            EventType.EVENT,
                            "Stand-up Comedy",
                            "English",
                            120,
                            "https://images.unsplash.com/photo-1521334884684-d80222895322?auto=format&fit=crop&w=900&q=80",
                            "https://images.unsplash.com/photo-1509824227185-9c5a01ceba0d?auto=format&fit=crop&w=1400&q=80",
                            LocalDate.of(2026, 4, 12),
                            money("9.1"),
                            money("999.00"),
                            "Vir Das",
                            "Weirdass Comedy",
                            "16+"
                    ),
                    showtime(
                            "Good Shepherd Auditorium",
                            "Bengaluru",
                            "Museum Road, Bengaluru",
                            "Auditorium",
                            6,
                            11,
                            LocalDateTime.of(2026, 4, 12, 20, 0),
                            "Comedy Hall",
                            "Stand-up Special",
                            money("999.00")
                    )
            ),
            entry(
                    movie(
                            "Karthik Live",
                            "A soaring South Indian live-music night with film hits, orchestral interludes, and crowd-led singalongs across languages.",
                            EventType.CONCERT,
                            "Live Music",
                            "Tamil, Telugu, Malayalam",
                            150,
                            "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?auto=format&fit=crop&w=900&q=80",
                            "https://images.unsplash.com/photo-1498038432885-c6f3f1b912ee?auto=format&fit=crop&w=1400&q=80",
                            LocalDate.of(2026, 4, 18),
                            money("8.8"),
                            money("999.00"),
                            "Karthik",
                            "Karthik Live",
                            "5+"
                    ),
                    showtime(
                            "Phoenix Arena",
                            "Hyderabad",
                            "HITEC City Arts District, Hyderabad",
                            "Arena",
                            7,
                            12,
                            LocalDateTime.of(2026, 4, 18, 19, 30),
                            "Main Stage",
                            "Live Concert",
                            money("999.00")
                    )
            ),
            entry(
                    movie(
                            "Toxic",
                            "A stylised action saga following a feared fixer who returns to a broken empire, only to find every alliance rewritten by ambition.",
                            EventType.MOVIE,
                            "Action Thriller",
                            "Kannada, Hindi, Tamil, Telugu",
                            149,
                            "https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?auto=format&fit=crop&w=900&q=80",
                            "https://images.unsplash.com/photo-1518929458119-e5bf444c30f4?auto=format&fit=crop&w=1400&q=80",
                            LocalDate.of(2026, 6, 4),
                            money("9.1"),
                            money("250.00"),
                            "Yash",
                            "KVN Productions",
                            "U/A 16+"
                    ),
                    showtime(
                            "Orion Cinema",
                            "Bengaluru",
                            "Dr Rajkumar Road, Bengaluru",
                            "Multiplex",
                            6,
                            10,
                            LocalDateTime.of(2026, 6, 4, 19, 30),
                            "Screen 2",
                            "IMAX",
                            money("280.00")
                    )
            ),
            entry(
                    movie(
                            "Vvan - Force of the Forest",
                            "A folk thriller rooted in legends of the wilderness, where an ancient force and a missing-girl mystery collide in central India.",
                            EventType.MOVIE,
                            "Folk Thriller",
                            "Hindi",
                            145,
                            "https://images.unsplash.com/photo-1440404653325-ab127d49abc1?auto=format&fit=crop&w=900&q=80",
                            "https://images.unsplash.com/photo-1440404653325-ab127d49abc1?auto=format&fit=crop&w=1400&q=80",
                            LocalDate.of(2026, 6, 12),
                            money("8.5"),
                            money("220.00"),
                            "Sidharth Malhotra, Tamannaah Bhatia",
                            "Balaji Motion Pictures",
                            "U/A 16+"
                    ),
                    showtime(
                            "Prasads XL",
                            "Hyderabad",
                            "Necklace Road, Hyderabad",
                            "Multiplex",
                            6,
                            10,
                            LocalDateTime.of(2026, 6, 12, 18, 45),
                            "XL Screen",
                            "Dolby Atmos",
                            money("240.00")
                    )
            ),
            entry(
                    movie(
                            "Alpha",
                            "A spy-universe thriller led by field operatives navigating betrayals, stealth missions, and a high-stakes intel breach.",
                            EventType.MOVIE,
                            "Spy Action",
                            "Hindi",
                            146,
                            "https://images.unsplash.com/photo-1485846234645-a62644f84728?auto=format&fit=crop&w=900&q=80",
                            "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=1400&q=80",
                            LocalDate.of(2026, 7, 10),
                            money("8.6"),
                            money("240.00"),
                            "Alia Bhatt, Sharvari, Bobby Deol",
                            "Yash Raj Films",
                            "U/A 13+"
                    ),
                    showtime(
                            "PVR Luxe BKC",
                            "Mumbai",
                            "Bandra Kurla Complex, Mumbai",
                            "Multiplex",
                            6,
                            10,
                            LocalDateTime.of(2026, 7, 10, 20, 0),
                            "Screen 3",
                            "4DX",
                            money("270.00")
                    )
            ),
            entry(
                    movie(
                            "Battle of Galwan",
                            "A large-scale war drama recreating the emotion, endurance, and tactical pressure of one of the most talked-about border conflicts in recent history.",
                            EventType.MOVIE,
                            "War Drama",
                            "Hindi",
                            154,
                            "https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=900&q=80",
                            "https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?auto=format&fit=crop&w=1400&q=80",
                            LocalDate.of(2026, 8, 14),
                            money("8.4"),
                            money("230.00"),
                            "Salman Khan, Chitrangada Singh",
                            "Salman Khan Films",
                            "U/A 13+"
                    ),
                    showtime(
                            "Siri Fort Screens",
                            "Delhi",
                            "August Kranti Marg, Delhi",
                            "Cinema Hall",
                            5,
                            10,
                            LocalDateTime.of(2026, 8, 14, 18, 30),
                            "Audi 1",
                            "Dolby 7.1",
                            money("250.00")
                    )
            ),
            entry(
                    movie(
                            "Naagzilla",
                            "A fantasy entertainer that leans into myth, monsters, and broad comedy while following a hero trapped in a shapeshifting serpent legend.",
                            EventType.MOVIE,
                            "Fantasy Comedy",
                            "Hindi",
                            138,
                            "https://images.unsplash.com/photo-1478720568477-152d9b164e26?auto=format&fit=crop&w=900&q=80",
                            "https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?auto=format&fit=crop&w=1400&q=80",
                            LocalDate.of(2026, 8, 14),
                            money("8.3"),
                            money("210.00"),
                            "Kartik Aaryan",
                            "Dharma Productions",
                            "U/A 13+"
                    ),
                    showtime(
                            "Sathyam Grand",
                            "Chennai",
                            "Royapettah High Road, Chennai",
                            "Multiplex",
                            5,
                            10,
                            LocalDateTime.of(2026, 8, 14, 20, 15),
                            "Screen 4",
                            "Dolby 7.1",
                            money("230.00")
                    )
            ),
            entry(
                    movie(
                            "Ramayana Part 1",
                            "A large-format mythological epic that reimagines the opening movement of the Ramayana with massive scale, spectacle, and reverence.",
                            EventType.MOVIE,
                            "Mythological Epic",
                            "Hindi",
                            175,
                            "https://images.unsplash.com/photo-1514306191717-452ec28c7814?auto=format&fit=crop&w=900&q=80",
                            "https://images.unsplash.com/photo-1505685296765-3a2736de412f?auto=format&fit=crop&w=1400&q=80",
                            LocalDate.of(2026, 11, 8),
                            money("9.3"),
                            money("280.00"),
                            "Ranbir Kapoor, Sai Pallavi, Yash",
                            "Prime Focus Studios",
                            "U/A 13+"
                    ),
                    showtime(
                            "Orion Cinema",
                            "Bengaluru",
                            "Dr Rajkumar Road, Bengaluru",
                            "Multiplex",
                            6,
                            10,
                            LocalDateTime.of(2026, 11, 8, 18, 0),
                            "Screen 1",
                            "IMAX",
                            money("320.00")
                    )
            ),
            entry(
                    movie(
                            "SANAM LIVE INDIA TOUR",
                            "A touring pop-rock set filled with Hindi indie favourites, retro reinterpretations, and polished stadium-ready production.",
                            EventType.CONCERT,
                            "Pop Rock",
                            "Hindi",
                            150,
                            "https://images.unsplash.com/photo-1506157786151-b8491531f063?auto=format&fit=crop&w=900&q=80",
                            "https://images.unsplash.com/photo-1507874457470-272b3c8d8ee2?auto=format&fit=crop&w=1400&q=80",
                            LocalDate.of(2026, 11, 15),
                            money("8.8"),
                            money("900.00"),
                            "SANAM",
                            "SANAM Live",
                            "5+"
                    ),
                    showtime(
                            "Phoenix Arena",
                            "Pune",
                            "Koregaon Park Riverside, Pune",
                            "Arena",
                            7,
                            12,
                            LocalDateTime.of(2026, 11, 15, 19, 30),
                            "Main Stage",
                            "Live Concert",
                            money("900.00")
                    )
            )
    );

    @Bean
    CommandLineRunner seedSampleData(
            @Value("${app.seed-data:true}") boolean seedData,
            MovieRepository movieRepository,
            TheaterRepository theaterRepository,
            ShowtimeRepository showtimeRepository,
            SeatRepository seatRepository
    ) {
        return args -> {
            if (!seedData) {
                return;
            }

            for (CatalogSeed entry : INDIA_FOCUSED_CATALOG) {
                Movie movie = upsertMovie(movieRepository, entry.movie());
                Theater theater = upsertTheater(theaterRepository, entry.showtime());
                Showtime showtime = upsertShowtime(showtimeRepository, movie, theater, entry.showtime());
                if (seatRepository.findByShowtimeIdOrderBySeatRowAscSeatNumberAsc(showtime.getId()).isEmpty()) {
                    seatRepository.saveAll(createSeats(showtime, theater.getTotalRows(), theater.getSeatsPerRow(), showtime.getPrice()));
                }
            }
        };
    }

    private Movie upsertMovie(MovieRepository movieRepository, MovieSeed seed) {
        Movie movie = movieRepository.findByTitleIgnoreCase(seed.title()).orElseGet(Movie::new);
        movie.setTitle(seed.title());
        movie.setDescription(seed.description());
        movie.setEventType(seed.eventType());
        movie.setGenre(seed.genre());
        movie.setLanguage(seed.language());
        movie.setDurationMinutes(seed.durationMinutes());
        movie.setPosterUrl(seed.posterUrl());
        movie.setBannerUrl(seed.bannerUrl());
        movie.setReleaseDate(seed.releaseDate());
        movie.setRating(seed.rating());
        movie.setBasePrice(seed.basePrice());
        movie.setCastMembers(seed.castMembers());
        movie.setOrganizerName(seed.organizerName());
        movie.setAgeRestriction(seed.ageRestriction());
        movie.setUpcoming(true);
        return movieRepository.save(movie);
    }

    private Theater upsertTheater(TheaterRepository theaterRepository, ShowtimeSeed seed) {
        Theater theater = theaterRepository
                .findByNameIgnoreCaseAndCityIgnoreCase(seed.theaterName(), seed.city())
                .orElseGet(Theater::new);
        theater.setName(seed.theaterName());
        theater.setCity(seed.city());
        theater.setAddressLine(seed.addressLine());
        theater.setVenueType(seed.venueType());
        theater.setTotalRows(seed.totalRows());
        theater.setSeatsPerRow(seed.seatsPerRow());
        return theaterRepository.save(theater);
    }

    private Showtime upsertShowtime(
            ShowtimeRepository showtimeRepository,
            Movie movie,
            Theater theater,
            ShowtimeSeed seed
    ) {
        Showtime showtime = showtimeRepository
                .findByMovieIdAndTheaterIdAndStartTime(movie.getId(), theater.getId(), seed.startTime())
                .orElseGet(Showtime::new);
        showtime.setMovie(movie);
        showtime.setTheater(theater);
        showtime.setStartTime(seed.startTime());
        showtime.setEndTime(seed.startTime().plusMinutes(movie.getDurationMinutes()));
        showtime.setScreenName(seed.screenName());
        showtime.setShowFormat(seed.showFormat());
        showtime.setPrice(seed.price());
        showtime.setStatus(ShowtimeStatus.SCHEDULED);
        return showtimeRepository.save(showtime);
    }

    private List<Seat> createSeats(Showtime showtime, int totalRows, int seatsPerRow, BigDecimal basePrice) {
        List<Seat> seats = new ArrayList<>();
        for (int rowIndex = 0; rowIndex < totalRows; rowIndex++) {
            String row = String.valueOf((char) ('A' + rowIndex));
            SeatCategory seatCategory = rowIndex == 0
                    ? SeatCategory.VIP
                    : rowIndex <= 2
                    ? SeatCategory.PREMIUM
                    : SeatCategory.REGULAR;
            BigDecimal seatPrice = switch (seatCategory) {
                case VIP -> basePrice.add(new BigDecimal("180.00"));
                case PREMIUM -> basePrice.add(new BigDecimal("80.00"));
                case REGULAR -> basePrice;
            };
            for (int number = 1; number <= seatsPerRow; number++) {
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

    private static CatalogSeed entry(MovieSeed movie, ShowtimeSeed showtime) {
        return new CatalogSeed(movie, showtime);
    }

    private static MovieSeed movie(
            String title,
            String description,
            EventType eventType,
            String genre,
            String language,
            Integer durationMinutes,
            String posterUrl,
            String bannerUrl,
            LocalDate releaseDate,
            BigDecimal rating,
            BigDecimal basePrice,
            String castMembers,
            String organizerName,
            String ageRestriction
    ) {
        return new MovieSeed(
                title,
                description,
                eventType,
                genre,
                language,
                durationMinutes,
                posterUrl,
                bannerUrl,
                releaseDate,
                rating,
                basePrice,
                castMembers,
                organizerName,
                ageRestriction
        );
    }

    private static ShowtimeSeed showtime(
            String theaterName,
            String city,
            String addressLine,
            String venueType,
            Integer totalRows,
            Integer seatsPerRow,
            LocalDateTime startTime,
            String screenName,
            String showFormat,
            BigDecimal price
    ) {
        return new ShowtimeSeed(
                theaterName,
                city,
                addressLine,
                venueType,
                totalRows,
                seatsPerRow,
                startTime,
                screenName,
                showFormat,
                price
        );
    }

    private static BigDecimal money(String value) {
        return new BigDecimal(value);
    }

    private record CatalogSeed(MovieSeed movie, ShowtimeSeed showtime) {
    }

    private record MovieSeed(
            String title,
            String description,
            EventType eventType,
            String genre,
            String language,
            Integer durationMinutes,
            String posterUrl,
            String bannerUrl,
            LocalDate releaseDate,
            BigDecimal rating,
            BigDecimal basePrice,
            String castMembers,
            String organizerName,
            String ageRestriction
    ) {
    }

    private record ShowtimeSeed(
            String theaterName,
            String city,
            String addressLine,
            String venueType,
            Integer totalRows,
            Integer seatsPerRow,
            LocalDateTime startTime,
            String screenName,
            String showFormat,
            BigDecimal price
    ) {
    }
}
