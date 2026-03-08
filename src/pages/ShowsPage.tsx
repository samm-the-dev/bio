import { CalendarPlus, ExternalLink, MapPin } from 'lucide-react';
import { PageHeader } from '@/components/PageHeader';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { shows } from '@/data/shows';
import type { Show } from '@/lib/queries';

function formatShowDate(datetime: string): string {
  const date = new Date(datetime);
  return date.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });
}

function formatShowTime(datetime: string): string {
  const date = new Date(datetime);
  return date.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
  });
}

function daysUntil(datetime: string): string {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const show = new Date(datetime);
  show.setHours(0, 0, 0, 0);
  const diff = Math.round((show.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
  if (diff === 0) return 'Today';
  if (diff === 1) return 'Tomorrow';
  return `In ${diff} days`;
}

function toIcsTime(datetime: string): string {
  return datetime.replace(/[-:]/g, '') + '00';
}

function safeFilename(title: string): string {
  return title.replace(/[<>:"/\\|?*]/g, '').replace(/\s+/g, '-');
}

function showLocation(show: Show): string {
  return show.address ? `${show.venue}, ${show.address}` : show.venue;
}

function icsUrl(show: Show): string {
  const ics = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'BEGIN:VEVENT',
    `DTSTART;TZID=America/Chicago:${toIcsTime(show.datetime)}`,
    show.endDatetime ? `DTEND;TZID=America/Chicago:${toIcsTime(show.endDatetime)}` : '',
    `SUMMARY:${show.title}`,
    `LOCATION:${showLocation(show)}`,
    show.note ? `DESCRIPTION:${show.note}` : '',
    'END:VEVENT',
    'END:VCALENDAR',
  ]
    .filter(Boolean)
    .join('\r\n');
  return `data:text/calendar;charset=utf-8,${encodeURIComponent(ics)}`;
}

function googleCalendarUrl(show: Show): string {
  const start = toIcsTime(show.datetime);
  const dates = show.endDatetime ? `${start}/${toIcsTime(show.endDatetime)}` : start;
  const params = new URLSearchParams({
    action: 'TEMPLATE',
    text: show.title,
    dates,
    ctz: 'America/Chicago',
    location: showLocation(show),
  });
  if (show.note) params.set('details', show.note);
  return `https://calendar.google.com/calendar/render?${params}`;
}

export function ShowsPage() {
  useDocumentTitle('Shows');
  const isAndroid = /Android/i.test(navigator.userAgent);

  const now = new Date();
  const upcoming = shows
    .filter((s) => new Date(s.datetime) >= now)
    .sort((a, b) => a.datetime.localeCompare(b.datetime));

  return (
    <div className="mx-auto max-w-2xl">
      <PageHeader title="Upcoming Shows" />

      {upcoming.length > 0 ? (
        <div className="space-y-4">
          {upcoming.map((show) => (
            <article
              key={`${show.datetime}-${show.title}`}
              className="rounded-lg border border-border bg-card p-4"
            >
              <h2 className="font-semibold text-card-foreground">{show.title}</h2>
              <p className="mt-1 text-sm text-muted-foreground">{formatShowDate(show.datetime)}</p>
              <p className="text-sm text-muted-foreground">
                {formatShowTime(show.datetime)}
                {show.endDatetime && ` - ${formatShowTime(show.endDatetime)}`}
              </p>
              <p className="text-sm font-medium text-muted-foreground">
                {daysUntil(show.datetime)}
              </p>
              <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm">
                {show.venueUrl ? (
                  <a
                    href={show.venueUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-muted-foreground hover:text-foreground"
                  >
                    <ExternalLink className="h-3.5 w-3.5 shrink-0" />
                    {show.venue}
                  </a>
                ) : (
                  <span className="text-muted-foreground">{show.venue}</span>
                )}
                {(show.mapsUrl || show.address) && (
                  <a
                    href={
                      show.mapsUrl ??
                      `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(showLocation(show))}`
                    }
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-muted-foreground hover:text-foreground"
                  >
                    <MapPin className="h-3.5 w-3.5 shrink-0" />
                    Map
                  </a>
                )}
                {isAndroid ? (
                  <a
                    href={googleCalendarUrl(show)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-muted-foreground hover:text-foreground"
                  >
                    <CalendarPlus className="h-3.5 w-3.5 shrink-0" />
                    Add to calendar
                  </a>
                ) : (
                  <a
                    href={icsUrl(show)}
                    download={`${safeFilename(show.title)}.ics`}
                    className="inline-flex items-center gap-1 text-muted-foreground hover:text-foreground"
                  >
                    <CalendarPlus className="h-3.5 w-3.5 shrink-0" />
                    Add to calendar
                  </a>
                )}
              </div>
              {show.note && <p className="mt-2 text-xs text-muted-foreground">{show.note}</p>}
            </article>
          ))}
        </div>
      ) : (
        <p className="text-muted-foreground">No upcoming shows scheduled. Check back soon!</p>
      )}
    </div>
  );
}
