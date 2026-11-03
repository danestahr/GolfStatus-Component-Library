// What we know about the prospect when Quick Start opens. Later steps read
// from and write back to this object (and presets get derived from it).
//
// Two scenarios, each with its own URL so either can be opened directly:
//   /tournaments/quick-start/ready      everything known (course and date filled in)
//   /tournaments/quick-start/not-ready  course and date unknown, so those inputs start empty
// /tournaments/quick-start alone opens the ready one.
export const QUICK_START_PROSPECTS = {
  ready: {
    first_name: 'Patrick',
    last_name: 'Miller',
    organization: 'Jerry Miller Foundation',
    email_address: 'patrick.miller+cat7@example.com',
    phone_number: '123-555-0101',
    course_name: 'Pine Valley',
    tournament_date: '2026-11-05',
    planning_status: 'ready',
  },
  'not-ready': {
    first_name: 'George',
    last_name: 'Williams',
    organization: 'Mary Williams Memorial Foundation',
    email_address: 'george.williams+cat7@example.com',
    phone_number: '123-555-0101',
    course_name: '',
    tournament_date: '',
    planning_status: 'not ready',
  },
}

export const DEFAULT_QUICK_START_SCENARIO = 'ready'

// "/tournaments/quick-start/not-ready" -> 'not-ready'; anything unknown (or no
// suffix) falls back to the default scenario.
export const scenarioFromPath = pathname => {
  const slug = pathname.replace(/\/+$/, '').split('/')[3]
  return QUICK_START_PROSPECTS[slug] ? slug : DEFAULT_QUICK_START_SCENARIO
}
