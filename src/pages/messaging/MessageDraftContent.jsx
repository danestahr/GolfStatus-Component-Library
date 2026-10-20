import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faPen, faUsers, faClone, faTrashCan } from '@fortawesome/free-solid-svg-icons'
import GSButton from '../../gs-lib/components/gs-button'
import GSEmptyList from '../../gs-lib/components/gs-empty-list'
import './MessageDraftPage.scss'

// ── Mock data ──────────────────────────────────────────────────────────────────
export const DRAFT = {
  subject: 'No Subject',
  tournamentCount: 0,
  groupCount: 0,
  createdBy: 'First Last',
}

// ── Sub-components ─────────────────────────────────────────────────────────────
function FormSection({ title, onEdit, children }) {
  return (
    <div className="msg-form-section">
      <div className="msg-form-section-head">
        <span className="msg-form-section-title">{title}</span>
        <GSButton buttonIcon={faPen} type="light-grey" onClick={onEdit} isFocusable />
      </div>
      <div className="msg-empty-card">{children}</div>
    </div>
  )
}

// The draft screen that goes inside an AppSidePanel — shared by the Messages
// list (which swaps it in over the type picker) and the standalone draft page.
export default function MessageDraftContent({ channel, onSelectRecipients }) {
  return (
    <>
    <div className="msg-hero">
      <div className="msg-hero-info">
        <div className="msg-hero-text">
          <div className="msg-hero-subject">{DRAFT.subject}</div>
          <div className="msg-hero-meta">{channel}</div>
          <div className="msg-hero-meta">{DRAFT.tournamentCount} Tournaments</div>
          <div className="msg-hero-meta">{DRAFT.groupCount} Groups</div>
        </div>
        <div className="msg-hero-created">Created by {DRAFT.createdBy}</div>
        <span className="msg-status-pill">
          <FontAwesomeIcon icon={faPen} />
          Draft
        </span>
      </div>

      <div className="msg-hero-actions">
        <GSButton title="Compose Message" buttonIcon={faPen} type="black" isFocusable />
        <GSButton buttonIcon={faClone} type="light-grey" isFocusable />
        <GSButton buttonIcon={faTrashCan} type="light-grey" isFocusable />
      </div>
    </div>

    <FormSection title="Recipients" onEdit={() => {}}>
      <GSEmptyList
        title="No Recipients"
        detail="Select who you want to receive this message."
        actions={[
          {
            title: 'Select Recipients',
            buttonIcon: faUsers,
            type: 'black',
            onClick: onSelectRecipients,
            isFocusable: true,
          },
        ]}
      />
    </FormSection>

    <FormSection title="Message Details" onEdit={() => {}}>
      <GSEmptyList
        title="No Message Content"
        detail="Start crafting your message."
        actions={[
          {
            title: 'Compose Message',
            buttonIcon: faPen,
            type: 'black',
            onClick: () => {},
            isFocusable: true,
          },
        ]}
      />
    </FormSection>
    </>
  )
}
