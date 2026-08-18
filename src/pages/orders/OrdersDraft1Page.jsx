import { useMemo, useState } from 'react'
import { useNavigate, useParams, useLocation } from 'react-router-dom'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faBars, faFolderOpen, faHandHoldingDollar, faMagnifyingGlass, faXmark } from '@fortawesome/free-solid-svg-icons'

import GSActionBar from '../../gs-lib/components/gs-action-bar'
import GSinput from '../../gs-lib/components/gs-input'
import AppSidePanel from '../../components/AppSidePanel.jsx'
import OrderFundsCard from '../../components/orders/OrderFundsCard.jsx'
import OrderListItem from '../../components/orders/OrderListItem.jsx'
import OrderFilterPanel from '../../components/orders/OrderFilterPanel.jsx'
import { orderActionsFor } from '../../components/orders/OrderDetailPanel.jsx'
import OrderDetailPanelDraft1 from '../../components/orders/OrderDetailPanelDraft1.jsx'
import OrderResponsesListDraft1 from '../../components/orders/OrderResponsesListDraft1.jsx'
import OrderFormResponseEditFieldsDraft1 from '../../components/orders/OrderFormResponseEditFieldsDraft1.jsx'
import { availableFunds, orderStats, orders as initialOrders } from '../../data/mockOrders.js'
import './OrdersDraft1Page.scss'

const EMPTY_FILTERS = { status: null, activatedOn: '', deactivatedOn: '' }

