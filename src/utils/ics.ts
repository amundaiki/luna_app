export function formatIcsDate(date: Date): string {
  const pad = (n: number) => String(n).padStart(2, "0");
  const y = date.getUTCFullYear();
  const m = pad(date.getUTCMonth() + 1);
  const d = pad(date.getUTCDate());
  const hh = pad(date.getUTCHours());
  const mm = pad(date.getUTCMinutes());
  const ss = pad(date.getUTCSeconds());
  return `${y}${m}${d}T${hh}${mm}${ss}Z`;
}

export function createAppointmentIcs(options: {
  uid: string;
  title: string;
  description?: string;
  location?: string;
  start: Date;
  end: Date;
}): string {
  const { uid, title, description = "", location = "", start, end } = options;
  const dtstamp = formatIcsDate(new Date());
  const dtstart = formatIcsDate(start);
  const dtend = formatIcsDate(end);
  return [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Luna//Appointments//NO",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    "BEGIN:VEVENT",
    `UID:${uid}`,
    `DTSTAMP:${dtstamp}`,
    `DTSTART:${dtstart}`,
    `DTEND:${dtend}`,
    `SUMMARY:${escapeText(title)}`,
    `DESCRIPTION:${escapeText(description)}`,
    `LOCATION:${escapeText(location)}`,
    "END:VEVENT",
    "END:VCALENDAR",
  ].join("\r\n");
}

function escapeText(s: string): string {
  return s.replace(/\\/g, "\\\\").replace(/\n/g, "\\n").replace(/,|;/g, (m) => `\\${m}`);
}

export function downloadIcs(filename: string, icsContent: string) {
  const blob = new Blob([icsContent], { type: "text/calendar;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}


