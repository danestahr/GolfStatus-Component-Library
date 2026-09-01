import { useEffect, useRef, useState } from 'react'
import { faBarsStaggered, faFlag, faMagnifyingGlass, faPen, faTimesCircle, faUsers, faXmark } from '@fortawesome/free-solid-svg-icons'
import GSActionBar from '../../gs-lib/components/gs-action-bar'
import GSinput from '../../gs-lib/components/gs-input'
import GSField from '../../gs-lib/components/gs-field'
import GSButton from '../../gs-lib/components/gs-button'
import OrderResponsesFilterNav, { RESPONSE_CATEGORIES, CATEGORY_DESCRIPTIONS } from './OrderResponsesFilterNav.jsx'
import { QUESTION_OPTIONS, isAnswerMissing, isNumberQuestion, occurrenceLabelFor, entityNameFor } from './orderUtils'
import './OrderFormResponses.scss'
import './OrderResponsesListDraft1.scss'

// Label for the "| View ___" link next to a form section's response-type
// subtitle — a player rolls up under their team the same way a team-level
// question does, so it reads "View Team"; a solo player on a package with no
// team component at all (e.g. Individual Registration) has no team to roll
// up under, so it reads "View Player" instead — there's nothing to view for
// a plain "Order Response" (no fillLevel), so that's left out entirely.
function viewLinkLabelFor(fillLevel, hasTeam) {
  if (fillLevel === 'player') return hasTeam ? 'View Team' : 'View Player'
  if (fillLevel === 'team') return 'View Team'
  if (fillLevel === 'sponsor') return 'View Sponsor'
  return null
}

const SAVE_DELAY_MS = 1000
// Matches the confirmation flash duration used for an assigned slot in the
// Hole Assignments feature (see TournamentSchedulerPage.jsx's FLASH_MS).
const FLASH_MS = 3000

function saveButtonStyle(canSave) {
  return {
    background: '#232323',
    color: '#fff',
    opacity: canSave ? 1 : 0.4,
    cursor: canSave ? 'pointer' : 'not-allowed',
  }
}

// Two-level grouping: a package (form occurrence label) can carry more than
// one form fill-out, and each of those can carry more than one question —
// the rendering below adapts to however many of each actually show up.
function groupResponses(responses) {
  const packages = []
  responses.forEach(entry => {
    let pkg = packages.find(p => p.packageName === entry.packageName)
    if (!pkg) {
      pkg = { packageName: entry.packageName, forms: [] }
      packages.push(pkg)
    }
    let form = pkg.forms.find(f => f.formName === entry.formName)
    if (!form) {
      form = { formName: entry.formName, questions: [] }
      pkg.forms.push(form)
    }
    form.questions.push(entry)
  })
  return packages
}

function matchesQuery(entry, query) {
  if (!query) return true
  if (entry.question.toLowerCase().includes(query)) return true
  return entry.answers.some(
    a => a.respondent.toLowerCase().includes(query) || String(a.value).toLowerCase().includes(query)
  )
}

// 'all' shows every fillLevel — Team/Sponsor/Players narrow to their own
// occurrence type (see OrderResponsesFilterNav.jsx). A category can also be
// an array (e.g. ['team', 'player']) for a locked, multi-fillLevel scope —
// see `initialPackageName` below — that the filter nav itself never
// produces on its own.
function matchesCategory(entry, category) {
  if (!category || category === 'all') return true
  if (Array.isArray(category)) return category.includes(entry.fillLevel)
  return entry.fillLevel === category
}

// Which of a question's answer tiles to actually show for the current
// search and name filter — keeps every answer if the question itself
// matched the search (nothing to narrow down there), otherwise drops the
// respondents that don't match so only the relevant tiles show. Answers keep
// their original index (needed for editing/saving/flashing) even once the
// non-matching ones are filtered out.
function visibleAnswerEntries(entry, query, selectedName) {
  const indexed = entry.answers.map((answer, originalIndex) => ({ answer, originalIndex }))
  const forName = selectedName ? indexed.filter(({ answer }) => answer.respondent === selectedName) : indexed
  if (!query || entry.question.toLowerCase().includes(query)) return forName
  return forName.filter(
    ({ answer }) => answer.respondent.toLowerCase().includes(query) || String(answer.value).toLowerCase().includes(query)
  )
}