// Draft 1 — a standalone copy of OrderListPage.jsx (own file + own scss with
// ord-d1- prefixed classes) so it can be riffed on without touching the
// original Orders & Payouts page or Draft 2.
export default function OrdersDraft1Page() {
  const navigate = useNavigate()
  const location = useLocation()
  const { id } = useParams()
  const [orderList, setOrderList] = useState(initialOrders)
  const [search, setSearch] = useState('')
  const [filters, setFilters] = useState(EMPTY_FILTERS)
  const [filterOpen, setFilterOpen] = useState(false)
  const [editingResponse, setEditingResponse] = useState(null)

  const selectedOrder = orderList.find(o => o.id === id) ?? null
  const viewingAllResponses = location.pathname.endsWith('/responses')

  const filteredOrders = useMemo(() => {
    const query = search.trim().toLowerCase()
    return orderList.filter(order => {
      if (query) {
        const matches =
          order.buyerName.toLowerCase().includes(query) ||
          order.email.toLowerCase().includes(query) ||
          order.phone.toLowerCase().includes(query)
        if (!matches) return false
      }
      if (filters.status && order.status !== filters.status) return false
      if (filters.activatedOn && order.date < filters.activatedOn) return false
      if (filters.deactivatedOn && order.date > filters.deactivatedOn) return false
      return true
    })
  }, [orderList, search, filters])

  const activeFilterCount = (filters.status ? 1 : 0) + (filters.activatedOn ? 1 : 0) + (filters.deactivatedOn ? 1 : 0)

  function closeDetailPanel() {
    setEditingResponse(null)
    navigate('/orders-draft-1')
  }

  function openAllResponses() {
    navigate(`/orders-draft-1/${id}/responses`)
  }

  function closeAllResponses() {
    navigate(`/orders-draft-1/${id}`)
  }

  function handlePanelBack() {
    if (editingResponse) {
      setEditingResponse(null)
    } else if (viewingAllResponses) {
      closeAllResponses()
    }
  }

  function setOrderStatus(orderId, status) {
    setOrderList(prev => prev.map(o => (o.id === orderId ? { ...o, status } : o)))
    closeDetailPanel()
  }

  function saveResponseAnswer(orderId, responseIndex, answerIndex, value) {
    setOrderList(prev =>
      prev.map(o =>
        o.id === orderId
          ? {
              ...o,
              formResponses: o.formResponses.map((entry, i) =>
                i === responseIndex
                  ? {
                      ...entry,
                      answers: entry.answers.map((a, j) =>
                        j === answerIndex ? { ...a, value, editedAt: new Date().toISOString() } : a
                      ),
                    }
                  : entry
              ),
            }
          : o
      )
    )
  }

  // `entries` is every question in the form occurrence being edited together
  // (see OrderFormResponses.jsx's single "Edit All" per form card) — each
  // becomes its own group here so they can all be saved as one unit.
  function startEditingResponse(orderId, entries) {
    setEditingResponse({
      orderId,
      groups: entries.map(({ entry, entryIndex }) => ({
        responseIndex: entryIndex,
        formName: entry.formName,
        question: entry.question,
        answers: entry.answers,
        originalAnswers: entry.answers,
      })),
    })
  }

  function updateEditingAnswer(groupIndex, answerIndex, value) {
    setEditingResponse(prev => ({
      ...prev,
      groups: prev.groups.map((group, gi) =>
        gi === groupIndex
          ? { ...group, answers: group.answers.map((a, ai) => (ai === answerIndex ? { ...a, value } : a)) }
          : group
      ),
    }))
  }

  function saveEditingResponse() {
    const { orderId, groups } = editingResponse
    setOrderList(prev =>
      prev.map(o => {
        if (o.id !== orderId) return o
        return {
          ...o,
          formResponses: o.formResponses.map((entry, i) => {
            const group = groups.find(g => g.responseIndex === i)
            if (!group) return entry
            const stampedAnswers = group.answers.map((answer, ai) =>
              answer.value !== group.originalAnswers[ai].value ? { ...answer, editedAt: new Date().toISOString() } : answer
            )
            return { ...entry, answers: stampedAnswers }
          }),
        }
      })
    )
    setEditingResponse(null)
  }

  return (
    <div className="ord-d1-page-bg">
      <GSActionBar
        type="x-large-pad H3"
        header="Orders & Payouts — Draft 1"
        pageActions={[
          { buttonTitle: 'Payouts', actionIcon: faHandHoldingDollar, type: 'black', actionClick: () => {} },
          { buttonTitle: 'Documents', actionIcon: faFolderOpen, type: 'light-grey', actionClick: () => {} },
        ]}
      />

      <div className="ord-d1-page-list">
        <div className="ord-d1-col-scroll">
          <div className="ord-d1-funds-wrap">
            <OrderFundsCard funds={availableFunds} stats={orderStats} />
          </div>

          <div className="ord-d1-list-sticky">
            <div className="ord-d1-search-row">
              <GSinput
                leftIcon={faMagnifyingGlass}
                rightIcon={search ? faXmark : null}
                rightIconClick={() => setSearch('')}
                placeholder="Search Orders..."
                textValue={search}
                onChange={e => setSearch(e.target.value)}
              />
              <button
                type="button"
                className={`ord-d1-filter-toggle${activeFilterCount ? ' has-filters' : ''}`}
                onClick={() => setFilterOpen(true)}
                aria-label="Filter orders"
              >
                <FontAwesomeIcon icon={faBars} />
                {activeFilterCount > 0 && <span className="ord-d1-filter-badge">{activeFilterCount}</span>}
              </button>
            </div>
          </div>

          <div className="ord-d1-list-body">
            {filteredOrders.length === 0 ? (
              <div className="ord-d1-empty">No orders match your search.</div>
            ) : (
              filteredOrders.map(order => (
                <OrderListItem
                  key={order.id}
                  order={order}
                  onClick={() => navigate(`/orders-draft-1/${order.id}`)}
                />
              ))
            )}
          </div>
        </div>
      </div>

      <OrderFilterPanel
        isOpen={filterOpen}
        onClose={() => setFilterOpen(false)}
        filters={filters}
        onApply={setFilters}
        onClear={() => setFilters(EMPTY_FILTERS)}
      />

      <AppSidePanel
        isOpen={!!selectedOrder}
        onClose={closeDetailPanel}
        onBack={editingResponse || viewingAllResponses ? handlePanelBack : undefined}
        title={
          editingResponse
            ? `Edit ${editingResponse.groups[0]?.formName ?? ''}`
            : viewingAllResponses
            ? 'All Responses'
            : 'Order Details'
        }
        actions={
          editingResponse
            ? [
                { name: 'Save', type: 'black', action: saveEditingResponse },
                { name: 'Cancel', type: 'light-grey', action: () => setEditingResponse(null) },
              ]
            : viewingAllResponses
            ? []
            : selectedOrder
            ? orderActionsFor(selectedOrder, {
                onMarkPaid: () => setOrderStatus(selectedOrder.id, 'paid'),
                onVoid: () => setOrderStatus(selectedOrder.id, 'void'),
                onRefund: () => setOrderStatus(selectedOrder.id, 'refunded'),
              })
            : []
        }
      >
        {editingResponse ? (
          <OrderFormResponseEditFieldsDraft1
            groups={editingResponse.groups}
            onChangeAnswer={updateEditingAnswer}
            onSubmit={saveEditingResponse}
          />
        ) : viewingAllResponses ? (
          selectedOrder && (
            <OrderResponsesListDraft1
              order={selectedOrder}
              onEditResponses={entries => startEditingResponse(selectedOrder.id, entries)}
              onSaveAnswer={(responseIndex, answerIndex, value) =>
                saveResponseAnswer(selectedOrder.id, responseIndex, answerIndex, value)
              }
            />
          )
        ) : (
          selectedOrder && (
            <OrderDetailPanelDraft1 order={selectedOrder} onViewAllResponses={openAllResponses} />
          )
        )}
      </AppSidePanel>
    </div>
  )
}
