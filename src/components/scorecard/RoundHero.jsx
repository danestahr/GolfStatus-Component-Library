import GSButton from '../../gs-lib/components/gs-button'
import './RoundHero.scss'

export default function RoundHero({
  pillLabel,
  pillType = 'green',
  subtitle,
  toggleLabel,
  onToggle,
  stats = [],
  selectedKey,
  onSelectStat,
}) {
  return (
    <div className="round-hero">
      <div className="hero-card">
        <div className="hero-top">
          <div className="hero-top-text">
            <div className="hero-pill">
              <GSButton isPill title={pillLabel} type={pillType} />
            </div>
            <div className="hero-subtitle">{subtitle}</div>
          </div>
          {toggleLabel && (
            <GSButton
              title={toggleLabel}
              type="light-grey"
              onClick={onToggle}
              isFocusable
            />
          )}
        </div>

        <div className="hero-stats">
          {stats.map(stat => (
            <button
              key={stat.key}
              type="button"
              className={`stat-box${selectedKey === stat.key ? ' active' : ''}`}
              onClick={() => onSelectStat?.(stat.key)}
            >
              <span className="stat-value">{stat.value}</span>
              <span className="stat-label">{stat.label}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
