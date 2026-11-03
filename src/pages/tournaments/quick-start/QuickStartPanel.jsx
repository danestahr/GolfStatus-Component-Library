import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { addCreatedTournament } from '../../../data/createdTournaments'
import AppSidePanel from '../../../components/AppSidePanel'
import AcknowledgmentStep from './AcknowledgmentStep.jsx'
import TournamentDetailsStep, { defaultTournamentName } from './TournamentDetailsStep.jsx'
import RoundDetailsStep from './RoundDetailsStep.jsx'
import WebsiteDetailsStep from './WebsiteDetailsStep.jsx'
import BannerGalleryStep from './BannerGalleryStep.jsx'
import TournamentCreatedStep from './TournamentCreatedStep.jsx'
import QuickStartStepHeader from './QuickStartStepHeader.jsx'
import { FACILITIES, DEFAULT_ROUND_FORMAT, soleCourse, isNineHoleTrio, coursesFor, ALL_TEE_IDS } from '../../../data/mockFacilities'
import QuickStartStepper, { QUICK_START_STAGES } from './QuickStartStepper.jsx'
import { stepActions } from './stepActions.js'
import './QuickStartPanel.scss'
import { QUICK_START_PROSPECT } from '../../../data/mockQuickStart'

// Steps, in order. One AppSidePanel swaps between them by state (never a
// second stacked panel) so the tournaments list stays put behind it:
//   acknowledgment -> tournament -> rounds -> website (-> banners) -> confirmation
// Every step is built; banners (3a) is a side trip from website.
// The event description starts as a mission statement built from the
// organization's name; the prospect edits it from there.
const defaultEventDescription = organization =>
  `<div>Get ready to tee off at ${organization}’s golf event! Every swing supports ${organization}’s mission, so join us for good vibes and a great cause. Register early, be part of the fun, and let’s do good together!</div>`

const initialQuickStart = () => ({
  ...QUICK_START_PROSPECT,
  tournament_name: defaultTournamentName(QUICK_START_PROSPECT.organization),
  tournament_image: null,
  // Round details — start time is a placeholder until the prospect sets it,
  // and the course is preselected when the prospect's course is in the directory.
  start_datetime: `${QUICK_START_PROSPECT.tournament_date}T10:00`,
  round_format: DEFAULT_ROUND_FORMAT.value,
  round_holes: 18,
  facility: FACILITIES.find(f => f.name === QUICK_START_PROSPECT.course_name) ?? null,
  // A facility with a single course has it picked for it.
  course_id: soleCourse(FACILITIES.find(f => f.name === QUICK_START_PROSPECT.course_name))?.id ?? null,
  course_id_2: null,
  course_not_listed: false,
  holes: 'all',
  tees: ALL_TEE_IDS,
  // Website details — the banner is a File (upload) or a preset image URL (gallery).
  banner_image: null,
  event_description: defaultEventDescription(QUICK_START_PROSPECT.organization),
})

// TEMPORARY testing flag — see finish() below. The confirmation screen is kept.
const SKIP_CONFIRMATION = true

