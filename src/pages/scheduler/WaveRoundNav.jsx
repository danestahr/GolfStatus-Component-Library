import { useEffect, useRef, useState } from 'react'
import { faChevronLeft } from '@fortawesome/free-solid-svg-icons'
import GSButton from '../../gs-lib/components/gs-button'
import './WaveRoundNav.scss'

// Self-contained two-step nav for picking which round's hole assignments to
// view, for tournaments that organize rounds into waves: first pick a wave
// (a row of wave buttons under a "Waves" label), then that swaps for a back
// button + that wave's own round buttons, with the label growing into a
// "Waves / Wave Name" breadcrumb — rather than showing every wave's rounds
// at once. Owns its own drill-down state (selectedWaveId) so the parent only
// needs to hand it the active round/wave — dismissing the whole thing back
// to collapsed is the parent's own "Change Round"/"Close" toggle, not
// anything this component exposes itself.
//
// Also reused as-is for a format-less tournament's Round Number groups — a
// Round Number is essentially a wave, so the parent just hands this the same
// {id, name, roundIds} shape built from those groups instead of real waves,
// with groupLabel swapped from the default "Waves" to "Rounds" so the
// breadcrumb still reads correctly.
//
// Stays mounted for as long as the parent's wave/round format calls for it
// at all (see `isOpen`) rather than being inserted/removed from the DOM each
// time it's toggled — that's what lets .wrn-collapse animate it open/closed
// instead of popping the columns below it up and down.
export default function WaveRoundNav({
  waves, activeWaveId, activeRound, roundName, onSelectRound, isOpen, groupLabel = 'Waves',
}) {
  const [selectedWaveId, setSelectedWaveId] = useState(activeWaveId)

  // Re-drills into the active round's own wave every time the nav opens, so
  // it never greets you with a stale "Waves" list left over from having
  // backed out the last time it was open — except when that wave only has
  // the one round you're already viewing, since drilling into it would just
  // show a single tab (the round you're on) behind a back arrow with
  // nothing else to pick. There's nowhere useful to land inside a one-round
  // wave, so it opens straight to the wave list instead.
  useEffect(() => {
    if (!isOpen) return
    const activeWave = waves.find(w => w.id === activeWaveId)
    setSelectedWaveId(activeWave?.roundIds.length === 1 ? null : activeWaveId)
  }, [isOpen, activeWaveId, waves])

  const selectedWave = waves.find(w => w.id === selectedWaveId)

  // Forces the tab row to remount (replaying its fade/slide-in animation,
  // see the keyframes in WaveRoundNav.scss) whenever the step actually
  // changes, rather than diffing in place — a wave's rounds and the wave
  // list itself have nothing in common to reconcile between anyway.
  const tabsKey = selectedWave ? `rounds-${selectedWave.id}` : 'waves'

  // The one tab that should already be scrolled into view when the row
  // mounts — the active round while drilled into its wave, the active wave
  // itself at the top step — so a long, overflowing tab row never leaves
  // you hunting sideways for where you already are.
  const activeTabRef = useRef(null)
  useEffect(() => {
    if (isOpen) activeTabRef.current?.scrollIntoView({ block: 'nearest', inline: 'nearest' })
  }, [isOpen, tabsKey])

  return (
    <div className={`wrn-collapse${isOpen ? ' wrn-collapse--open' : ''}`}>
      <div className="wrn-collapse-inner">
        <div className="wrn-row">
          <div className="wrn-content">
            <div className="wrn-label">
              {selectedWave ? `${groupLabel} / ${selectedWave.name}` : groupLabel}
            </div>
            <div className="wrn-tabs" key={tabsKey}>
              {selectedWave && (
                <GSButton
                  type="light-grey icon"
                  isFocusable
                  buttonIcon={faChevronLeft}
                  onClick={() => setSelectedWaveId(null)}
                />
              )}
              {selectedWave
                ? selectedWave.roundIds.map(r => (
                  <div key={r} ref={activeRound === r ? activeTabRef : null} className="wrn-tab-wrap">
                    <GSButton
                      type={activeRound === r ? 'black' : 'light-grey'}
                      isFocusable
                      title={roundName(r)}
                      onClick={() => onSelectRound(r)}
                    />
                  </div>
                ))
                : waves.map(w => (
                  <div key={w.id} ref={w.id === activeWaveId ? activeTabRef : null} className="wrn-tab-wrap">
                    <GSButton
                      type={w.id === activeWaveId ? 'black' : 'light-grey'}
                      isFocusable
                      title={w.name}
                      // A wave with only one round has nothing to drill into —
                      // picking it IS picking that round, so it jumps straight
                      // to its hole assignments instead of stopping on a
                      // one-item round step the tap would just repeat.
                      onClick={() => (
                        w.roundIds.length === 1 ? onSelectRound(w.roundIds[0]) : setSelectedWaveId(w.id)
                      )}
                    />
                  </div>
                ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
