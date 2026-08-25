import { useEffect, useRef, useState } from 'react'
import { faTrash, faCheck, faPlus, faGripLines, faPen } from '@fortawesome/free-solid-svg-icons'

import GSActionBar from '../../gs-lib/components/gs-action-bar'
import GSFormSection from '../../gs-lib/components/gs-form-section'
import GSinput from '../../gs-lib/components/gs-input'
import GSSelect from '../../gs-lib/components/gs-select'
import GSToggle from '../../gs-lib/components/gs-toggle'
import GSButton from '../../gs-lib/components/gs-button'
import GSEmptyList from '../../gs-lib/components/gs-empty-list'
import './AddQuestionFields.scss'

export const RESPONSE_TYPE_OPTIONS = [
  { value: 'text', label: 'Text' },
  { value: 'dropdown', label: 'Dropdown' },
  { value: 'number', label: 'Number' },
]

export const emptyQuestionDraft = {
  question: '',
  active: true,
  responseType: null,
  placeholder: '',
  required: false,
  dropdownOptions: [],
}

// Best-effort reverse of orderUtils.responseTypeFor's "Dropdown"/"Text
// Response" vocabulary — used to pre-fill a draft for a question that only
// has that label (a real order-derived question being edited for the first
// time, with no draft of its own yet).
export function findResponseTypeOption(label) {
  return RESPONSE_TYPE_OPTIONS.find(o => o.label === label) ?? RESPONSE_TYPE_OPTIONS.find(o => o.value === 'text') ?? null
}

