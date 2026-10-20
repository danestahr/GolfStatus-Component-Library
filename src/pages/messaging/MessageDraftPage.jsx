import { useState } from 'react'
import GSButton from '../../gs-lib/components/gs-button'
import AppSidePanel from '../../components/AppSidePanel'
import MessageDraftContent, { DRAFT } from './MessageDraftContent.jsx'
import './MessageDraftPage.scss'

export default function MessageDraftPage() {
  const [panelOpen, setPanelOpen] = useState(false)

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
        <MessageDraftContent channel="Email" />
      </AppSidePanel>
    </div>
  )
}
