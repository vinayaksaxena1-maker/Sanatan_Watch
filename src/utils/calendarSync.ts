interface CalendarEvent {
  title: string;
  description: string;
  startDate: string; // e.g. YYYYMMDD or YYYYMMDDTHHMMSS
  endDate: string;
  location?: string;
}

/**
 * Generates a direct Google Calendar Web Link.
 * Runs 100% offline by constructing the URL string dynamically.
 */
export function generateGoogleCalendarUrl(event: CalendarEvent): string {
  const formatUrlDate = (d: string) => {
    return d.replace(/-/g, '').replace(/:/g, '');
  };

  const title = encodeURIComponent(event.title);
  const details = encodeURIComponent(event.description);
  const dates = `${formatUrlDate(event.startDate)}/${formatUrlDate(event.endDate)}`;
  const location = event.location ? encodeURIComponent(event.location) : '';

  return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&details=${details}&dates=${dates}&location=${location}&sf=true&output=xml`;
}

/**
 * Generates a standard .ics (iCalendar) text string locally and triggers
 * an instant download in the user's browser, allowing syncing with Apple/Google/Samsung calendars.
 * Runs 100% offline.
 */
export function exportToIcsFile(event: CalendarEvent): void {
  const formatIcsDate = (d: string) => {
    const clean = d.replace(/-/g, '').replace(/:/g, '');
    if (clean.includes('T')) {
      return clean + 'Z';
    }
    return clean;
  };

  const icsContent = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Sanatan Watch//NONSGML Calendar Exporter//EN',
    'BEGIN:VEVENT',
    `UID:${Date.now()}@sanatanwatch.com`,
    `DTSTAMP:${formatIcsDate(new Date().toISOString().substring(0, 19).replace(/Z/g, ''))}Z`,
    `DTSTART:${formatIcsDate(event.startDate)}`,
    `DTEND:${formatIcsDate(event.endDate)}`,
    `SUMMARY:${event.title}`,
    `DESCRIPTION:${event.description.replace(/\n/g, '\\n')}`,
    event.location ? `LOCATION:${event.location}` : '',
    'END:VEVENT',
    'END:VCALENDAR'
  ].filter(Boolean).join('\r\n');

  const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  
  const fileName = event.title.toLowerCase().replace(/[^a-z0-9]/g, '_') + '.ics';
  link.setAttribute('download', fileName);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
