package com.ticketbooking.controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.ticketbooking.dto.discovery.HomeDiscoveryDto;
import com.ticketbooking.service.DiscoveryService;

import lombok.RequiredArgsConstructor;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/discovery")
public class DiscoveryController {

    private final DiscoveryService discoveryService;

    @GetMapping("/home")
    public HomeDiscoveryDto getHomeDiscovery() {
        return discoveryService.getHomeDiscovery();
    }
}
