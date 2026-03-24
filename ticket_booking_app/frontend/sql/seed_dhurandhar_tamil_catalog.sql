-- Optional MySQL seed script for PulseSeats discovery data
-- Database: ticket_booking_app
-- Note: This seeds movies + showtimes for discovery/home listing.
-- Seat rows are not generated here.

START TRANSACTION;

INSERT INTO theaters (
    name,
    city,
    address_line,
    venue_type,
    total_rows,
    seats_per_row,
    created_at,
    updated_at
)
SELECT * FROM (
    SELECT 'PVR Grand Mall', 'Chennai', 'Velachery Main Road, Chennai', 'Multiplex', 8, 12, NOW(), NOW()
) AS payload
WHERE NOT EXISTS (
    SELECT 1 FROM theaters WHERE name = 'PVR Grand Mall' AND city = 'Chennai'
);

INSERT INTO theaters (
    name,
    city,
    address_line,
    venue_type,
    total_rows,
    seats_per_row,
    created_at,
    updated_at
)
SELECT * FROM (
    SELECT 'INOX City Centre', 'Coimbatore', 'Avinashi Road, Coimbatore', 'Multiplex', 7, 12, NOW(), NOW()
) AS payload
WHERE NOT EXISTS (
    SELECT 1 FROM theaters WHERE name = 'INOX City Centre' AND city = 'Coimbatore'
);

INSERT INTO movies (
    title,
    description,
    event_type,
    genre,
    language,
    duration_minutes,
    poster_url,
    banner_url,
    release_date,
    rating,
    base_price,
    cast_members,
    organizer_name,
    age_restriction,
    upcoming,
    created_at,
    updated_at
)
SELECT * FROM (
    SELECT
        'Dhurandhar: The Revenge',
        'A high-stakes action spy thriller set across multiple international locations.',
        'MOVIE',
        'Spy Action',
        'Hindi',
        158,
        'https://picsum.photos/seed/dhurandhar-2026/1200/675',
        'https://picsum.photos/seed/dhurandhar-2026-banner/1400/800',
        '2026-03-19',
        8.7,
        250.00,
        'Lead Cast TBD',
        'Dhar Pictures',
        'U/A 13+',
        TRUE,
        NOW(),
        NOW()
) AS payload
WHERE NOT EXISTS (
    SELECT 1 FROM movies WHERE title = 'Dhurandhar: The Revenge'
);

INSERT INTO movies (
    title,
    description,
    event_type,
    genre,
    language,
    duration_minutes,
    poster_url,
    banner_url,
    release_date,
    rating,
    base_price,
    cast_members,
    organizer_name,
    age_restriction,
    upcoming,
    created_at,
    updated_at
)
SELECT * FROM (
    SELECT
        'Thug Life',
        'A gritty gangster action drama.',
        'MOVIE',
        'Action Drama',
        'Tamil',
        162,
        'https://picsum.photos/seed/thug-life-2025/1200/675',
        'https://picsum.photos/seed/thug-life-2025-banner/1400/800',
        '2025-06-05',
        8.5,
        260.00,
        'Kamal Haasan, Silambarasan, Trisha',
        'Raaj Kamal Films',
        'U/A',
        TRUE,
        NOW(),
        NOW()
) AS payload
WHERE NOT EXISTS (
    SELECT 1 FROM movies WHERE title = 'Thug Life'
);

INSERT INTO movies (
    title,
    description,
    event_type,
    genre,
    language,
    duration_minutes,
    poster_url,
    banner_url,
    release_date,
    rating,
    base_price,
    cast_members,
    organizer_name,
    age_restriction,
    upcoming,
    created_at,
    updated_at
)
SELECT * FROM (
    SELECT
        'Dragon',
        'A coming-of-age entertainer with a college backdrop.',
        'MOVIE',
        'Comedy Drama',
        'Tamil',
        152,
        'https://picsum.photos/seed/dragon-2025/1200/675',
        'https://picsum.photos/seed/dragon-2025-banner/1400/800',
        '2025-02-21',
        8.2,
        200.00,
        'Pradeep Ranganathan, Kayadu Lohar',
        'AGS Entertainment',
        'U/A',
        TRUE,
        NOW(),
        NOW()
) AS payload
WHERE NOT EXISTS (
    SELECT 1 FROM movies WHERE title = 'Dragon'
);

