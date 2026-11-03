import { faPen, faCircleCheck } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import './QuickStartStepper.scss'

// Quick Start's three stages, shown as a breadcrumb-style pill row pinned
// under the panel header. Shared by every step screen so the look is changed
// in one place.
//
// Each stage is in one of four states:
//   active    the stage being edited — solid black pill with a pen
//   done      a stage that's been completed and saved — green pill with a check
//   available a stage that can be opened but isn't done — plain, empty circle
//   disabled  a stage that can't be opened yet — the same plain look, faded to 35%
// `enabledIds` says which stages can be visited and `doneIds` which are done;
// any enabled stage other than the active one is clickable, in either
// direction, when `onSelect` is given. Labels of non-active stages collapse to
// icon-only at the large-phone breakpoint.
export const QUICK_START_STAGES = [
  { id: 'tournament', label: 'Tournament' },
  { id: 'rounds', label: 'Round' },
  { id: 'website', label: 'Website' },
]

export default function QuickStartStepper({ activeId, enabledIds, doneIds = [], onSelect, stages = QUICK_START_STAGES }) {
  const activeIndex = stages.findIndex(s => s.id === activeId)

  return (
    <div className="qs-stepper-wrap">
    <div className="qs-stepper">
      {stages.map((stage, i) => {
        const enabled = !enabledIds || enabledIds.includes(stage.id)
        const state = i === activeIndex ? 'active' : !enabled ? 'disabled' : doneIds.includes(stage.id) ? 'done' : 'available'
        const clickable = (state === 'done' || state === 'available') && onSelect
        return (
          <div
            key={stage.id}
            className={`qs-step qs-step--${state}${clickable ? ' qs-step--clickable' : ''}`}
            onClick={clickable ? () => onSelect(stage.id) : undefined}
            aria-current={state === 'active' ? 'step' : undefined}
            aria-disabled={state === 'disabled' ? true : undefined}
          >
            {state === 'available' || state === 'disabled' ? <span className="qs-step-dot" /> : <FontAwesomeIcon icon={state === 'active' ? faPen : faCircleCheck} />}
            <span className="qs-step-label">{stage.label}</span>
          </div>
        )
      })}
    </div>
    </div>
  )
}
