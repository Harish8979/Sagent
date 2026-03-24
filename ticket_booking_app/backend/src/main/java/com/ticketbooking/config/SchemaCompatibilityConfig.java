package com.ticketbooking.config;

import java.util.List;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.event.EventListener;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;

import lombok.RequiredArgsConstructor;

@Component
@RequiredArgsConstructor
public class SchemaCompatibilityConfig {

    private static final Logger log = LoggerFactory.getLogger(SchemaCompatibilityConfig.class);

    private final JdbcTemplate jdbcTemplate;

    @EventListener(ApplicationReadyEvent.class)
    public void alignLegacyEnumColumns() {
        ensureVarcharColumn("bookings", "booking_status", "VARCHAR(32) NOT NULL");
        ensureVarcharColumn("bookings", "payment_status", "VARCHAR(32) NOT NULL");
        ensureVarcharColumn("bookings", "payment_method", "VARCHAR(32) NULL");
        ensureVarcharColumn("user_notifications", "type", "VARCHAR(32) NOT NULL");
    }

    private void ensureVarcharColumn(String tableName, String columnName, String definition) {
        String dataType = jdbcTemplate.query(
                """
                SELECT DATA_TYPE
                FROM information_schema.columns
                WHERE table_schema = DATABASE()
                  AND table_name = ?
                  AND column_name = ?
                """,
                (resultSet, rowNum) -> resultSet.getString("DATA_TYPE"),
                tableName,
                columnName
        ).stream().findFirst().orElse(null);

        if (dataType == null || "varchar".equalsIgnoreCase(dataType)) {
            return;
        }

        if (!List.of("enum", "char", "text").contains(dataType.toLowerCase())) {
            log.warn("Skipping schema compatibility change for {}.{} because current type is {}", tableName, columnName, dataType);
            return;
        }

        String alterSql = "ALTER TABLE " + tableName + " MODIFY COLUMN " + columnName + " " + definition;
        jdbcTemplate.execute(alterSql);
        log.info("Adjusted legacy column {}.{} to {}", tableName, columnName, definition);
    }
}
