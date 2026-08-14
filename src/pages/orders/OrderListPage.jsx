import { useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faBars, faFolderOpen, faHandHoldingDollar, faMagnifyingGlass, faXmark } from '@fortawesome/free-solid-svg-icons'

import GSActionBar from '../../gs-lib/components/gs-action-bar'
import GSinput from '../../gs-lib/components/gs-input'
import AppSidePanel from '../../components/AppSidePanel.jsx'
import OrderFundsCard from '../../components/orders/OrderFundsCard.jsx'
import OrderListItem from '../../components/orders/OrderListItem.jsx'
import OrderFilterPanel from '../../components/orders/OrderFilterPanel.jsx'
import OrderDetailPanel, { orderActionsFor } from '../../components/orders/OrderDetailPanel.jsx'
import { availableFunds, orderStats, orders as initialOrders } from '../../data/mockOrders.js'
import './OrderListPage.scss'

const EMPTY_FILTERS = { status: null, activatedOn: '', deactivatedOn: '' }

export default function OrderListPage() {
  const navigate = useNavigate()
  const { id } = useParams()
  const [orderList, setOrderList] = useState(initialOrders)
  const [search, setSearch] = useState('')
  const [filters, setFilters] = useState(EMPTY_FILTERS)
  const [filterOpen, setFilterOpen] = useState(false)

  const selectedOrder = orderList.find(o => o.id === id) ?? null

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
    navigate('/orders')
  }

  function setOrderStatus(orderId, status) {
    setOrderList(prev => prev.map(o => (o.id === orderId ? { ...o, status } : o)))
    closeDetailPanel()
  }

  return (
    <div className="ord-page-bg">
      <GSActionBar
        type="x-large-pad H3"
        header="Orders & Payouts"
        pageActions={[
          { buttonTitle: 'Payouts', actionIcon: faHandHoldingDollar, type: 'black', actionClick: () => {} },
          { buttonTitle: 'Documents', actionIcon: faFolderOpen, type: 'light-grey', actionClick: () => {} },
        ]}
      />

      <div className="ord-page-list">
        <div className="ord-col-scroll">
          <div className="ord-funds-wrap">
            <OrderFundsCard funds={availableFunds} stats={orderStats} />
          </div>

          <div className="ord-list-sticky">
            <div className="ord-search-row">
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
                className={`ord-filter-toggle${activeFilterCount ? ' has-filters' : ''}`}
                onClick={() => setFilterOpen(true)}
                aria-label="Filter orders"
              >
                <FontAwesomeIcon icon={faBars} />
                {activeFilterCount > 0 && <span className="ord-filter-badge">{activeFilterCount}</span>}
              </button>
            </div>
          </div>

          <div className="ord-list-body">
            {filteredOrders.length === 0 ? (
              <div className="ord-empty">No orders match your search.</div>
            ) : (
              filteredOrders.map(order => (
                <OrderListItem key={order.id} order={order} onClick={() => navigate(`/orders/${order.id}`)} />
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
        title="Order Details"
        actions={selectedOrder ? orderActionsFor(selectedOrder, {
          onMarkPaid: () => setOrderStatus(selectedOrder.id, 'paid'),
          onVoid: () => setOrderStatus(selectedOrder.id, 'void'),
          onRefund: () => setOrderStatus(selectedOrder.id, 'refunded'),
        }) : []}
      >
        {selectedOrder && <OrderDetailPanel order={selectedOrder} />}
      </AppSidePanel>
    </div>
  )
}
