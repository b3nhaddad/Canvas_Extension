/**
 * Creates and downloads a .ics calendar file for a single event.
 * Works on Google Calendar, Apple Calendar, and Outlook.
 *
 * @param {Object} event - Object containing event details.
 * @param {string} event.title - The title shown in the calendar.
 * @param {Date} event.start - The start date/time (JavaScript Date object).
 * @param {Date} event.end - The end date/time (JavaScript Date object).
 * @param {string} [event.description] - Optional longer description or notes.
 * @param {string} [event.location] - Optional location (room, Zoom link, etc.).
 * @param {string} [filename="event.ics"] - The name of the downloaded file.
 */
function createICSFile(event, filename = "event.ics") {
  // Apple Calendar requires CRLF ("\r\n") newlines.
  const newline = "\r\n";

  // ---- ICS Header ----
  // Defines the start of the calendar and specifies required metadata.
  const header = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",                  // iCalendar format version
    "CALSCALE:GREGORIAN",          // Standard Gregorian calendar
    "PRODID:-//Carter Hickerson//CanvasEvents//EN" // Who generated this calendar file
  ].join(newline);

  // ---- ICS Footer ----
  // Marks the end of the calendar file.
  const footer = "END:VCALENDAR";

  // ---- Event Block ----
  // Represents one calendar event (between BEGIN:VEVENT and END:VEVENT).
  // Apple Calendar requires UID (unique ID) and DTSTAMP (creation timestamp).
  const uid = crypto.randomUUID();  // Create a globally unique event ID
  const now = formatDate(new Date()); // Current time in UTC for DTSTAMP

  const eventText = [
    "BEGIN:VEVENT",
    `UID:${uid}`,                          // Unique event identifier
    `DTSTAMP:${now}`,                      // Timestamp of when this file was generated
    `SUMMARY:${event.title}`,              // Event title (required)
    `DTSTART:${formatDate(event.start)}`,  // Start time in UTC format
    `DTEND:${formatDate(event.end)}`,      // End time in UTC format
    `DESCRIPTION:${event.description || ""}`, // Optional event description
    `LOCATION:${event.location || ""}`,    // Optional event location
    "END:VEVENT"
  ].join(newline);

  // ---- Combine the Header, Event, and Footer ----
  const icsContent = [header, eventText, footer].join(newline);

  // ---- Create a Blob ----
  // A Blob acts like a file in memory that holds our .ics text data.
  // The type tells the browser this is a "text/calendar" file.
  const blob = new Blob([icsContent], { type: "text/calendar;charset=utf-8" });

  // ---- Create a Temporary URL for the Blob ----
  // Converts the Blob into a temporary, downloadable URL.
  const url = URL.createObjectURL(blob);

  // ---- Create a Hidden <a> Tag ----
  // We dynamically create a link that points to our Blob URL.
  // Setting the `download` attribute tells the browser to download the file
  // instead of navigating to it.
  const link = document.createElement("a");
  link.href = url;           // The Blob file URL
  link.download = filename;  // Suggested name for the downloaded file

  // ---- Trigger the Download ----
  // Simulate a user clicking the invisible link.
  link.click();

  // ---- Clean Up ----
  // Revoke the Blob URL to free up memory.
  URL.revokeObjectURL(url);
}

/**
 * Converts a JavaScript Date object into iCalendar's UTC timestamp format:
 * Example:
 *   new Date("2025-10-30T09:00:00-06:00")
 *   → "20251030T150000Z"
 */
function formatDate(date) {
  return date.toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";
}

// ---- Example Usage ----
// You can call this function from a button click or script directly:
createICSFile({
  title: "CS 320 Exam 1",
  start: new Date("2025-10-30T09:00:00-06:00"),  // Local start time
  end: new Date("2025-10-30T10:15:00-06:00"),    // Local end time
  description: "Midterm exam covering sorting and recursion.",
  location: "CSU Clark A201"
}, "CS320_Exam1.ics");
