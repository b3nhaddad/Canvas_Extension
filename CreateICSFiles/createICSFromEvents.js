/**
 * Creates and downloads a .ics calendar file from a list of events.
 * Works with Google Calendar, Apple Calendar, Outlook, etc.
 *
 * @param {Array} events - List of event objects (each with title, start, end, description, location)
 * @param {string} filename - Name for the downloaded file (default: schedule.ics)
 */
function createICSFromEvents(events, filename = "schedule.ics") {
  // Apple Calendar requires CRLF ("\r\n") newlines rather than just "\n"
  const newline = "\r\n";

  // ---- ICS Header ----
  // Every .ics file must start with BEGIN:VCALENDAR and basic metadata.
  const header = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",                  // iCalendar version
    "CALSCALE:GREGORIAN",          // Specifies the calendar system used
    "PRODID:-//Carter Hickerson//CanvasEvents//EN" // Identifies who made the file
  ].join(newline);

  // ---- ICS Footer ----
  // Every calendar file must end with END:VCALENDAR.
  const footer = "END:VCALENDAR";

  // ---- Event Blocks ----
  // For each event, create a "VEVENT" section that defines one calendar entry.
  const eventsText = events.map(event => {
    const uid = crypto.randomUUID();  // Unique identifier for this event
    const now = formatDate(new Date()); // Current timestamp (required by spec)

    // Each line here defines one property of the event
    return [
      "BEGIN:VEVENT",                     // Start of an event block
      `UID:${uid}`,                       // Unique ID — lets calendar apps track duplicates
      `DTSTAMP:${now}`,                   // When this event was created (UTC)
      `SUMMARY:${event.title}`,           // Event title (visible in calendar)
      `DTSTART:${formatDate(event.start)}`,// Start time (UTC format)
      `DTEND:${formatDate(event.end)}`,    // End time (UTC format)
      `DESCRIPTION:${event.description || ""}`, // Optional notes/details
      `LOCATION:${event.location || ""}`,  // Optional physical or virtual location
      "END:VEVENT"                         // End of event block
    ].join(newline); // Join each property line with proper newline endings
  }).join(newline);

  // ---- Combine Header + Events + Footer ----
  const icsContent = [header, eventsText, footer].join(newline);

  // ---- Create a Blob ----
  // A Blob is an in-memory “file-like” object that holds our text data.
  // Here, it’s used to tell the browser: “this is a downloadable calendar file.”
  const blob = new Blob([icsContent], { type: "text/calendar;charset=utf-8" });

  // ---- Turn Blob into a Temporary URL ----
  // This gives us a link like: blob:https://your-extension/abc123
  const url = URL.createObjectURL(blob);

  // ---- Create a Hidden <a> Tag ----
  // document.createElement('a') creates a link element dynamically in JavaScript.
  // We give it our Blob URL and a filename, then trigger a “click” on it.
  const link = document.createElement("a");
  link.href = url;          // The download source (our Blob)
  link.download = filename; // The filename shown in the “Save As” dialog

  // ---- Trigger the Download ----
  // Simulate a click on the invisible link to prompt the browser download.
  link.click();

  // ---- Clean Up ----
  // Remove the temporary URL from memory to avoid memory leaks.
  URL.revokeObjectURL(url);
}

/**
 * Helper function that converts a JavaScript Date into
 * iCalendar's required UTC timestamp format (YYYYMMDDTHHMMSSZ).
 *
 * Example: new Date("2025-10-30T09:00:00-06:00")
 * → "20251030T150000Z"
 */
function formatDate(date) {
  return date.toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";
}

// ---- Example usage ----
createICSFromEvents([
  {
    title: "CS 320 Midterm",
    start: new Date("2025-10-30T09:00:00-06:00"),
    end: new Date("2025-10-30T10:15:00-06:00"),
    description: "Midterm exam covering sorting and recursion.",
    location: "CSU Clark A201"
  },
  {
    title: "CS 314 Sprint 4 Demo",
    start: new Date("2025-11-14T11:00:00-06:00"),
    end: new Date("2025-11-14T12:00:00-06:00"),
    description: "Final sprint demo and team presentations.",
    location: "CSU Engineering Building"
  }
]);
