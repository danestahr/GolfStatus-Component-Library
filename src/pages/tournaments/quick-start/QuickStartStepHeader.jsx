import './QuickStartStepHeader.scss'

// Title block at the top of each Quick Start step (below the stepper): a
// 20px title, optional muted subtitle, and an optional right-hand action
// (e.g. a "Skip" button).
export default function QuickStartStepHeader({ title, subtitle, action }) {
  return (
    <div className="qs-step-header">
      <div className="qs-step-header-text">
        <h3>{title}</h3>
        {subtitle && <p>{subtitle}</p>}
      </div>
      {action}
    </div>
  )
}
