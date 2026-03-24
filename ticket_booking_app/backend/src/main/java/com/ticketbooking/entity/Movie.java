package com.ticketbooking.entity;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "movies")
public class Movie {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String title;

    @Column(length = 4000)
    private String description;

    @Enumerated(EnumType.STRING)
    @Column(name = "event_type")
    private EventType eventType;

    @Column(nullable = false)
    private String genre;

    @Column(nullable = false)
    private String language;

    @Column(name = "duration_minutes", nullable = false)
    private Integer durationMinutes;

    @Column(name = "poster_url", length = 1000)
    private String posterUrl;

    @Column(name = "banner_url", length = 1000)
    private String bannerUrl;

    @Column(name = "release_date")
    private LocalDate releaseDate;

    @Column(nullable = false)
    private BigDecimal rating;

    @Column(name = "base_price", nullable = false)
    private BigDecimal basePrice;

    @Column(name = "cast_members", length = 1000)
    private String castMembers;

    @Column(name = "organizer_name")
    private String organizerName;

    @Column(name = "age_restriction")
    private String ageRestriction;

    @Column(nullable = false)
    private boolean upcoming;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;
}
