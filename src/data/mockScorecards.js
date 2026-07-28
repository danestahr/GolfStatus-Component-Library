import {
  faMobileScreen,
  faUserPen,
  faCircleCheck,
  faPaperPlane,
} from '@fortawesome/free-solid-svg-icons'

const PAR = [4,4,3,5,4,5,3,4,4, 4,4,3,5,4,5,3,4,4]

// Build hole scores that sum to a target total
function makeScores(total) {
  const scores = [...PAR]
  let diff = total - 72
  for (let i = 0; i < 18 && diff !== 0; i++) {
    const delta = diff > 0 ? 1 : -1
    scores[i] += delta
    diff -= delta
  }
  return scores
}

function sc(id, teamName, playerCount, players, totalScore, inScore, outScore, toPar, inToPar, outToPar, status, statusLabel, statusMessage, statusIcon, editStatus) {
  return {
    id,
    teamName,
    playerCount,
    players,
    total: { score: totalScore, toPar },
    in: { score: inScore, toPar: inToPar },
    out: { score: outScore, toPar: outToPar },
    status,
    statusLabel,
    statusMessage,
    statusIcon,
    editStatus,
    holeScores: totalScore ? makeScores(totalScore) : null,
  }
}

const IP  = (id, team, pc, players, tot, ins, out, toPar, iToPar, oToPar, msg) =>
  sc(id, team, pc, players, tot, ins, out, toPar, iToPar, oToPar, 'in-progress', 'In Progress', msg, faMobileScreen, null)

const SUB = (id, team, pc, players, tot, ins, out, toPar, iToPar, oToPar) =>
  sc(id, team, pc, players, tot, ins, out, toPar, iToPar, oToPar, 'submitted', 'Submitted', 'Live Scorecard Submitted', faMobileScreen, null)

const CONF = (id, team, pc, players, tot, ins, out, toPar, iToPar, oToPar) =>
  sc(id, team, pc, players, tot, ins, out, toPar, iToPar, oToPar, 'confirmed', 'Confirmed', 'Live Scorecard Confirmed', faMobileScreen, null)

const NOACT = (id, team, pc, players, tot, ins, out, toPar, iToPar, oToPar) =>
  sc(id, team, pc, players, tot, ins, out, toPar, iToPar, oToPar, 'no-activity', 'No Activity', 'No Live Scorecard Activity', null, 'Edited')

const COMP = (id, team, pc, players, tot, ins, out, toPar, iToPar, oToPar) =>
  sc(id, team, pc, players, tot, ins, out, toPar, iToPar, oToPar, 'complete', 'Complete', 'Scores Manually Input', faUserPen, null)

const NOGEN = (id, team, pc, players) =>
  sc(id, team, pc, players, null, null, null, null, null, null, 'not-generated', 'No Scorecard', null, null, null)

