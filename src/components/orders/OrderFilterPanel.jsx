import { useEffect, useState } from 'react'
import AppSidePanel from '../AppSidePanel'
import GSSelect from '../../gs-lib/components/gs-select'
import GSButton from '../../gs-lib/components/gs-button'
import './OrderFilterPanel.scss'

const STATUS_OPTIONS = [
  { value: 'paid', label: 'Paid' },
  { value: 'pending', label: 'Pending' },
  { value: 'refunded', label: 'Refunded' },
  { value: 'void', label: 'Void' },
]

const EMPTY_FILTERS = { status: null, activatedOn: '', deactivatedOn: '' }

export default function OrderFilterPanel({ isOpen, onClose, filters, onApply, onClear }) {
  const [draft, setDraft] = useState(filters ?? EMPTY_FILTERS)

  useEffect(() => {
    if (isOpen) setDraft(filters ?? EMPTY_FILTERS)
  }, [isOpen, filters])

  return (
    <AppSidePanel isOpen={isOpen} onClose={onClose} title="Filter">
      <div className="ord-filter">
        <div className="ord-filter-section">
          <div className="ord-filter-title">Date Filter</div>

          <label className="ord-filter-label">Activate On</label>
          <input
            type="date"
            className="ord-filter-date"
            value={draft.activatedOn}
            onChange={e => setDraft({ ...draft, activatedOn: e.target.value })}
          />

          <label className="ord-filter-label">Deactivate On</label>
          <input
            type="date"
            className="ord-filter-date"
            value={draft.deactivatedOn}
            onChange={e => setDraft({ ...draft, deactivatedOn: e.target.value })}
          />
        </div>

        <div className="ord-filter-section">
          <div className="ord-filter-title">Status Filter</div>
          <label className="ord-filter-label">Status</label>
          <GSSelect
            options={STATUS_OPTIONS}
            selectedOption={STATUS_OPTIONS.find(o => o.value === draft.status) ?? null}
            onChange={option => setDraft({ ...draft, status: option?.value ?? null })}
            placeholder="Select a Status..."
            isClearable
            isSearchable={false}
            menuPortalTarget={document.body}
            menuPosition="fixed"
          />
        </div>
      </div>

      <div className="ord-filter-actions">
        <GSButton
          title="Apply"
          type="black"
          onClick={() => { onApply(draft); onClose() }}
        />
        <GSButton
          title="Clear Filter"
          type="light-grey"
          onClick={() => { setDraft(EMPTY_FILTERS); onClear(); onClose() }}
        />
      </div>
    </AppSidePanel>
  )
}
