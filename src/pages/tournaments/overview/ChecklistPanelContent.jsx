import { faCircleInfo, faWandMagicSparkles } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import GSCheckbox from '../../../gs-lib/components/gs-checkbox'
import GSinput from '../../../gs-lib/components/gs-input'
import GSSelect from '../../../gs-lib/components/gs-select'
import GSFormSection from '../../../gs-lib/components/gs-form-section'
import { ASSIGNEES, PHASES } from '../../../data/mockChecklist'
import './ChecklistPanel.scss'

// "Task" screen: view/edit/add one task. Controlled by the page's draft.
export function ChecklistItemFields({ draft, isNew, onChange, onSubmit, onGo }) {
  const phaseOptions = PHASES.map(p => ({ value: p.id, label: p.label }))
  const assigneeOptions = ASSIGNEES.map(a => ({ value: a, label: a }))
  return (
    <div className="cl-panel cl-panel--item">
      {!isNew && draft.why && (
        <div className="cl-panel-why">
          <FontAwesomeIcon icon={faCircleInfo} />
          <div>
            <strong>Why it matters</strong>
            <p>{draft.why}</p>
            {draft.to && (
              <button type="button" onClick={() => onGo(draft.to)}>Open the tool</button>
            )}
          </div>
        </div>
      )}

      {draft.auto && (
        <div className="cl-panel-auto-note">
          <FontAwesomeIcon icon={faWandMagicSparkles} /> This task completes automatically once it's done in GolfStatus.
        </div>
      )}

      <GSFormSection
        type="vertical xx-large-gap"
        fields={[
          {
            label: 'Task',
            required: true,
            isEditable: true,
            customView: true,
            value: (
              <GSinput
                placeholder="e.g. Order trophies"
                textValue={draft.title}
                onChange={e => onChange({ title: e.target.value })}
                onSubmit={onSubmit}
              />
            ),
          },
          {
            label: 'Phase',
            isEditable: true,
            customView: true,
            value: (
              <GSSelect
                options={phaseOptions}
                selectedOption={phaseOptions.find(o => o.value === draft.phase)}
                onChange={option => onChange({ phase: option?.value ?? option })}
                isSearchable={false}
                menuPortalTarget={document.body}
                menuPosition="fixed"
              />
            ),
          },
          {
            label: 'Due Date',
            required: true,
            isEditable: true,
            customView: true,
            value: (
              <input
                type="date"
                className="cl-panel-date"
                value={draft.dueISO}
                onChange={e => onChange({ dueISO: e.target.value })}
              />
            ),
          },
          {
            label: 'Assigned To',
            isEditable: true,
            customView: true,
            value: (
              <GSSelect
                options={assigneeOptions}
                selectedOption={assigneeOptions.find(o => o.value === draft.assignee)}
                onChange={option => onChange({ assignee: option?.value ?? option })}
                isSearchable={false}
                menuPortalTarget={document.body}
                menuPosition="fixed"
              />
            ),
          },
          {
            label: 'Notes',
            isEditable: true,
            customView: true,
            value: (
              <GSinput
                type="text-area"
                placeholder="Add details, contacts, or links"
                textValue={draft.notes}
                onChange={e => onChange({ notes: e.target.value })}
              />
            ),
          },
        ]}
      />

      {!draft.auto && (
        <div className="cl-panel-complete">
          <GSCheckbox
            checked={draft.done}
            label="Mark as complete"
            onClick={() => onChange({ done: !draft.done })}
          />
        </div>
      )}
    </div>
  )
}