export default function QuickStartPanel({ isOpen, onClose }) {
  const [step, setStep] = useState('acknowledgment')
  const bodyRef = useRef(null)
  // The panel body never unmounts between steps, so reset its scroll on each.
  useEffect(() => { bodyRef.current?.scrollTo(0, 0) }, [step])
  const [quickStart, setQuickStart] = useState(initialQuickStart)
  const [accepted, setAccepted] = useState(false)
  const [created, setCreated] = useState(null)
  // Stages whose page has been saved (Save & Continue) this session.
  const [saved, setSaved] = useState([])
  const navigate = useNavigate()

  const update = patch => setQuickStart(prev => ({ ...prev, ...patch }))

  // Start every Quick Start from the top.
  useEffect(() => {
    if (isOpen) {
      setStep('acknowledgment')
      setAccepted(false)
      setCreated(null)
      setSaved([])
      setQuickStart(initialQuickStart())
    }
  }, [isOpen])

  // Reaching the confirmation is what creates the tournament (once, even if
  // the user steps back and forward again).
  const finish = () => {
    const tournament = created ?? addCreatedTournament(quickStart)
    if (!created) setCreated(tournament)
    // TEMPORARY: skip the confirmation screen and go straight to the overview
    // while new flows are tested. To restore, set this flag to false.
    if (SKIP_CONFIRMATION) {
      navigate(`/tournaments/${tournament.id}`)
      return
    }
    setStep('confirmation')
  }

  // Saving a page (Save & Continue) is what opens the next one.
  const saveAndGo = (stageId, next) => {
    setSaved(prev => (prev.includes(stageId) ? prev : [...prev, stageId]))
    setStep(next)
  }

  // The stepper only reaches pages that have been saved — a page you've merely
  // visited (or are about to) stays disabled until it's saved, even if you move
  // back off it. Saved pages (and the ones before them) must still be complete
  // for the stepper to go there; the action drawer is how you move forward to
  // a page that isn't saved yet, always in sequence.
  const stageComplete = {
    tournament: Boolean(quickStart.tournament_name.trim()),
    rounds: Boolean(quickStart.start_datetime && quickStart.round_format && (quickStart.course_not_listed || (quickStart.facility && quickStart.course_id)) && quickStart.tees.length &&
      (!isNineHoleTrio(quickStart.facility) || quickStart.round_holes !== 18 || quickStart.course_id_2) &&
      // An 18-hole course played for 9 holes needs its front or back nine picked.
      (coursesFor(quickStart.facility).find(c => c.id === quickStart.course_id)?.holes !== 18 || quickStart.round_holes !== 9 || ['front', 'back'].includes(quickStart.holes))),
    website: true,
  }
  const enabledStages = QUICK_START_STAGES.filter((stage, i) =>
    saved.includes(stage.id) &&
    QUICK_START_STAGES.slice(0, i).every(earlier => saved.includes(earlier.id) && stageComplete[earlier.id])
  ).map(stage => stage.id)
  // Done = completed and saved.
  const doneStages = enabledStages.filter(id => stageComplete[id])
  const stepper = activeId => <QuickStartStepper activeId={activeId} enabledIds={enabledStages} doneIds={doneStages} onSelect={setStep} />

  const screens = {
    acknowledgment: {
      content: <AcknowledgmentStep quickStart={quickStart} accepted={accepted} onAcceptedChange={setAccepted} />,
      actions: [{ name: 'Get Started', type: 'black', isDisabled: !accepted, action: () => setStep('tournament') }],
      onBack: onClose,
    },
    tournament: {
      content: (
        <>
          {stepper('tournament')}
          <QuickStartStepHeader title="Tournament Setup" />
          <TournamentDetailsStep quickStart={quickStart} onChange={update} />
        </>
      ),
      actions: stepActions({
        onBack: () => setStep('acknowledgment'),
        onContinue: () => saveAndGo('tournament', 'rounds'),
        isDisabled: !stageComplete.tournament,
      }),
      isStep: true,
      onBack: () => setStep('acknowledgment'),
    },
    rounds: {
      content: (
        <>
          {stepper('rounds')}
          <QuickStartStepHeader title="Round Setup" />
          <RoundDetailsStep quickStart={quickStart} onChange={update} />
        </>
      ),
      actions: stepActions({
        onBack: () => setStep('tournament'),
        onContinue: () => saveAndGo('rounds', 'website'),
        isDisabled: !stageComplete.rounds,
      }),
      isStep: true,
      onBack: () => setStep('tournament'),
    },
    website: {
      content: (
        <>
          {stepper('website')}
          <QuickStartStepHeader title="Website Setup" />
          <WebsiteDetailsStep quickStart={quickStart} onChange={update} onGallery={() => setStep('banners')} />
        </>
      ),
      actions: stepActions({
        onBack: () => setStep('rounds'),
        onContinue: finish,
        continueLabel: 'Finish Setup',
      }),
      isStep: true,
      onBack: () => setStep('rounds'),
    },
    // Step 3a — preset banner picker. Picking one fills the banner and goes
    // back to Website Setup; there's no footer, the tiles are the action.
    banners: {
      title: 'Banner Images',
      content: (
        <>
          <QuickStartStepHeader title="Banner Images" />
          <BannerGalleryStep
            selected={quickStart.banner_image}
            onSelect={preset => {
              update({ banner_image: preset.src })
              setStep('website')
            }}
          />
        </>
      ),
      onBack: () => setStep('website'),
    },
    // Last screen — the tournament exists, and Tournament Overview opens its page.
    confirmation: {
      title: 'Tournament Created',
      content: <TournamentCreatedStep quickStart={quickStart} onViewWebsite={() => window.open('/event-site', '_blank')} />,
      actions: [
        { name: 'Tournament Overview', type: 'black', action: () => navigate(`/tournaments/${created?.id ?? ''}`) },
        { name: 'Close', type: 'light-grey', action: onClose },
      ],
      onBack: onClose,
    },
  }
  const screen = screens[step] ?? screens.acknowledgment


  return (
    <AppSidePanel
      isOpen={isOpen}
      onClose={onClose}
      onBack={screen.onBack}
      className={`qs-panel${screen.isStep ? ' qs-panel--steps' : ''}`}
      title={screen.title ?? 'Tournament Quick Start'}
      actions={screen.actions}
      actionsKey={step}
      bodyRef={bodyRef}
    >
      {screen.content}
    </AppSidePanel>
  )
}