// One dropdown option — tap the pencil icon to edit it in place (Enter or
// the input's own black save button commits, Escape or a click outside the
// tile cancels), tap the trash icon to remove it, or drag the grip handle
// to reorder (only shown once there's more than one option — same
// convention as WaveCard/SponsorRow). All three controls hide while
// editing so they don't compete with Save. A brand new option (added via
// "Add Option" above) mounts already in this edit state, empty, ready to
// type — there's no separate "new option" text field; cancelling or
// committing empty discards it instead of leaving a blank tile behind.
//
// Reordering itself is driven entirely by the parent (see AddQuestionFields'
// pointer-based drag) — this component just renders whatever offsetY/
// isDragging it's given and forwards the grabber's pointerdown upward,
// same split as WaveCard/WavesPanel.
function DropdownOptionRow({
  id, value, placeholder,
  showGrabber, isDragging, offsetY,
  onGrabberPointerDown, onRowRef,
  onSave, onRemove, onEditingChange,
}) {
  // Seeded once from the incoming value at mount — safe only because the
  // parent keys each row by a stable id (not array index), so a row's own
  // identity (and this initial isEditing/draftValue) never gets silently
  // reassigned to a different option out from under it when the list is
  // reordered (e.g. a new option prepended to the top).
  const [isEditing, setIsEditing] = useState(value === '')
  const [draftValue, setDraftValue] = useState(value)
  const rowRef = useRef(null)

  // Lets the parent disable "Add Option" while any row is mid-edit — adding
  // another option out from under an in-progress edit would just be
  // confusing. Reports itself out on unmount too, so removing a row that's
  // still editing doesn't leave the parent thinking it's still open.
  useEffect(() => {
    onEditingChange?.(id, isEditing)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isEditing])
  useEffect(() => {
    return () => onEditingChange?.(id, false)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  function startEditing() {
    setDraftValue(value)
    setIsEditing(true)
  }

  function commit() {
    const trimmed = draftValue.trim()
    if (trimmed) {
      onSave(trimmed)
      setIsEditing(false)
    } else {
      onRemove()
    }
  }

  function cancel() {
    if (value === '') onRemove()
    else setIsEditing(false)
  }

  useEffect(() => {
    if (!isEditing) return
    function handleMouseDown(e) {
      if (rowRef.current && !rowRef.current.contains(e.target)) cancel()
    }
    document.addEventListener('mousedown', handleMouseDown)
    return () => document.removeEventListener('mousedown', handleMouseDown)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isEditing])

  // GSinput doesn't forward autoFocus to its underlying <input> — focus is
  // set imperatively by reaching into the row's own DOM once it renders it.
  useEffect(() => {
    if (isEditing) rowRef.current?.querySelector('input')?.focus()
  }, [isEditing])

  const style = {
    transform: offsetY ? `translateY(${offsetY}px)` : undefined,
    zIndex: isDragging ? 2 : undefined,
  }

  return (
    <div
      className={`aqf-option-item${isDragging ? ' aqf-option-item--dragging' : ''}`}
      ref={node => {
        rowRef.current = node
        onRowRef?.(node)
      }}
      style={style}
      onKeyDown={e => e.key === 'Escape' && cancel()}
    >
      <div className="aqf-option-row">
        {isEditing ? (
          <GSinput
            placeholder={placeholder}
            textValue={draftValue}
            onChange={e => setDraftValue(e.target.value)}
            onSubmit={commit}
            rightIcon={faCheck}
            rightIconClick={commit}
            buttonStyle={{ background: '#232323', color: '#fff' }}
          />
        ) : (
          <>
            <div className="aqf-option-label">{value}</div>
            <GSButton size="primary" isFocusable buttonIcon={faPen} onClick={startEditing} />
            <GSButton size="primary" isFocusable buttonIcon={faTrash} onClick={onRemove} />
          </>
        )}
      </div>

      {!isEditing && showGrabber && (
        <div className="aqf-option-drag-handle" onPointerDown={onGrabberPointerDown}>
          <GSButton size="primary" buttonIcon={faGripLines} onClick={e => e.stopPropagation()} />
        </div>
      )}
    </div>
  )
}

// The "Add Question" screen opened from OrderFormOverviewDraft1 (Figma
// "Question Details"). A fully controlled fields-only component, same
// convention as OrderFormResponseEditFieldsDraft1 — the page that owns the
// single AppSidePanel holds the draft state and renders this in place of
// whatever screen was showing before, rather than this component opening a
// second panel of its own (side panels replace each other, they aren't
// stacked routes). Saving is a stub — there's no form-builder backing this
// prototype's mock data, same convention as this page's own "Edit Form"/
// "Edit Question" pencils.
export default function AddQuestionFields({ draft, onChange, onSubmit, isEditing }) {
  const isDropdown = draft.responseType?.value === 'dropdown'
  // Seeded from whatever ids the draft already has (not always 0) — this
  // component remounts fresh every time the Add/Edit Question screen
  // reopens (e.g. save, then reopen the same question), so a plain
  // useRef(0) would collide with ids already persisted on draft.dropdownOptions,
  // causing React to reuse an existing (non-editing) row's instance for the
  // "new" option instead of mounting a fresh one in edit mode.
  const nextOptionId = useRef(Math.max(0, ...draft.dropdownOptions.map(o => o.id)))
  // Which option rows currently have their inline editor open — "Add
  // Option" disables itself while this is non-empty, since adding another
  // option out from under an in-progress edit would just be confusing.
  const [editingOptionIds, setEditingOptionIds] = useState(() => new Set())
  const anyOptionEditing = editingOptionIds.size > 0

  // Pointer-based drag-to-reorder for dropdown options — same live-swap
  // convention as WavesPanel's wave reordering (see that file's own
  // comments): dragging past the midpoint of a neighboring tile swaps it
  // immediately in `draftOptionOrder`, with a brief reverse-offset "flash"
  // on whichever tile just got displaced so it visibly slides into its new
  // slot instead of jump-cutting there. Deliberately not native HTML5
  // drag-and-drop — that only reorders on drop, with a static drag-ghost
  // image in between; this swaps live as you drag, same as the waves list.
  const [draggingOptionId, setDraggingOptionId] = useState(null)
  const [dragOffsetY, setDragOffsetY] = useState(0)
  const [draftOptionOrder, setDraftOptionOrder] = useState(null)
  const [flashOffsets, setFlashOffsets] = useState({})
  const optionRowRefs = useRef(new Map())
  const optionsBoxRef = useRef(null)
  const dragStartYRef = useRef(0)

  function setOptionEditing(id, isEditingOption) {
    setEditingOptionIds(prev => {
      const next = new Set(prev)
      if (isEditingOption) next.add(id)
      else next.delete(id)
      return next
    })
  }

  function addOption() {
    nextOptionId.current += 1
    onChange({ dropdownOptions: [{ id: nextOptionId.current, value: '' }, ...draft.dropdownOptions] })
  }

  function updateOption(id, value) {
    onChange({ dropdownOptions: draft.dropdownOptions.map(o => (o.id === id ? { ...o, value } : o)) })
  }

  function removeOption(id) {
    onChange({ dropdownOptions: draft.dropdownOptions.filter(o => o.id !== id) })
  }

  function setOptionRowRef(id, el) {
    if (el) optionRowRefs.current.set(id, el)
    else optionRowRefs.current.delete(id)
  }

  // One row's height + the gap after it — every tile's movement during a
  // drag is some whole multiple of this. See WavesPanel's identical helper
  // for why it's measured fresh each move rather than cached.
  function measureOptionRowStep(excludeId) {
    const gap = optionsBoxRef.current ? parseFloat(getComputedStyle(optionsBoxRef.current).rowGap) || 0 : 0
    for (const [id, el] of optionRowRefs.current) {
      if (id === excludeId) continue
      return el.getBoundingClientRect().height + gap
    }
    return 0
  }

  function handleGrabberPointerDown(e, id) {
    if (e.button != null && e.button !== 0) return
    e.preventDefault()
    dragStartYRef.current = e.clientY
    setDraggingOptionId(id)
    setDragOffsetY(0)
    setDraftOptionOrder(draft.dropdownOptions.map(o => o.id))
  }

  function handleGrabberPointerMove(e) {
    if (draggingOptionId == null) return
    const step = measureOptionRowStep(draggingOptionId)
    let offset = e.clientY - dragStartYRef.current
    if (step > 0) {
      const order = [...(draftOptionOrder ?? draft.dropdownOptions.map(o => o.id))]
      let idx = order.indexOf(draggingOptionId)
      const flashes = {}
      let didSwap = false
      while (idx < order.length - 1 && offset > step / 2) {
        const otherId = order[idx + 1]
        order[idx] = otherId
        order[idx + 1] = draggingOptionId
        flashes[otherId] = step
        idx += 1
        offset -= step
        didSwap = true
      }
      while (idx > 0 && offset < -step / 2) {
        const otherId = order[idx - 1]
        order[idx] = otherId
        order[idx - 1] = draggingOptionId
        flashes[otherId] = -step
        idx -= 1
        offset += step
        didSwap = true
      }
      if (didSwap) {
        setDraftOptionOrder(order)
        setFlashOffsets(prev => ({ ...prev, ...flashes }))
        // Double rAF: the flash offset needs to actually paint before the
        // next frame clears it to 0, or there's nothing for the transition
        // to animate from (see WavesPanel's identical comment).
        requestAnimationFrame(() => {
          requestAnimationFrame(() => {
            setFlashOffsets(prev => {
              const next = { ...prev }
              Object.keys(flashes).forEach(flashedId => { next[flashedId] = 0 })
              return next
            })
          })
        })
      }
      const min = -idx * step
      const max = (order.length - 1 - idx) * step
      offset = Math.min(Math.max(offset, min), max)
    }
    setDragOffsetY(offset)
    dragStartYRef.current = e.clientY - offset
  }

  function handleGrabberPointerUp() {
    if (draftOptionOrder && draftOptionOrder.some((id, i) => id !== draft.dropdownOptions[i]?.id)) {
      const reordered = draftOptionOrder.map(id => draft.dropdownOptions.find(o => o.id === id)).filter(Boolean)
      onChange({ dropdownOptions: reordered })
    }
    setDraggingOptionId(null)
    setDragOffsetY(0)
    setFlashOffsets({})
    setDraftOptionOrder(null)
  }

  // Refs, not direct listener args — same reasoning as WavesPanel: the
  // window listener effect only re-subscribes when draggingOptionId flips,
  // so its closure would otherwise be stuck on a stale draftOptionOrder.
  const pointerMoveRef = useRef(() => {})
  const pointerUpRef = useRef(() => {})
  pointerMoveRef.current = handleGrabberPointerMove
  pointerUpRef.current = handleGrabberPointerUp

  useEffect(() => {
    if (draggingOptionId == null) return
    const onMove = e => pointerMoveRef.current(e)
    const onUp = e => pointerUpRef.current(e)
    window.addEventListener('pointermove', onMove)
    window.addEventListener('pointerup', onUp)
    window.addEventListener('pointercancel', onUp)
    return () => {
      window.removeEventListener('pointermove', onMove)
      window.removeEventListener('pointerup', onUp)
      window.removeEventListener('pointercancel', onUp)
    }
  }, [draggingOptionId])

  const displayOptions = draftOptionOrder
    ? draftOptionOrder.map(id => draft.dropdownOptions.find(o => o.id === id)).filter(Boolean)
    : draft.dropdownOptions

  return (
    <div className="ordr1-list">
      <GSActionBar
        type="form-header H3 aqf-question-header"
        header={isEditing ? 'Edit Question' : 'Add Question'}
        pageActions={[{
          actionType: 'toggle',
          pageActionProps: {
            label: 'Active',
            value: draft.active,
            onClick: () => onChange({ active: !draft.active }),
          },
        }]}
      />

      <GSFormSection
        type="vertical xx-large-gap"
        fields={[
          {
            label: 'Question',
            required: true,
            isEditable: true,
            customView: true,
            value: (
              <GSinput
                placeholder="e.g. What is your shirt size?"
                textValue={draft.question}
                onChange={e => onChange({ question: e.target.value })}
                onSubmit={onSubmit}
              />
            ),
          },
        ]}
      />

      <GSFormSection
        title="Response Details"
        type="vertical xx-large-gap"
        fields={[
          {
            label: 'Response Type',
            required: true,
            isEditable: true,
            customView: true,
            value: (
              <GSSelect
                options={RESPONSE_TYPE_OPTIONS}
                selectedOption={draft.responseType}
                onChange={option => onChange({ responseType: option })}
                placeholder="Select a Response Type..."
                isSearchable={false}
                menuPortalTarget={document.body}
                menuPosition="fixed"
              />
            ),
          },
          {
            label: 'Response Placeholder',
            isEditable: true,
            customView: true,
            value: (
              <GSinput
                placeholder="Response Placeholder"
                textValue={draft.placeholder}
                onChange={e => onChange({ placeholder: e.target.value })}
              />
            ),
          },
          {
            label: 'Response Required',
            isEditable: true,
            customView: true,
            value: (
              <GSToggle
                value={draft.required}
                onClick={() => onChange({ required: !draft.required })}
                trueDescription="Yes"
                falseDescription="No"
              />
            ),
          },
        ]}
      />

      {isDropdown && (
        <GSFormSection
          title="Dropdown Responses"
          type="vertical xx-large-gap"
          sectionActions={[{ buttonTitle: 'Add Option', buttonIcon: faPlus, type: 'black', actionClick: addOption, isDisabled: anyOptionEditing }]}
          fields={[
            {
              label: 'Dropdown Options',
              required: true,
              isEditable: true,
              customView: true,
              value: (
                <div
                  className={`aqf-options-box${draggingOptionId != null ? ' aqf-options-box--reordering' : ''}`}
                  ref={optionsBoxRef}
                >
                  {draft.dropdownOptions.length === 0 ? (
                    <div className="aqf-options-empty">
                      <GSEmptyList
                        title="Dropdown Options"
                        detail="This dropdown does not have any options."
                        actions={[{ title: 'Add Option', buttonIcon: faPlus, type: 'black', isFocusable: true, onClick: addOption }]}
                      />
                    </div>
                  ) : (
                    displayOptions.map((option, index) => (
                      <DropdownOptionRow
                        key={option.id}
                        id={option.id}
                        value={option.value}
                        placeholder={`Option ${index + 1}`}
                        showGrabber={displayOptions.length > 1}
                        isDragging={option.id === draggingOptionId}
                        offsetY={option.id === draggingOptionId ? dragOffsetY : (flashOffsets[option.id] ?? 0)}
                        onGrabberPointerDown={e => handleGrabberPointerDown(e, option.id)}
                        onRowRef={el => setOptionRowRef(option.id, el)}
                        onSave={value => updateOption(option.id, value)}
                        onRemove={() => removeOption(option.id)}
                        onEditingChange={setOptionEditing}
                      />
                    ))
                  )}
                </div>
              ),
            },
          ]}
        />
      )}
    </div>
  )
}
