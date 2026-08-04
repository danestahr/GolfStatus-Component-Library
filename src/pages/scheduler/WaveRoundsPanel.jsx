import {
  faPlus,
  faPen,
  faTrash,
  faRetweet,
} from '@fortawesome/free-solid-svg-icons'
import GSButton from '../../gs-lib/components/gs-button'
import GSActionBar from '../../gs-lib/components/gs-action-bar'
import GSQuickFilter from '../../gs-lib/components/gs-quick-filter'
import GSEmptyList from '../../gs-lib/components/gs-empty-list'
import AppSidePanel from '../../components/AppSidePanel'
import './WaveRoundsPanel.scss'

// Round summary used for both sides of the quick filter (linked and
// available) — same name/course convention as the rest of the scheduler's
// round rows. otherWaveName is set only on the available side, for a round
// that's already linked to a different wave (see onAddRound below).
function RoundSummary({ name, course, otherWaveName }) {
  return (
    <div className="wp-round-row-text">
      <div className="wp-round-row-name">{name}</div>
      <div className="wp-round-row-sub">{course}</div>
      {otherWaveName && (
        <div className="wrp-round-linked-elsewhere">Linked to {otherWaveName}</div>
      )}
    </div>
  )
}

// The one page for everything a wave's round roster needs: rename the wave
// (via the pencil, which hands off to the same name-only form used to
// create it — see AddWavePanel/openEditWaveNamePanel in
// TournamentSchedulerPage), add one of the tournament's rounds (the quick
// filter's search list), remove one already linked (its selected-list X), or
// delete the wave itself (via the trash icon, which hands off to
// DeleteWavePanel) — opened either right after Add Wave, or from an existing
// wave's "View Wave" action in WavesPanel. The available list includes
// rounds already linked to a different wave too (flagged with the "Linked
// to" note and swap icon below) — picking one doesn't link it on the spot
// like an unlinked round would; TournamentSchedulerPage's onAddRound routes
// it to SwapRoundWavePanel to confirm the move first.
export default function WaveRoundsPanel({
  isOpen, onClose,
  wave, linkedRounds, availableRounds,
  onAddRound, onRemoveRound, onEditName, onCreateRound, onStartDelete,
  dimOverlay, noTransition,
}) {
  const hasLinkedRounds = linkedRounds.length > 0
  const hasAvailableRounds = availableRounds.length > 0

  // A wave with nothing linked yet gets its own empty state sitting above
  // the quick filter's lists — with nothing left to link either (every other
  // round is already spoken for, or the tournament has none at all), it's
  // the panel's only content and offers to create one on the spot; otherwise
  // it's just a heads-up above the pickable list rendered below it.
  const emptySelectedContent = !hasLinkedRounds ? (
    <GSEmptyList
      title="No Rounds Linked Yet"
      detail={hasAvailableRounds ? 'Link one of the available rounds below.' : 'Add a round to get started.'}
      actions={hasAvailableRounds ? undefined : [{ title: 'Add Round', type: 'black', isFocusable: true, onClick: onCreateRound }]}
    />
  ) : undefined

  return (
    <AppSidePanel
      isOpen={isOpen}
      onClose={onClose}
      title="Wave"
      dimOverlay={dimOverlay}
      noTransition={noTransition}
      actions={[
        { name: 'Done', type: 'light-grey', action: onClose },
      ]}
    >
      <GSActionBar
        type="form-header H3"
        header={wave?.name}
        pageActions={[
          { buttonTitle: 'Add Round', buttonIcon: faPlus, type: 'black', actionClick: onCreateRound },
          { buttonIcon: faPen, type: 'light-grey icon', actionClick: onEditName },
          { buttonIcon: faTrash, type: 'light-grey icon', actionClick: onStartDelete },
        ]}
      />

      <div className="wrp-body">
        <GSQuickFilter
          multiple
          selectedList={linkedRounds}
          filteredList={availableRounds}
          getItem={r => (
            <>
              <RoundSummary name={r.name} course={r.course} otherWaveName={r.otherWaveName} />
              {r.otherWaveId != null && <GSButton type="light-grey icon" size="secondary" buttonIcon={faRetweet} />}
            </>
          )}
          itemSelected={r => onAddRound(r.round)}
          itemRemoved={r => onRemoveRound(r.round)}
          emptySelectedList={emptySelectedContent}
        />
      </div>
    </AppSidePanel>
  )
}