// Draft 1 riff — the "uncollapsed" package/form/question/answer view from
// OrderFormResponses.jsx, moved to its own searchable list page (reached via
// OrderFormResponsesSummaryDraft1's "View All") instead of an inline
// Hide/Show toggle. Search matches on question text, answer value, or
// respondent name; inline single-answer edit and per-form "Edit All" both
// still work exactly as they do in the order details view. Visually this
// page uses its own layout — a grey section per form occurrence, with each
// question inside it as its own white tile — rather than the nested-card
// style used in the order details view.
export default function OrderResponsesListDraft1({
  order,
  onEditResponses,
  onSaveAnswer,
  // The "| View Team"/"| View Sponsor" link next to a form section's
  // subtitle — only meaningful when this page itself doesn't already know
  // which team/sponsor/player it's scoped to (reached via a plain Order
  // Details, not a team's/sponsor's own "Form Responses" row or one of their
  // player tiles — see `locked` below); a caller passes `null` instead of a
  // real handler whenever it's already scoped, which this omits the link
  // for entirely rather than leaving it clickable to nowhere.
  onViewFormAcrossOrders = null,
  initialSelectedName = null,
  initialCategory = null,
  // Scopes the whole page down to one team's or sponsor's own package (see
  // the Team/Sponsor Overview "Form Responses" row in TeamsListPage.jsx/
  // SponsorsListPage.jsx/OrdersDraft1Page.jsx) — matched against each
  // response's own `packageName`, the same field that disambiguates a multi-
  // team or multi-sponsor order (see the ord-1005/ord-1006 comments in
  // mockTeams.js/mockOrders.js), so a bundled order only ever shows the one
  // entity's own forms.
  initialPackageName = null,
  // Permanently hides the filter switcher (see `showFilter` below) — passed
  // whenever a caller opened this page already scoped to one specific
  // entity/respondent (a team's or sponsor's own "Form Responses" row, a
  // Team Overview player tile, or an unassigned player's own card — see
  // `responsesOpenedDirectly` in TeamsListPage.jsx/SponsorsListPage.jsx),
  // since landing here already IS the filter — there's nothing left to
  // change away from. Kept independent of `initialPackageName` since an
  // unassigned player has no package of their own to lock to at all, but is
  // just as locked to their own one respondent. `onViewAllResponses`, when
  // given, adds a header action back to the unscoped, fully filterable view.
  locked = false,
  onViewAllResponses = null,
}) {
  const [search, setSearch] = useState('')
  // A caller that already knows the category (e.g. landing here from a
  // specific sponsor/team's own overview) passes it explicitly — only fall
  // back to inferring 'player' from a bare name when it doesn't, which is
  // the case for a player-only deep link (see viewTeamPlayerResponses in
  // OrdersDraft1Page.jsx).
  const [category, setCategory] = useState(initialCategory ?? (initialSelectedName ? 'player' : 'all'))
  const [selectedName, setSelectedName] = useState(initialSelectedName)
  const [filterNavOpen, setFilterNavOpen] = useState(false)
  const [editingAnswer, setEditingAnswer] = useState(null)
  const [isSaving, setIsSaving] = useState(false)
  const [flashedAnswers, setFlashedAnswers] = useState(new Set())
  const editingTileRef = useRef(null)

  function selectCategory(value) {
    setCategory(value)
    setSelectedName(null)
    // A category with only one respondent (or none) has nothing left to
    // narrow down, so it applies directly and the nav collapses — same as a
    // one-round wave jumping straight to its round in Hole Assignments.
    setFilterNavOpen((namesByCategory[value]?.length ?? 0) > 1)
  }

  function selectName(name) {
    setSelectedName(name)
    setFilterNavOpen(false)
  }

  useEffect(() => {
    if (!editingAnswer) return

    function handleClickOutside(e) {
      if (editingTileRef.current && !editingTileRef.current.contains(e.target)) {
        cancelAnswerEdit()
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  })

  const fullResponses = initialPackageName
    ? order.formResponses.filter(entry => entry.packageName === initialPackageName)
    : order.formResponses
  // Whether unlocking (onViewAllResponses) would actually surface anything
  // this locked scope (package + category) doesn't already show — an order
  // with only the one sponsor/team/player this page is scoped to has
  // nowhere left to go, so the button hides itself rather than linking to a
  // view identical to the one already on screen.
  const hasMoreResponsesElsewhere = order.formResponses.length > fullResponses.filter(entry => matchesCategory(entry, category)).length
  const query = search.trim().toLowerCase()
  const filteredResponses = fullResponses.filter(entry => matchesQuery(entry, query) && matchesCategory(entry, category))
  const packages = groupResponses(filteredResponses)

  // Whether each package has a team-level form at all — checked against
  // every response the order has, not the filtered/visible set, since a
  // name filter (e.g. picking one player) hides the other forms entirely
  // and would otherwise make a real team package look team-less.
  const packageHasTeam = new Set(fullResponses.filter(entry => entry.fillLevel === 'team').map(entry => entry.packageName))

  // A name filter can leave a form with no visible answers at all (e.g.
  // picking a player from one team hides the other team's Player Details
  // entirely) — drop those empty forms, and the whole package if every one
  // of its forms comes up empty.
  const visiblePackages = packages
    .map(pkg => ({
      packageName: pkg.packageName,
      forms: pkg.forms
        .map(form => ({
          form,
          entries: form.questions
            .map(entry => ({ entry, entryIndex: fullResponses.indexOf(entry) }))
            .filter(({ entry }) => visibleAnswerEntries(entry, query, selectedName).length > 0),
        }))
        .filter(({ entries }) => entries.length > 0),
    }))
    .filter(pkg => pkg.forms.length > 0)

  // Every respondent seen at each occurrence type, so the filter nav can
  // offer a second, "similar to players" pick whenever a Team or Sponsor
  // category actually has more than one to choose from (multiple teams or
  // multiple sponsors in the same order). The filter still keys off the
  // respondent's own name (that's who a Team/Sponsor answer's `answer`
  // actually belongs to), but nameLabelsByCategory maps that same name to
  // the team/sponsor's own name for anywhere it's displayed — see
  // entityNameFor in orderUtils.js.
  const namesByCategory = { team: [], sponsor: [], player: [] }
  const nameLabelsByCategory = { team: {}, sponsor: {}, player: {} }
  fullResponses.forEach(entry => {
    const names = namesByCategory[entry.fillLevel]
    if (!names) return
    entry.answers.forEach(a => {
      if (!names.includes(a.respondent)) names.push(a.respondent)
      nameLabelsByCategory[entry.fillLevel][a.respondent] = entityNameFor(order.id, entry.fillLevel, entry.packageName, a.respondent)
    })
  })

  // Every category stays selectable even when this order has no occurrences
  // of it at all (e.g. a Sponsor tab on an order with no sponsor forms) —
  // picking it just lands on the "No responses match this filter." empty
  // state below rather than hiding the tab outright. The filter switcher
  // itself stays up on the same terms — keyed only off `locked` — so editing
  // answers down to zero matches for whichever category is currently
  // selected doesn't yank the switcher (and the selection it's showing) out
  // from under the user; skipped entirely only when `locked` says this page
  // is already scoped to one specific entity/respondent.
  const availableCategories = RESPONSE_CATEGORIES
  const showFilter = !locked

  const filterDescription = selectedName
    ? `${nameLabelsByCategory[category]?.[selectedName] ?? selectedName} Responses`
    : CATEGORY_DESCRIPTIONS[category]

  function cancelAnswerEdit() {
    if (isSaving) return
    setEditingAnswer(null)
  }

  // Confirmation flash for an answer that was just saved — same treatment as
  // an assigned slot in Hole Assignments: holds the "just saved" cyan-800 for
  // a beat, then fades back to the resting cyan-700 (see .is-flash below).
  function flashAnswer(entryIndex, answerIndex) {
    const key = `${entryIndex}-${answerIndex}`
    setFlashedAnswers(prev => new Set(prev).add(key))
    window.setTimeout(() => {
      setFlashedAnswers(prev => {
        const next = new Set(prev)
        next.delete(key)
        return next
      })
    }, FLASH_MS)
  }

  function saveAnswerEdit() {
    const { entryIndex, answerIndex, draft } = editingAnswer
    setIsSaving(true)
    setTimeout(() => {
      onSaveAnswer(entryIndex, answerIndex, draft)
      setEditingAnswer(null)
      setIsSaving(false)
      if (draft) flashAnswer(entryIndex, answerIndex)
    }, SAVE_DELAY_MS)
  }

  // Selecting a dropdown option is already a complete, deliberate choice —
  // unlike free text there's no "still typing" state to wait out — so it
  // saves immediately instead of waiting on a separate confirm button.
  function selectAnswerOption(entryIndex, answerIndex, value) {
    setEditingAnswer(prev => ({ ...prev, draft: value }))
    setIsSaving(true)
    setTimeout(() => {
      onSaveAnswer(entryIndex, answerIndex, value)
      setEditingAnswer(null)
      setIsSaving(false)
      if (value) flashAnswer(entryIndex, answerIndex)
    }, SAVE_DELAY_MS)
  }

  function renderAnswers(entry, entryIndex) {
    return (
      <div className="ord-form-response-answers">
        {visibleAnswerEntries(entry, query, selectedName).map(({ answer, originalIndex: j }) => {
          const isEditing = editingAnswer?.entryIndex === entryIndex && editingAnswer?.answerIndex === j
          const canSave = isEditing && !isSaving && editingAnswer.draft !== editingAnswer.original
          const isFlashing = flashedAnswers.has(`${entryIndex}-${j}`)
          const isMissing = !isEditing && isAnswerMissing(answer)

          return (
            <div
              className={`ord-form-response-answer${isEditing ? ' is-editing' : ''}${isSaving && isEditing ? ' is-saving' : ''}${isFlashing ? ' is-flash' : ''}${isMissing ? ' ordr1-answer-missing' : ''}`}
              key={j}
              ref={isEditing ? editingTileRef : null}
            >
              <div className="ord-form-response-answer-name">
                {entityNameFor(order.id, entry.fillLevel, entry.packageName, answer.respondent)}
              </div>
              {isEditing && QUESTION_OPTIONS[entry.question] ? (
                <GSField
                  label={entry.question}
                  isEditable
                  type="select"
                  options={QUESTION_OPTIONS[entry.question]}
                  selectedOption={QUESTION_OPTIONS[entry.question].find(o => o.value === editingAnswer.draft) ?? null}
                  onChange={option => selectAnswerOption(entryIndex, j, option?.value ?? '')}
                  isSearchable={false}
                  isDisabled={isSaving}
                  menuPortalTarget={document.body}
                  menuPosition="fixed"
                  disabled={isSaving}
                />
              ) : isEditing ? (
                <GSField
                  label={entry.question}
                  isEditable
                  // A free-text answer can run long (a name, a note) — grows
                  // as a textarea instead of scrolling sideways in a single-
                  // line input, so the whole value stays visible.
                  type={isNumberQuestion(entry.question) ? 'number' : 'text-area'}
                  rows={isNumberQuestion(entry.question) ? undefined : 1}
                  value={editingAnswer.draft}
                  onChange={e => setEditingAnswer(prev => ({ ...prev, draft: e.target.value }))}
                  onSubmit={canSave ? saveAnswerEdit : undefined}
                  onKeyDown={e => {
                    if (e.key === 'Escape') return cancelAnswerEdit()
                    // The textarea swap loses the plain input's Enter-to-
                    // submit (native keyUp handling only wires up for a
                    // single-line <input> in gs-input.jsx) — Shift+Enter
                    // still inserts a newline for a genuinely multi-line
                    // answer.
                    if (!isNumberQuestion(entry.question) && e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault()
                      canSave && saveAnswerEdit()
                    }
                  }}
                  rightText="Save"
                  rightIconClick={canSave ? saveAnswerEdit : undefined}
                  buttonStyle={saveButtonStyle(canSave)}
                  disabled={isSaving}
                  autoFocus
                />
              ) : (
                <div className="ord-form-response-answer-row">
                  {isMissing ? (
                    <div className="ordr1-answer-placeholder">No Response</div>
                  ) : (
                    answer.value !== answer.respondent && (
                      <div className="ord-form-response-answer-value">{answer.value}</div>
                    )
                  )}
                </div>
              )}
              <div className="ordr1-answer-meta">
                {isEditing ? (
                  <GSButton buttonIcon={faTimesCircle} size="primary" isFocusable onClick={cancelAnswerEdit} />
                ) : (
                  <GSButton
                    type="white icon ord-form-response-answer-edit-btn"
                    size="primary"
                    buttonIcon={faPen}
                    isFocusable
                    onClick={() =>
                      !isSaving &&
                      setEditingAnswer({ entryIndex, answerIndex: j, draft: answer.value, original: answer.value })
                    }
                  />
                )}
              </div>
            </div>
          )
        })}
      </div>
    )
  }

  return (
    <div className="ordr1-list">
      <GSActionBar
        type="x-large-pad H3"
        header={
          showFilter ? (
            <>
              Form Responses
              <div className="ordr1-filter-switch">
                <span className="ordr1-filter-switch-name">{filterDescription}</span>
              </div>
            </>
          ) : (
            'Form Responses'
          )
        }
        pageActions={[
          ...(showFilter
            ? [
                {
                  buttonTitle: filterNavOpen ? null : 'Filter',
                  buttonIcon: filterNavOpen ? faTimesCircle : faBarsStaggered,
                  type: 'light-grey',
                  actionClick: () => setFilterNavOpen(v => !v),
                },
              ]
            : []),
          ...(onViewAllResponses && hasMoreResponsesElsewhere
            ? [{ buttonTitle: 'View All Responses', type: 'light-grey', actionClick: onViewAllResponses }]
            : []),
        ]}
      />

      {showFilter && (
        <OrderResponsesFilterNav
          isOpen={filterNavOpen}
          categories={availableCategories}
          category={category}
          onSelectCategory={selectCategory}
          namesByCategory={namesByCategory}
          nameLabelsByCategory={nameLabelsByCategory}
          selectedName={selectedName}
          onSelectName={selectName}
        />
      )}

      <div className="ordr1-list-search">
        <GSinput
          leftIcon={faMagnifyingGlass}
          rightIcon={search ? faXmark : null}
          rightIconClick={() => setSearch('')}
          placeholder="Search..."
          textValue={search}
          onChange={e => setSearch(e.target.value)}
        />
      </div>

      <div className="ordr1-list-body">
        {visiblePackages.length === 0 ? (
          <div className="ordr1-list-empty">{search ? `No results for "${search}"` : 'No responses match this filter.'}</div>
        ) : (
          <div className="ordr1-list-groups">
            {visiblePackages.map(pkg => {
              const hasTeam = packageHasTeam.has(pkg.packageName)
              return (
              <div className="ordr1-package" key={pkg.packageName}>
                <div className="ordr1-package-label">{pkg.packageName}</div>

                <div className="ordr1-forms">
                  {pkg.forms.map(({ form, entries }) => {
                    const viewLinkLabel = onViewFormAcrossOrders
                      ? viewLinkLabelFor(form.questions[0]?.fillLevel, hasTeam)
                      : null
                    return (
                    <div className="ordr1-form-section" key={form.formName}>
                      <div className="ordr1-form-section-header">
                        <div className="ordr1-form-section-text">
                          <div className="ordr1-form-section-title">{form.formName}</div>
                          <div className="ordr1-form-section-subtitle">
                            <span className="ordr1-form-section-subtitle-text">
                              {occurrenceLabelFor(form.questions[0]?.fillLevel, entries[0]?.entry.answers.length ?? 1)}
                            </span>
                          </div>
                        </div>
                        {viewLinkLabel && (
                          <div className="ordr1-form-section-actions">
                            <GSButton
                              type="light-grey"
                              size="secondary"
                              buttonIcon={viewLinkLabel === 'View Sponsor' ? faFlag : faUsers}
                              title={viewLinkLabel}
                              isFocusable
                              onClick={() => onViewFormAcrossOrders(form.formName, pkg.packageName)}
                            />
                          </div>
                        )}
                      </div>

                      <div className="ordr1-question-tiles">
                        {entries.map(({ entry, entryIndex }, i) => (
                          <div className="ordr1-question-tile" key={i}>
                            <div className="ordr1-question-title">{entry.question}</div>
                            {renderAnswers(entry, entryIndex)}
                          </div>
                        ))}
                      </div>
                    </div>
                    )
                  })}
                </div>
              </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