export const mockHoleAssignments = [
  {
    hole: 1, startTime: '8:00 AM',
    scorecards: [
      IP(1,   'Team Alpha',          5, 'Sarah Johnson, Wei Chen, Diego Martinez, Anya Petrova, Adebayo Okonkwo',                          68, 34, 34, '-4', '-2', '-2', 'Live Scoring — Through 11'),
      IP(2,   'The Birdie Squad',    5, 'Priya Sharma, Tom Lee, Maria Castellano-Ruiz, Jordan Kim, Kofi Mensah',               65, 33, 32, '-7', '-3', '-4', 'Live Scoring — Through 14'),
    ],
  },
  {
    hole: 2, startTime: '8:00 AM',
    scorecards: [
      IP(3,   'Fairway Bandits',     5, 'Eduardo Hernández, Jo Park, Naomi Yamamoto, Trevor Brooks, Aisha Mohammed',                   71, 36, 35, '-1', 'E',  '-1', 'Live Scoring — Through 9'),
      IP(4,   'Eagle Chasers',       5, 'Sam Wu, Christopher Anderson, Layla Al-Hassan, Bernardo Silva, Ava Nguyen',            70, 35, 35, '-2', '-1', '-1', 'Live Scoring — Through 12'),
    ],
  },
  {
    hole: 3, startTime: '8:00 AM',
    scorecards: [
      IP(5,   'Sand Trap Heroes',    5, 'Bartholomew Featherstone, Kim Tran, Olivia Brennan, Vikram Patel, Zoe Ho',          73, 37, 36, '+1', '+1', 'E',  'Live Scoring — Through 7'),
      IP(6,   'Bogey Bros',          5, "Connor O'Sullivan, Yuki Tanaka, Marisol Rodríguez, Ezekiel Montgomery, Min Cho",                          74, 37, 37, '+2', '+1', '+1', 'Live Scoring — Through 10'),
    ],
  },
  {
    hole: 4, startTime: '8:00 AM',
    scorecards: [
      IP(7,   'Par Busters',         5, 'Aleksandr Volkov, Hannah Jones, Tariq Bashir, Sienna Cooper, Eli Park',                 67, 33, 34, '-5', '-3', '-2', 'Live Scoring — Through 16'),
      IP(8,   'The Iron Men',        5, 'Owen Bell, Genevieve Castellano, Hiroshi Sato, Damaris Owusu, Jia Lin', 69, 35, 34, '-3', '-1', '-2', 'Live Scoring — Through 13'),
    ],
  },
  {
    hole: 5, startTime: '8:00 AM',
    scorecards: [
      IP(9,   'Chip Shots',          5, 'Penelope Ashworth-Hughes, Bo Han, Sage Whitehorse, Anastasia Kowalski, Mateo Cruz',          72, 36, 36, 'E',  'E',  'E',  'Live Scoring — Through 8'),
      SUB(10, 'The Mulligan Masters',5, 'Carter Reed, Lakshmi Iyer, Bashir Al-Tayyib, Ingrid Larsen, Tane Ahomana',                   70, 36, 34, '-2', 'E',  '-2'),
    ],
  },
  {
    hole: 6, startTime: '8:00 AM',
    scorecards: [
      SUB(11, 'Double Eagle Crew',   5, 'Demetria Washington, Hiro Nakamura, Sofia Romano, Kwame Asante, Tim Park',     68, 34, 34, '-4', '-2', '-2'),
      SUB(12, 'Rough Riders',        5, 'Maximilian Schneider, Zara Okonkwo, Aiden Harris, Mei-Ling Wu, Jamal Carter',           71, 36, 35, '-1', 'E',  '-1'),
    ],
  },
  {
    hole: 7, startTime: '8:00 AM',
    scorecards: [
      SUB(13, 'The Wedge Warriors',  5, 'Eva Cho, Lorenzo Bianchi, Ridhima Joshi, Cody Thompson, Layla Mansour',                75, 38, 37, '+3', '+2', '+1'),
      SUB(14, 'Back Nine Bandits',   5, 'Octavio Hernández-Ruiz, Sun-Hee Kim, Trent Bell, Amara Diop, Vera Sokolov',                   73, 37, 36, '+1', '+1', 'E'),
    ],
  },
  {
    hole: 8, startTime: '8:00 AM',
    scorecards: [
      SUB(15, 'Birdie Hunters',      5, 'Min-jun Park, Aaliyah Williams, Theo Hayes, Sanjana Reddy, Khalid Nasser',                          69, 35, 34, '-3', '-1', '-2'),
      CONF(16,'Green Jackets',       5, 'Ji-Hoon Park, Camila Vega, Ade Adebayo, Naomi Stein, Wesley Knight',                            67, 34, 33, '-5', '-2', '-3'),
    ],
  },
  {
    hole: 9, startTime: '8:00 AM',
    scorecards: [
      CONF(17,'The Scratch Pack',    5, 'Aria Bailey, Konstantinos Papadopoulos, Linh Nguyen, Tomas Novak, Imani Reed',                 70, 36, 34, '-2', 'E',  '-2'),
      CONF(18,'Lost Ball Club',      5, 'Ines Garcia-Ortiz, Bear Lightfoot, Mei Tanaka, Felix Yamamoto, Erin Walsh',                  74, 37, 37, '+2', '+1', '+1'),
    ],
  },
  {
    hole: 10, startTime: '8:00 AM',
    scorecards: [
      CONF(19,'The Divot Crew',      5, 'Priscilla Featherstone, Anil Kumar, Reese Carter, Maya Goldberg, Kenji Lee',            72, 36, 36, 'E',  'E',  'E'),
      NOACT(20,'Sunset Chasers',     5, 'Kealoha Kahale, Marcus Brown, Aleksei Ivanov, Halima Yusuf, Ana Souza',     73, 37, 36, '+1', '+1', 'E'),
    ],
  },
  {
    hole: 11, startTime: '8:00 AM',
    scorecards: [
      NOACT(21,'Morning Dew',        5, "Liam O'Brien, Hadiya Rahman, Diego Vargas, Suki Park, Frederick Hawthorne",             75, 38, 37, '+3', '+2', '+1'),
      NOACT(22,'Fairway Finders',    5, "Yara El-Sayed, Tobias Reuter, Akari Kondo, Saoirse O'Donnell, Mason Pierce",                 71, 36, 35, '-1', 'E',  '-1'),
    ],
  },
  {
    hole: 12, startTime: '8:00 AM',
    scorecards: [
      NOACT(23,'The Slice Masters',  5, 'Esperanza Delacruz, Nikolai Volkov, Avery Stone, Cheng-Hao Lin, Olu Adekunle',                   77, 39, 38, '+5', '+3', '+2'),
      SUB(24, 'Hole in Wonder',      5, 'Pippa Whittington-Smythe, Tashi Dorji, Renee Bouchard, Hugo Vargas, Mira Khan',      76, 38, 38, '+4', '+2', '+2'),
    ],
  },
  {
    hole: 13, startTime: '8:00 AM',
    scorecards: [
      NOACT(25,'Links Legends',      5, 'Cyrus Tehrani, Dakota Reyes, Beatriz Pereira, Hans Müller, Aoife Murphy',                      79, 40, 39, '+7', '+4', '+3'),
      SUB(26, 'The Albatross',       5, 'Trevor Singh, Yui Watanabe, Bryce Williams, Ifeoma Okafor, Adriana Lopez',         70, 36, 34, '-2', 'E',  '-2'),
    ],
  },
  {
    hole: 14, startTime: '8:00 AM',
    scorecards: [
      SUB(27, 'Sand Wedge Society',  5, 'Niamh Kelly, Han-Sol Choi, Bashar Khoury, Gabriela Costa, Wesley Park',                69, 35, 34, '-3', '-1', '-2'),
      CONF(28,'The Back Swings',     5, 'Aurelio Castellano-Marin, Tiffany Wright, Dev Mehta, Lila Robinson, Hiroto Suzuki',                   71, 36, 35, '-1', 'E',  '-1'),
    ],
  },
  {
    hole: 15, startTime: '8:00 AM',
    scorecards: [
      IP(29,  'Drive Club',          5, 'Selena Ortiz, Pranav Desai, Henrik Bjornsson, Imani Carter, Mateusz Wojcik',                  72, 36, 36, 'E',  'E',  'E',  'Live Scoring — Through 6'),
      IP(30,  'The Putting Kings',   5, 'Vivienne Lockhart, Ricardo Salazar, Yara Habib, Caleb Brown, Sophie Cheng',                     70, 35, 35, '-2', '-1', '-1', 'Live Scoring — Through 5'),
    ],
  },
  {
    hole: 16, startTime: '8:00 AM',
    scorecards: [
      IP(31,  'Eagle Eye',           5, 'Bartholomew Carrington, Sade Adesanya, Quincy Park, Anaya Singh, Marco Bellucci',          71, 36, 35, '-1', 'E',  '-1', 'Live Scoring — Through 4'),
      COMP(32,'Fore!',               5, 'Theodora Vassilakis, Kobe Williams, Marisol Aguilar, Devin Park, Olga Petrov',                   78, 39, 39, '+6', '+3', '+3'),
    ],
  },
  {
    hole: 17, startTime: '8:00 AM',
    scorecards: [
      IP(33,  'The Pin Seekers',     5, 'Tatum Hayes, Wenjie Zhang, Aaliyah Patel, Sven Eriksson, Jada Brooks',                    69, 35, 34, '-3', '-1', '-2', 'Live Scoring — Through 3'),
      COMP(34,"Caddie's Choice",     5, 'Sigourney Faulkner-Mills, Rohan Iyer, Esme Walsh, Tariq Al-Mahdi, Yuto Suzuki',                      80, 40, 40, '+8', '+4', '+4'),
    ],
  },
  {
    hole: 18, startTime: '8:00 AM',
    scorecards: [
      COMP(35,'Classic Cut',         5, 'Beatrix Holloway, Junior Mensah, Aurora Costa, Ezra Klein, Pari Singh',                 76, 38, 38, '+4', '+2', '+2'),
      NOGEN(36,'The Lay-Up League',  5, 'Constance Pemberton, Jin-Woo Han, Adaeze Eze, Logan Cruz, Mira Krishnamurthy'),
    ],
  },
]

