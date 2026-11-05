import { faArrowRight } from '@fortawesome/free-solid-svg-icons'
import GSButton from '../../../gs-lib/components/gs-button'
import { isDone } from '../../../data/mockChecklist'
import './ChecklistWidget.scss'

const RING_SIZE = 84
const RING_STROKE = 14
const RADIUS = (RING_SIZE - RING_STROKE) / 2
const CIRCUMFERENCE = 2 * Math.PI * RADIUS

// Event Planner card (Figma): title and arrow, then a progress ring with the
// completion percent and task count. The arrow (and the progress row) open
// the full checklist in the page's side panel.
export default function ChecklistWidget({ items, tournament, onOpen }) {
  const total = items.length
  const done = items.filter(i => isDone(i, tournament)).length
  const percent = total ? Math.round((done / total) * 100) : 0

  return (
    <section className="cl-widget">
      <div className="cl-widget-head">
        <div className="cl-widget-text">
          <div className="cl-widget-title">Event Planner</div>
          <div className="cl-widget-subtitle">Stay on track</div>
        </div>
        <GSButton buttonIcon={faArrowRight} type="white" onClick={onOpen} isFocusable />
      </div>

      <hr className="cl-widget-divider" />

      <div className="cl-widget-progress" onClick={onOpen}>
        <svg
          className="cl-widget-ring"
          width={RING_SIZE}
          height={RING_SIZE}
          viewBox={`0 0 ${RING_SIZE} ${RING_SIZE}`}
          role="progressbar"
          aria-valuenow={percent}
          aria-valuemin={0}
          aria-valuemax={100}
        >
          <circle className="cl-widget-ring-track" cx={RING_SIZE / 2} cy={RING_SIZE / 2} r={RADIUS} strokeWidth={RING_STROKE} fill="none" />
          <circle
            className="cl-widget-ring-bar"
            cx={RING_SIZE / 2}
            cy={RING_SIZE / 2}
            r={RADIUS}
            strokeWidth={RING_STROKE}
            fill="none"
            strokeDasharray={CIRCUMFERENCE}
            strokeDashoffset={CIRCUMFERENCE * (1 - percent / 100)}
            transform={`rotate(-90 ${RING_SIZE / 2} ${RING_SIZE / 2})`}
          />
        </svg>
        <div className="cl-widget-stats">
          <div className="cl-widget-percent">{percent}% Complete</div>
          <div className="cl-widget-count">{done}/{total} Tasks</div>
        </div>
      </div>
    </section>
  )
}
