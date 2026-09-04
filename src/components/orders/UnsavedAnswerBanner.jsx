import { faFloppyDisk } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import GSButton from '../../gs-lib/components/gs-button'
import './UnsavedAnswerBanner.scss'

// Shown in place of the silent discard-on-click-outside that used to close
// an answer tile's editor — clicking away from a dirty text/number edit now
// surfaces this instead of losing the draft, matching Save/Discard to the
// same checkmark-commits / outside-click-cancels pair the tile itself
// already offers. Not shown for a multiple-choice edit, since selecting an
// option there already saves immediately (see `selectAnswerOption` in each
// caller) with nothing left to strand.
export default function UnsavedAnswerBanner({ onSave, onDiscard, isSaving }) {
  return (
    <div className="ordr1-unsaved-banner">
      <FontAwesomeIcon icon={faFloppyDisk} className="ordr1-unsaved-banner-icon" />
      <span className="ordr1-unsaved-banner-text">There are unsaved changes!</span>
      <div className="ordr1-unsaved-banner-actions">
        <GSButton title="Save" type="black" isFocusable isDisabled={isSaving} onClick={onSave} />
        <GSButton title="Discard" type="light-grey" isFocusable isDisabled={isSaving} onClick={onDiscard} />
      </div>
    </div>
  )
}
