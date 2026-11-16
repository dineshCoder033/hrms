/**
 * RFC 5545 iCalendar (.ics) event generator
 */
const formatIcsDate = (date) => {
  const d = new Date(date);
  return d.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
};

const generateIcs = (meeting) => {
  const uid = `meeting-${meeting._id || meeting.id}@taskorbit.com`;
  const dtStamp = formatIcsDate(new Date());
  const dtStart = formatIcsDate(meeting.startAt);
  const dtEnd = formatIcsDate(meeting.endAt);
  const location = meeting.mode === 'Online' 
    ? (meeting.meetLink || 'Online Video Meeting') 
    : (meeting.room || 'Office Conference Room');

  return [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//TaskOrbit HRMS//Meeting Scheduler//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:REQUEST',
    'BEGIN:VEVENT',
    `UID:${uid}`,
    `DTSTAMP:${dtStamp}`,
    `DTSTART:${dtStart}`,
    `DTEND:${dtEnd}`,
    `SUMMARY:${meeting.title}`,
    `DESCRIPTION:${(meeting.description || 'TaskOrbit Meeting').replace(/\n/g, '\\n')}`,
    `LOCATION:${location}`,
    `STATUS:${meeting.status === 'Cancelled' ? 'CANCELLED' : 'CONFIRMED'}`,
    'END:VEVENT',
    'END:VCALENDAR'
  ].join('\r\n');
};

module.exports = {
  generateIcs
};

