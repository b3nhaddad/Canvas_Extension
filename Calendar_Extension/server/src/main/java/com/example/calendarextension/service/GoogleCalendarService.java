package com.example.calendarextension.service;

import com.google.api.client.auth.oauth2.AuthorizationCodeFlow;
import com.google.api.client.auth.oauth2.Credential;
import com.google.api.client.auth.oauth2.TokenResponse;
import com.google.api.client.googleapis.auth.oauth2.GoogleAuthorizationCodeFlow;
import com.google.api.client.googleapis.javanet.GoogleNetHttpTransport;
import com.google.api.client.http.javanet.NetHttpTransport;
import com.google.api.client.json.JsonFactory;
import com.google.api.client.json.gson.GsonFactory;
import com.google.api.client.util.store.FileDataStoreFactory;
import com.google.api.services.calendar.Calendar;
import com.google.api.services.calendar.CalendarScopes;
import com.google.api.services.calendar.model.Event;
import com.google.api.services.calendar.model.Events;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.io.File;
import java.io.IOException;
import java.security.GeneralSecurityException;
import java.util.Collections;
import java.util.List;

@Service
public class GoogleCalendarService {

    private static final JsonFactory JSON_FACTORY = GsonFactory.getDefaultInstance();
    private static final List<String> SCOPES = Collections.singletonList(CalendarScopes.CALENDAR);
    private static final String TOKENS_DIRECTORY_PATH = "tokens";
    private static final String USER_ID = "user";

    @Value("${google.client.id}")
    private String clientId;

    @Value("${google.client.secret}")
    private String clientSecret;

    @Value("${google.redirect.uri}")
    private String redirectUri;

    @Value("${canvas.token:}")
    private String canvasToken;

    private NetHttpTransport httpTransport;
    private GoogleAuthorizationCodeFlow flow;

    // Initialize the HTTP transport and OAuth flow
    private void initializeFlow() throws GeneralSecurityException, IOException {
        if (flow == null) {
            httpTransport = GoogleNetHttpTransport.newTrustedTransport();
            flow = new GoogleAuthorizationCodeFlow.Builder(
                    httpTransport, JSON_FACTORY, clientId, clientSecret, SCOPES)
                    .setDataStoreFactory(new FileDataStoreFactory(new File(TOKENS_DIRECTORY_PATH)))
                    .setAccessType("offline")
                    .build();
        }
    }

    // Check if user is authenticated
    public boolean isAuthenticated() {
        try {
            initializeFlow();
            Credential credential = flow.loadCredential(USER_ID);
            return credential != null && credential.getAccessToken() != null;
        } catch (Exception e) {
            return false;
        }
    }

    // Get authorization URL for OAuth flow
    public String getAuthorizationUrl() {
        try {
            initializeFlow();
            return flow.newAuthorizationUrl()
                    .setRedirectUri(redirectUri)
                    .setApprovalPrompt("force")
                    .build();
        } catch (Exception e) {
            throw new RuntimeException("Error generating authorization URL", e);
        }
    }

    // Handle the OAuth callback with authorization code
    public void handleAuthorizationCode(String code) throws IOException {
        try {
            initializeFlow();
            TokenResponse response = flow.newTokenRequest(code)
                    .setRedirectUri(redirectUri)
                    .execute();
            flow.createAndStoreCredential(response, USER_ID);
        } catch (GeneralSecurityException e) {
            throw new IOException("Error handling authorization code", e);
        }
    }

    // Get Canvas events from Google Calendar
    public List<Event> getCanvasEvents() throws IOException {
        try {
            initializeFlow();
            Credential credential = flow.loadCredential(USER_ID);
            
            if (credential == null) {
                throw new IOException("Not authenticated. Please login first.");
            }

            Calendar service = new Calendar.Builder(httpTransport, JSON_FACTORY, credential)
                    .setApplicationName("Calendar Extension")
                    .build();

            // Get events from primary calendar
            // You can modify this to filter by Canvas events specifically
            Events events = service.events().list("primary")
                    .setMaxResults(10)
                    .setOrderBy("startTime")
                    .setSingleEvents(true)
                    .execute();

            return events.getItems();
            
        } catch (GeneralSecurityException e) {
            throw new IOException("Error accessing calendar", e);
        }
    }
}