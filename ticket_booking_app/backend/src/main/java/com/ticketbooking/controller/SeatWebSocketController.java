package com.ticketbooking.controller;

import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;

import com.ticketbooking.service.ShowtimeService;

import lombok.RequiredArgsConstructor;

@Controller
@RequiredArgsConstructor
public class SeatWebSocketController {

    private final ShowtimeService showtimeService;
    private final SimpMessagingTemplate messagingTemplate;

    @MessageMapping("/showtimes/{showtimeId}/snapshot")
    public void pushSnapshot(@DestinationVariable Long showtimeId) {
        messagingTemplate.convertAndSend(
                "/topic/showtimes/" + showtimeId + "/seats",
                showtimeService.getSeatMapUpdate(showtimeId)
        );
    }
}