export const mockScorecards = mockHoleAssignments.flatMap(g => g.scorecards)

// Mark a handful of scorecards as partially filled.
// In-progress: zero out holes past their "Through N" point (natural trailing partial).
// Submitted/confirmed: drop a hole in the middle so they flag as incomplete.
mockScorecards.forEach(sc => {
  if (sc.status === 'in-progress' && sc.holeScores && sc.statusMessage) {
    const m = sc.statusMessage.match(/Through (\d+)/)
    if (m) {
      const through = parseInt(m[1], 10)
      for (let i = through; i < 18; i++) sc.holeScores[i] = 0
    }
  }
})

const INCOMPLETE_IDS = [10, 13, 16, 26, 28]
INCOMPLETE_IDS.forEach((id, i) => {
  const sc = mockScorecards.find(s => s.id === id)
  if (sc?.holeScores) {
    sc.holeScores[5 + i] = 0
    if (i % 2 === 0) sc.holeScores[12 + i] = 0
  }
})

const PAR_FRONT = PAR.slice(0, 9).reduce((a, b) => a + b, 0)  // 36
const PAR_BACK  = PAR.slice(9).reduce((a, b) => a + b, 0)      // 36
const PAR_TOTAL = PAR_FRONT + PAR_BACK                          // 72

function toParStr(score, par) {
  const d = score - par
  return d === 0 ? 'E' : d > 0 ? `+${d}` : `${d}`
}

export function saveScorecard(id, holeScores) {
  const scorecard = mockScorecards.find(s => s.id === id)
  if (!scorecard) return

  const outScore   = holeScores.slice(0, 9).reduce((a, b) => a + b, 0)
  const inScore    = holeScores.slice(9).reduce((a, b) => a + b, 0)
  const totalScore = outScore + inScore
  const now        = new Date().toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })

  scorecard.holeScores = holeScores
  scorecard.total      = { score: totalScore, toPar: toParStr(totalScore, PAR_TOTAL) }
  scorecard.out        = { score: outScore,   toPar: toParStr(outScore, PAR_FRONT) }
  scorecard.in         = { score: inScore,    toPar: toParStr(inScore, PAR_BACK) }
  scorecard.editStatus = `Edited ${now}`
}
