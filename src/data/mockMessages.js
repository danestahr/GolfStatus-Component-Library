export const MESSAGE_TYPES = [
  { id: 'email', name: 'Email', description: 'Send an email to tournament participants.' },
  { id: 'app', name: 'App Notification', description: 'Send a notification to tournament participants through the GolfStatus App.' },
  { id: 'sms', name: 'Text Message (SMS)', description: 'Send a text message to tournament participants.' },
]

export const typeName = id => MESSAGE_TYPES.find(t => t.id === id)?.name ?? MESSAGE_TYPES[0].name

const make = (id, status, typeId, extra = {}) => ({
  id,
  status,
  typeId,
  subject: 'Subject',
  channel: typeName(typeId),
  totalRecipients: 128,
  tournamentCount: 2,
  groupCount: 3,
  author: 'First Last',
  ...extra,
})

export const MESSAGES = [
  make('s1', 'scheduled', 'email', { date: 'Mon 12, 2026 at 12:00 AM CST' }),
  make('s2', 'scheduled', 'app', { date: 'Tue 13, 2026 at 9:00 AM CST' }),
  make('s3', 'scheduled', 'sms', { date: 'Wed 14, 2026 at 8:30 AM CST' }),
  make('d1', 'draft', 'email'),
  make('d2', 'draft', 'app'),
  make('d3', 'draft', 'sms'),
  make('t1', 'sent', 'email', { date: 'Mon 5, 2026 at 12:00 AM CST' }),
  make('t2', 'sent', 'app', { date: 'Tue 6, 2026 at 9:00 AM CST' }),
  make('t3', 'sent', 'sms', { date: 'Wed 7, 2026 at 8:30 AM CST' }),
  make('t4', 'sent', 'email', { date: 'Thu 8, 2026 at 10:00 AM CST' }),
]
