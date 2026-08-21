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
}
