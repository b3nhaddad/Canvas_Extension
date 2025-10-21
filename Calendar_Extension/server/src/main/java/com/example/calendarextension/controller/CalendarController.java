package com.example.calendarextension.controller;

import com.example.calendarextension.service.GoogleCalendarService;
import com.google.api.services.calendar.model.Event;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.view.RedirectView;

import java.io.IOException;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@CrossOrigin(origins = "*") // Allow Chrome extension to access
public class CalendarController {

    @Autowired
    private GoogleCalendarService calendarService;

    // Check if user is authenticated
    @GetMapping("/auth-status")
    public ResponseEntity<Map<String, Boolean>> getAuthStatus() {
        Map<String, Boolean> response = new HashMap<>();
        response.put("authenticated", calendarService.isAuthenticated());
        return ResponseEntity.ok(response);
    }

    // Start OAuth flow
    @GetMapping("/")
    public RedirectView startAuth() {
        String authUrl = calendarService.getAuthorizationUrl();
        return new RedirectView(authUrl);
    }

    // OAuth callback endpoint
    @GetMapping("/redirect")
    public String handleOAuthCallback(@RequestParam("code") String code) {
        try {
            calendarService.handleAuthorizationCode(code);
            return "Authentication successful! You can close this window and return to the extension.";
        } catch (Exception e) {
            return "Error during authentication: " + e.getMessage();
        }
    }

    // Get Canvas events from calendar
    @GetMapping("/test-canvas")
    public ResponseEntity<?> getCanvasEvents() {
        try {
            List<Event> events = calendarService.getCanvasEvents();
            return ResponseEntity.ok(events);
        } catch (IOException e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.status(500).body(error);
        }
    }
}