// Mock event site settings — backs the preview card at the top of the
// Event Site & Packages hub page (matches the Figma "Event Site + Packages"
// file). `status: 'draft'` would show the "Enable Site" prompt instead of
// the live site preview + registration controls; this prototype only wires
// up the live/active state since that's what the current design covers.

export const eventSite = {
  tournamentName: 'Highland Ridge Charity Classic',
  status: 'active',
  registrationVisibility: 'private',
  registrationCloseAt: 'Mon, Aug 24 at 12:00 PM',
  // The rest of these back the public Event Website page (Figma "Event
  // Details") — the page a registrant sees when they click "View Website"
  // on the preview card above.
  dateRange: 'Mon, Aug 24, 2026',
  facility: 'Highland Ridge Golf Club',
  location: 'Denver, CO',
  description:
    "Join us for the Highland Ridge Charity Classic, a day of golf, community, and giving back. Every dollar raised goes directly toward funding scholarships for local students pursuing careers in the trades.",
  additionalDescription:
    'Registration includes 18 holes of golf with cart, a boxed lunch, range access before your tee time, and entry into the evening awards reception. Teams of four are encouraged, but individual registrations will be paired with a group.',
  donationGoal: 25000,
  donationRaised: 16250,
}
