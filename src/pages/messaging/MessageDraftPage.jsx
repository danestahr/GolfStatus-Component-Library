import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faPen, faUsers, faClone, faTrashCan } from '@fortawesome/free-solid-svg-icons'
import GSButton from '../../gs-lib/components/gs-button'
import GSEmptyList from '../../gs-lib/components/gs-empty-list'
import AppSidePanel from '../../components/AppSidePanel'
import './MessageDraftPage.scss'

// ── Mock data ──────────────────────────────────────────────────────────────────
const DRAFT = {
  subject: 'No Subject',
  channel: 'Email',
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

// ── Page ───────────────────────────────────────────────────────────────────────
export default function MessageDraftPage() {
  const navigate = useNavigate()
  const [panelOpen, setPanelOpen] = useState(false)

  const goToRecipients = () => navigate('/messaging/recipients')

  return (
    <div className="message-draft-page">
      <div className="page-background">
        <GSButton
          title="Open Message Draft"
          type="black"
          onClick={() => setPanelOpen(true)}
          isFocusable
        />
      </div>

      <AppSidePanel
        isOpen={panelOpen}
        onClose={() => setPanelOpen(false)}
        title={DRAFT.subject}
        actions={[
          { name: 'Send Now', type: 'black', action: () => {} },
          { name: 'Send Later', type: 'black-border', action: () => {} },
        ]}
      >
        <div className="msg-hero">
          <div className="msg-hero-info">
            <div className="msg-hero-text">
              <div className="msg-hero-subject">{DRAFT.subject}</div>
              <div className="msg-hero-meta">{DRAFT.channel}</div>
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
                onClick: goToRecipients,
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
      </AppSidePanel>
    </div>
  )
}
