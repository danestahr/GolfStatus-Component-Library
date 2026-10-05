// Mock rounds for the public Event Site's Rounds page (Figma "Rounds").
const PARS_OUT = [4, 4, 3, 5, 4, 5, 3, 4, 4]
const PARS_IN = [4, 4, 3, 5, 4, 3, 4, 4, 5]
const HCP_OUT = [11, 13, 17, 5, 7, 15, 9, 3, 1]
const HCP_IN = [14, 10, 6, 12, 16, 2, 8, 4, 18]

const tee = (name, color, yardsOut, yardsIn, rating) => ({
  name,
  color,
  holes: 18,
  par: 72,
  rating,
  parsOut: PARS_OUT,
  parsIn: PARS_IN,
  hcpOut: HCP_OUT,
  hcpIn: HCP_IN,
  yardsOut,
  yardsIn,
})

const FACILITY = {
  name: 'Highland Ridge Golf Club',
  courses: ['Ridge Course'],
  address: ['4200 Highland Ridge Dr', 'Denver, CO 80206', 'United States'],
  website: 'www.highlandridgegc.com',
  phone: '(303) 555-0142',
}

export const eventSiteRounds = [
  {
    id: 'rnd-1',
    name: 'Round 1',
    when: '8:00 AM on Aug 24, 2026',
    format: 'Scramble',
    holes: 18,
    startType: 'Shotgun Start',
    facility: FACILITY,
    tees: [
      tee('Black', '#111', [410, 395, 205, 540, 430, 555, 190, 420, 440], [425, 380, 215, 530, 410, 195, 445, 400, 560], '74.1 / 138'),
      tee('Blue', '#1d4ed8', [385, 370, 185, 515, 405, 530, 170, 395, 420], [400, 355, 195, 505, 385, 175, 420, 380, 535], '72.0 / 131'),
      tee('White', '#999', [360, 345, 165, 490, 380, 505, 150, 370, 395], [375, 330, 175, 480, 360, 155, 395, 355, 510], '70.2 / 125'),
    ],
  },
]
