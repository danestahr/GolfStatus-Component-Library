import { useState } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faPlus, faPen, faClock, faCircleCheck, faClone, faChevronRight } from '@fortawesome/free-solid-svg-icons'
import GSButton from '../../gs-lib/components/gs-button'
import GSActionBar from '../../gs-lib/components/gs-action-bar'
import EntityListPage from '../../components/orders-forms/EntityListPage.jsx'
import AppSidePanel from '../../components/AppSidePanel'
import MessageDraftContent, { DRAFT } from './MessageDraftContent.jsx'
import { MESSAGES, MESSAGE_TYPES, typeName } from '../../data/mockMessages'
import './MessageListPage.scss'

const SECTIONS = [
  { status: 'scheduled', title: 'Scheduled Messages', icon: faClock, pill: 'Scheduled', byline: 'Scheduled by' },
  { status: 'draft', title: 'Draft Messages', icon: faPen, pill: 'Draft', byline: 'Created by' },
  { status: 'sent', title: 'Sent Messages', icon: faCircleCheck, pill: 'Sent', byline: 'Sent by' },
]

function MessageCard({ message, section, onClick }) {
  return (
    <div className="msg-card" onClick={onClick}>
      <div className="msg-card-text">
        <div className="msg-card-subject">{message.subject}</div>
        <div className="msg-card-meta">{message.channel}</div>
        <div className="msg-card-meta">{message.tournamentCount} Tournaments</div>
        <div className="msg-card-meta">{message.groupCount} Groups</div>
      </div>
      <div className="msg-card-text">
        {message.date && <div className="msg-card-meta">{message.date}</div>}
        <div className="msg-card-meta">{section.byline} {message.author}</div>
      </div>
      <span className={`msg-card-pill msg-card-pill--${section.status}`}>
        <FontAwesomeIcon icon={section.icon} />
        {section.pill}
      </span>
    </div>
  )
}

// Sent messages are a full-width vertical list (see the Sent Messages section
// in Figma) rather than the horizontal card strip the other sections use.
function SentMessageRow({ message, section, onClick }) {
  return (
    <div className="msg-row" onClick={onClick}>
      <div className="msg-row-info">
        <div className="msg-row-text">
          <div className="msg-row-subject">{message.subject}</div>
          <div className="msg-row-meta">{message.channel}</div>
          <div className="msg-row-meta">{message.totalRecipients} Total Recipients</div>
          <div className="msg-row-meta">{message.tournamentCount} Tournaments</div>
          <div className="msg-row-meta">{message.groupCount} Groups</div>
        </div>
        <div className="msg-row-text">
          <div className="msg-row-meta">{message.date}</div>
          <div className="msg-row-meta">{section.byline} {message.author}</div>
        </div>
        <span className="msg-card-pill msg-card-pill--sent">
          <FontAwesomeIcon icon={section.icon} />
          {section.pill}
        </span>
      </div>
      <GSButton buttonIcon={faClone} type="light-grey" onClick={e => e?.stopPropagation?.()} isFocusable />
    </div>
  )
}

export default function MessageListPage() {
  const [search, setSearch] = useState('')
  // One side panel for the whole flow, swapped by state (never a second stacked
  // panel, never a route change) so this list stays put behind it:
  // null = closed, 'type' = Message Type picker, 'draft' = a draft of draftTypeId.
  const [panelScreen, setPanelScreen] = useState(null)
  const [draftTypeId, setDraftTypeId] = useState(null)
  // Whether the draft was reached through the type picker (so its chevron steps
  // back to it) or opened straight from a card (so its chevron just closes).
  const [draftFromPicker, setDraftFromPicker] = useState(false)

  const query = search.trim().toLowerCase()
  const visible = MESSAGES.filter(m =>
    !query || `${m.subject} ${m.channel}`.toLowerCase().includes(query)
  )

  const closePanel = () => setPanelScreen(null)

  const openDraft = (typeId, fromPicker) => {
    setDraftTypeId(typeId)
    setDraftFromPicker(fromPicker)
    setPanelScreen('draft')
  }

  return (
    <>
      <EntityListPage
        className="msg-page"
        header="Messages"
        pageActions={[
          { buttonTitle: 'New Message', actionIcon: faPlus, type: 'black', actionClick: () => setPanelScreen('type') },
        ]}
        searchPlaceholder="Search Messages..."
        search={search}
        onSearchChange={setSearch}
        emptyMessage="No messages match your search."
      >
        {visible.length === 0 ? (
          <div className="efp-empty">No messages match your search.</div>
        ) : (
          SECTIONS.map(section => {
            const messages = visible.filter(m => m.status === section.status)
            if (messages.length === 0) return null
            return (
              <div key={section.status} className="msg-section">
                <div className="msg-section-header">
                  <div className="msg-section-title">{section.title} ({messages.length})</div>
                </div>
                {section.status === 'sent' ? (
                  <div className="msg-section-list">
                    {messages.map(m => (
                      <SentMessageRow key={m.id} message={m} section={section} onClick={() => openDraft(m.typeId, false)} />
                    ))}
                  </div>
                ) : (
                  <div className="msg-section-strip">
                    {messages.map(m => (
                      <MessageCard key={m.id} message={m} section={section} onClick={() => openDraft(m.typeId, false)} />
                    ))}
                  </div>
                )}
              </div>
            )
          })
        )}
      </EntityListPage>

      <AppSidePanel
        isOpen={panelScreen !== null}
        onClose={closePanel}
        onBack={panelScreen === 'draft' && draftFromPicker ? () => setPanelScreen('type') : closePanel}
        title={panelScreen === 'draft' ? DRAFT.subject : 'Message Type'}
        actions={
          panelScreen === 'draft'
            ? [
                { name: 'Send Now', type: 'black', action: () => {} },
                { name: 'Send Later', type: 'black-border', action: () => {} },
              ]
            : [{ name: 'Cancel', type: 'light-grey', action: closePanel }]
        }
      >
        {panelScreen === 'draft' ? (
          <MessageDraftContent channel={typeName(draftTypeId)} onSelectRecipients={() => {}} />
        ) : (
          <>
            <GSActionBar type="x-large-pad H3" header="Message Type" />
            {MESSAGE_TYPES.map(type => (
              <div key={type.id} className="msg-type-row" onClick={() => openDraft(type.id, true)}>
                <div className="msg-type-text">
                  <div className="msg-type-name">{type.name}</div>
                  <div className="msg-type-desc">{type.description}</div>
                </div>
                <FontAwesomeIcon icon={faChevronRight} />
              </div>
            ))}
          </>
        )}
      </AppSidePanel>
    </>
  )
}