INSERT INTO movies (
    title,
    description,
    event_type,
    genre,
    language,
    duration_minutes,
    poster_url,
    banner_url,
    release_date,
    rating,
    base_price,
    cast_members,
    organizer_name,
    age_restriction,
    upcoming,
    created_at,
    updated_at
)
SELECT * FROM (
    SELECT
        'Vidaamuyarchi',
        'An action thriller centered on a high-stakes rescue mission.',
        'MOVIE',
        'Action Thriller',
        'Tamil',
        150,
        'https://picsum.photos/seed/vidaamuyarchi-2025/1200/675',
        'https://picsum.photos/seed/vidaamuyarchi-2025-banner/1400/800',
        '2025-02-06',
        8.0,
        240.00,
        'Ajith Kumar, Trisha Krishnan',
        'Lyca Productions',
        'U/A',
        TRUE,
        NOW(),
        NOW()
) AS payload
WHERE NOT EXISTS (
    SELECT 1 FROM movies WHERE title = 'Vidaamuyarchi'
);

INSERT INTO showtimes (
    movie_id,
    theater_id,
    start_time,
    end_time,
    screen_name,
    show_format,
    price,
    status,
    created_at,
    updated_at
)
SELECT
    m.id,
    t.id,
    '2026-03-29 19:30:00',
    '2026-03-29 22:08:00',
    'Screen 1',
    'IMAX',
    260.00,
    'SCHEDULED',
    NOW(),
    NOW()
FROM movies m
JOIN theaters t ON t.name = 'PVR Grand Mall' AND t.city = 'Chennai'
WHERE m.title = 'Dhurandhar: The Revenge'
  AND NOT EXISTS (
    SELECT 1 FROM showtimes s
    WHERE s.movie_id = m.id
      AND s.theater_id = t.id
      AND s.start_time = '2026-03-29 19:30:00'
  );

INSERT INTO showtimes (
    movie_id,
    theater_id,
    start_time,
    end_time,
    screen_name,
    show_format,
    price,
    status,
    created_at,
    updated_at
)
SELECT
    m.id,
    t.id,
    '2026-03-30 19:00:00',
    '2026-03-30 21:42:00',
    'Screen 2',
    '2D',
    260.00,
    'SCHEDULED',
    NOW(),
    NOW()
FROM movies m
JOIN theaters t ON t.name = 'PVR Grand Mall' AND t.city = 'Chennai'
WHERE m.title = 'Thug Life'
  AND NOT EXISTS (
    SELECT 1 FROM showtimes s
    WHERE s.movie_id = m.id
      AND s.theater_id = t.id
      AND s.start_time = '2026-03-30 19:00:00'
  );

INSERT INTO showtimes (
    movie_id,
    theater_id,
    start_time,
    end_time,
    screen_name,
    show_format,
    price,
    status,
    created_at,
    updated_at
)
SELECT
    m.id,
    t.id,
    '2026-03-31 18:45:00',
    '2026-03-31 21:17:00',
    'Screen 1',
    '2D',
    220.00,
    'SCHEDULED',
    NOW(),
    NOW()
FROM movies m
JOIN theaters t ON t.name = 'INOX City Centre' AND t.city = 'Coimbatore'
WHERE m.title = 'Dragon'
  AND NOT EXISTS (
    SELECT 1 FROM showtimes s
    WHERE s.movie_id = m.id
      AND s.theater_id = t.id
      AND s.start_time = '2026-03-31 18:45:00'
  );

INSERT INTO showtimes (
    movie_id,
    theater_id,
    start_time,
    end_time,
    screen_name,
    show_format,
    price,
    status,
    created_at,
    updated_at
)
SELECT
    m.id,
    t.id,
    '2026-04-01 19:15:00',
    '2026-04-01 21:45:00',
    'Screen 3',
    '2D',
    240.00,
    'SCHEDULED',
    NOW(),
    NOW()
FROM movies m
JOIN theaters t ON t.name = 'INOX City Centre' AND t.city = 'Coimbatore'
WHERE m.title = 'Vidaamuyarchi'
  AND NOT EXISTS (
    SELECT 1 FROM showtimes s
    WHERE s.movie_id = m.id
      AND s.theater_id = t.id
      AND s.start_time = '2026-04-01 19:15:00'
  );

COMMIT;
