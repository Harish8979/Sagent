package com.ticketbooking.config;

import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

import org.springframework.context.event.EventListener;
import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;
import org.springframework.web.socket.messaging.SessionConnectEvent;
import org.springframework.web.socket.messaging.SessionDisconnectEvent;

import com.ticketbooking.service.ShowtimeService;

import lombok.RequiredArgsConstructor;

@Component
@RequiredArgsConstructor
public class WebSocketSessionTracker {

    private static final String CLIENT_SESSION_HEADER = "x-client-session-id";

    private final ShowtimeService showtimeService;
    private final Map<String, String> sessionToClientSession = new ConcurrentHashMap<>();

    @EventListener
    public void handleConnect(SessionConnectEvent event) {
        StompHeaderAccessor accessor = StompHeaderAccessor.wrap(event.getMessage());
        String simpSessionId = accessor.getSessionId();
        List<String> values = accessor.getNativeHeader(CLIENT_SESSION_HEADER);
        if (StringUtils.hasText(simpSessionId) && values != null && !values.isEmpty() && StringUtils.hasText(values.get(0))) {
            sessionToClientSession.put(simpSessionId, values.get(0));
        }
    }

    @EventListener
    public void handleDisconnect(SessionDisconnectEvent event) {
        String clientSessionId = sessionToClientSession.remove(event.getSessionId());
        if (StringUtils.hasText(clientSessionId)) {
            showtimeService.releaseAllSelectedSeatsForSession(clientSessionId);
        }
    }
}
