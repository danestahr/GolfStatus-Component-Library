import React, { Component } from "react";
import "./gs-item-list.scss";

import {
  faBars,
  faCheck,
  faChevronDown,
  faChevronLeft,
  faChevronRight,
  faChevronUp,
  faGripLines,
  faMinus
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import GSButton from "./gs-button";
import GSLoadingSpinnerOverlay from "./gs-loading-spinner-overlay";
import { width } from "@fortawesome/free-solid-svg-icons/fa0";

/**
 * View to display items in a list. This also allows for those items to be sorted, turned into checkboxes and displayed in vertical, horizontal, or grid layouts
 *
 * @typedef Properties
 * @type {object}
 *
 * @property {string} type the type of list this is [horizontal, vertical, mobile-vertical, inline-grid]
 *
 * @property {JSX.Element} emptyMessage empty message definition for the list
 *
 * @property {string} gridColumns grid column definition for the list
 *
 * @property {Array} dropList list that can be switched to while dragging
 *
 * @property {Array} items items in the list
 *
 * @property {object} style style for the list
 *
 * @property {Array} selectedItems array of selected items for the list
 *
 * @property {function} itemChecked function for when item is checked
 *
 * @property {function} itemSelected function for when the entire item is clicked on
 *
 * @property {function} itemUnchecked function for when item is unchecked
 *
 * @property {function} unCheckAll uncheck all items function
 *
 * @property {function} checkAll check all items function
 *
 * @property {function} itemMoved in sort mode when an item has been dropped
 *
 * @property {function} itemMoving in sort mode when an item is moving
 *
 * @property {boolean} isChecklist boolean to tell whether or not this is a checklist
 *
 * @property {string} bottomScrollMargin bottom scroll margin for vertical lists
 *
 * @property {string} topScrollMargin top scroll margin for vertical lists
 *
 * @property {Array} indexItems items to inject at the given indices [{index: 0, view: {}}]
 *
 * @property {number} columns number of columns for a grid list
 *
 * @property {boolean} loading list is loading
 *
 * @property {number} loadingMainText main text of loading spinner
 *
 * @property {number} loadingSubText subtext of loading spinner
 *
 * @param {Properties} props type, emptyMessage, gridColumns, dropList, items, style, selectedItems, itemChecked, itemSelected,
 * itemUnchecked, unCheckAll, checkAll, isChecklist, bottomScrollMargin, topScrollMargin, indexItems, columns,loading, loadingMainText, loadingSubText, itemMoved, itemMoving
 */

export default class GSItemList extends Component {
  constructor(props) {
    super(props);
    this.listElement = React.createRef();
    this.state = {
      sortingItem: undefined,
      sortingIndex: -1,
      sorting: false,
      showPlaceHolder: false,
      dragOffset: props.dragOffset ?? 0,
      boundingRect: { top: 0 },
      autoScroller: {}
    };
  }

  componentDidMount() {
    this.setState({
      boundingRect: this.listElement?.current?.getBoundingClientRect?.()
    });
  }

  //checkbox functionality
  isSelected = item => {
    let found = false;
    if (this.props.selectedItems) {
      found = this.props.selectedItems.find(i => i.id === item.id);
    }
    return found;
  };

  itemClicked = item => {
    if (!this.isSelected(item)) {
      if (this.props.itemChecked) {
        this.props.itemChecked(item);
      }
    } else {
      if (this.props.itemUnchecked) {
        this.props.itemUnchecked(item);
      }
    }
  };

  checkAll = () => {
    if (this.hasSelection()) {
      if (this.props.unCheckAll) {
        this.props.unCheckAll();
      }
    } else {
      if (this.props.checkAll) {
        this.props.checkAll();
      }
    }
  };

  hasSelection = () => {
    if (this.props.selectedItems) {
      return this.props.selectedItems.length > 0;
    }
  };

  allSelected = () => {
    if (this.props.selectedItems) {
      return this.props.selectedItems.length === this.props.items.length;
    }
  };

  showCheckAll = () => {
    return (
      this.props.isCheckList && this.props.checkAll && this.props.unCheckAll
    );
  };
  //

  //sorting functionality
  showPlaceHolder = index => {
    return index === this.state.sortingIndex && this.state.showPlaceHolder;
  };

  sortItem = (e, item, index) => {
    let x = e.clientX ?? e.touches?.[0]?.clientX;
    let y = e.clientY ?? e.touches?.[0]?.clientY;
    if (x !== undefined && y !== undefined) {
      const cursorArea = document.elementsFromPoint(x, y);
      let scrollableElement = cursorArea.find(e => {
        const style = window?.getComputedStyle?.(e);
        const overflows = `${style.overflow}${style.overflowX}${style.overflowY}`;
        return overflows?.includes?.("auto") || overflows?.includes?.("scroll");
      });
      this.setState(
        {
          sortingItem: item,
          sorting: true,
          sortingIndex: index,
          autoScroller: scrollableElement
        },
        () => {
          this.moveItem(e);
        }
      );
    } else {
      this.setState(
        { sortingItem: item, sorting: true, sortingIndex: index },
        () => {
          this.moveItem(e);
        }
      );
    }

    e?.stopPropagation?.();
    e.preventDefault?.();
  };

  itemMoved = (sourceItem, sourceIndex, destItem, destIndex, listID) => {
    this.props?.itemMoved?.(
      sourceItem,
      sourceIndex,
      destItem,
      destIndex,
      listID
    );
  };

  touchMove = e => {
    this.moveItem(e.touches?.[0]);
    if (this.state.sorting) {
      e?.preventDefault?.();
    }
  };

  moveItem = e => {
    if (this.state.sorting) {
      const clientHeight = this.state.autoScroller?.clientHeight;
      const sortElement = document.getElementById("sortee");
      const br = this.listElement?.current?.getBoundingClientRect?.();
      const scrollerBr = this.state?.autoScroller?.getBoundingClientRect?.();
      const sortableLayout = this.listElement.current.querySelector(
        ".sortable-layout"
      );
      const style = window.getComputedStyle(sortableLayout);

      if (sortElement && this.props.type.includes("vertical")) {
        const itemOffset = (sortElement?.clientHeight ?? 0) / 2;
        const cursor = e?.clientY - itemOffset + this.state.dragOffset;
        sortElement.style.top = `${cursor}px`;
        sortElement.style.position = "fixed";
        sortElement.style.transition = "none";
        //sortElement.style.left = `${sortableLayout?.getBoundingClientRect?.()?.x}px`;
        sortElement.style.width = `${sortableLayout?.clientWidth}px`;
        if (
          scrollerBr?.bottom - e.clientY <
          (this.props.bottomScrollMargin ?? 0)
        ) {
          this.state.autoScroller.scrollBy?.(0, 10);
        }
        if (e.clientY - scrollerBr?.top < (this.props.topScrollMargin ?? 0)) {
          this.state.autoScroller.scrollBy?.(0, -10);
        }
      } else if (sortElement && this.props.type.includes("horizontal")) {
        const cursor = e?.clientX - br?.left + this.state.dragOffset;
        sortElement.style.left = `${cursor}px`;
        sortElement.style.position = "absolute";
      }
      if (e.clientX && e.clientY) {
        const dropArea = document?.elementsFromPoint?.(e.clientX, e.clientY);
        const listElement = dropArea?.find?.(
          el => el?.className === "gs-item-list-with-id"
        );
        const listID = listElement?.getAttribute?.("data-list-id");
        this.props?.itemMoving?.(this.state.sortingItem, listID);
      }
    }
  };

  dropTouch = e => {
    if (this.sorting) {
      e?.preventDefault?.();
    }
    this.dropItem(e.changedTouches?.[0], true);
  };

  dropItem = (e, touched) => {
    if (this.state.sorting) {
      const sortElement = document.getElementById("sortee");
      const dropArea = document.elementsFromPoint(e.clientX, e.clientY);

      const listItem = dropArea?.find?.(el =>
        el?.className?.includes?.("sortable-item")
      );
      const itemContainer = dropArea?.find?.(
        el => el?.className?.includes?.("sortable-item") && el?.id !== "sortee"
      );
      const grabber = dropArea?.findLast?.(
        el => el.className === "sort-grabber"
      );
      const listElement = dropArea?.find?.(
        el => el?.className === "gs-item-list-with-id"
      );
      const listID = listElement?.getAttribute?.("data-list-id");

      const id = parseInt(grabber?.id ?? itemContainer?.id);
      if (sortElement) {
        sortElement.style.position = "unset";
      }
      let destItem = this.props.items?.[id];
      if (this.props.dropList && this.props.dropList?.length > id) {
        destItem = this.props.dropList?.[id];
      }
      this.itemMoved(
        this.state.sortingItem,
        this.state.sortingIndex,
        destItem,
        id,
        listID
      );
      if (
        grabber ||
        listItem?.id !== "sortee" ||
        touched ||
        listItem.onClick === undefined
      ) {
        this.setState({
          sortingItem: undefined,
          sorting: false,
          sortingIndex: -1,
          showPlaceHolder: false
        });
      }
    }
  };

  mouseLeave = () => {
    this.setState({
      sortingItem: undefined,
      sorting: false,
      sortingIndex: -1,
      showPlaceHolder: false
    });
  };

  //
  //standard funcitonality
  itemSelected = (e, item) => {
    if (this.props.itemSelected) {
      if (!this.state.sorting) {
        this.props.itemSelected(item);
      } else {
        this.setState({
          sortingItem: {},
          sorting: false,
          sortingIndex: -1,
          showPlaceHolder: false
        });
      }
      e?.stopPropagation?.();
    }
  };

  keyPressed = (e, item, index) => {
    if (this.props.type.includes("selectable")) {
      const key = e.key;
      if (key === "Enter") {
        this.itemSelected(e, item);
      }
    }
  };

  checkKeyPressed = (e, item, index) => {
    if (this.props.type.includes("check-key-handle")) {
      const key = e.key;
      if (key === "Enter") {
        this.itemClicked(item);
      }
    }
  };

  keyDown = (e, item, index) => {
    const { isSortable, items, enableStep } = this.props;
    if (e.keyCode === 38 && isSortable && enableStep) {
      this.itemMoved(item, index, items?.[index - 1], index - 1);
    }
    if (e.keyCode === 40 && isSortable && enableStep) {
      this.itemMoved(item, index, items?.[index + 1], index + 1);
    }
  };

  isVerticalList = () => {
    return this.props.type.includes("vertical");
  };

  //Views

  getSortGrabber = (item, index) => {
    return (
      <div
        className="sort-grabber"
        id={index}
        onMouseDown={e => {
          this.sortItem(e, item, index);
          e?.stopPropagation?.();
        }}
        onTouchStart={e => {
          this.sortItem(e, item, index);
          e?.stopPropagation?.();
        }}
      >
        <GSButton
          buttonIcon={faGripLines}
          onClick={e => {
            e?.stopPropagation?.();
          }}
        ></GSButton>
      </div>
    );
  };

  getMovePlus = (items, item, index) => {
    return (
      <GSButton
        isDisabled={index === items.length - 1}
        buttonIcon={this.isVerticalList() ? faChevronDown : faChevronRight}
        onClick={e => {
          this.itemMoved(item, index, items?.[index + 1], index + 1);
          e?.stopPropagation?.();
        }}
      ></GSButton>
    );
  };

  getMoveMinus = (items, item, index) => {
    return (
      <GSButton
        isDisabled={index === 0}
        buttonIcon={this.isVerticalList() ? faChevronUp : faChevronLeft}
        onClick={e => {
          this.itemMoved(item, index, items?.[index - 1], index - 1);
          e?.stopPropagation?.();
        }}
      ></GSButton>
    );
  };

  getSortFunctions = (item, index) => {
    const { items, enableStep } = this.props;
    return (
      <div className="sort-functions">
        {enableStep && this.getMoveMinus(items, item, index)}
        {this.getSortGrabber(item, index)}
        {enableStep && this.getMovePlus(items, item, index)}
      </div>
    );
  };

  getIndexItem = index => {
    if (this.props.indexItems) {
      let item = this.props.indexItems.find(item => item.index === index);
      return item?.view;
    }
  };

  getListItem = (item, index) => {
    let style = {};

    if (this.props.columns) {
      style = { width: `calc(100% / ${this.props.columns})` };
    }

    if (item?.style) {
      style = { ...style, ...item.style };
    }

    const { type, isCheckList, listItem, isSortable } = this.props;

    return (
      <gs-list-item
        tabindex={type?.includes?.("selectable") ? 0 : -1}
        class={`${isSortable ? "sortable-item" : ""} item${index} ${item?.fit ??
          ""} ${isCheckList ? "check-list-item" : ""} `}
        id={`${index === -1 ? "sortee" : index}`}
        style={style}
        onClick={e => this.itemSelected(e, item)}
        onMouseUp={e => {
          this.dropItem(e, false);
        }}
        onTouchEnd={this.dropTouch}
        onKeyPress={e => {
          this.keyPressed(e, item, index);
        }}
        onKeyDown={e => {
          this.keyDown(e, item, index);
        }}
      >
        {isCheckList && (
          <div
            className={`checkbox ${
              this.isSelected(item) ? "checked" : "unchecked"
            }`}
            onKeyDown={e => {
              this.checkKeyPressed(e, item, index);
            }}
            tabIndex={this.props.type.includes("check-key-handle") ? 0 : -1}
            onClick={() => this.itemClicked(item)}
          >
            {this.isSelected(item) ? (
              <FontAwesomeIcon icon={faCheck}></FontAwesomeIcon>
            ) : (
              <div className="unselected"></div>
            )}
          </div>
        )}
        {isSortable ? (
          <div className="sortable-layout">
            {listItem(item, index)}
            {this.getSortFunctions(item, index)}
          </div>
        ) : (
          listItem(item, index)
        )}
      </gs-list-item>
    );
  };

  getItem = (item, index) => {
    const indexItem = this.getIndexItem(index);

    return (
      <React.Fragment key={index}>
        {this.props.dropList === undefined || !this.state.sorting
          ? indexItem
          : ""}
        {this.getListItem(item, index)}
      </React.Fragment>
    );
  };

  getCheckboxItem = () => {
    return (
      <div
        className={`checkbox ${this.hasSelection() ? "checked" : "unchecked"}`}
        onClick={() => this.checkAll()}
      >
        {this.hasSelection() ? (
          <FontAwesomeIcon
            icon={this.allSelected() ? faCheck : faMinus}
          ></FontAwesomeIcon>
        ) : (
          <div className="unselected"></div>
        )}
      </div>
    );
  };

  getEmptyMessage = () => {
    const {
      loading,
      loadingMainText,
      loadingSubText,
      emptyMessage
    } = this.props;
    return (
      <div className="empty">
        {loading ? (
          <GSLoadingSpinnerOverlay
            mainText={loadingMainText}
            subText={loadingSubText}
          />
        ) : (
          emptyMessage ?? ""
        )}
      </div>
    );
  };

  render() {
    const {
      type,
      emptyMessage,
      gridColumns,
      dropList,
      items,
      style,
      listStyle
    } = this.props;

    const listhasItems = items && items.length > 0;

    let gridStyle = {};
    if (gridColumns) {
      gridStyle = {
        gridTemplateColumns: `repeat(${gridColumns}, 1fr [col-start])`
      };
    }

    let currentList = items;

    if (dropList) {
      currentList = this.state.sorting ? dropList : items;
    }

    return (
      <gs-item-list
        ref={this.listElement}
        onMouseMove={this.moveItem}
        onTouchMove={this.touchMove}
        onMouseLeave={this.mouseLeave}
        style={{ ...style }}
        class={this.props.listID ? "gs-item-list-with-id" : ""}
        data-list-id={this.props?.listID}
      >
        <div className={type} style={{ ...gridStyle, ...listStyle }}>
          {this.showCheckAll() && this.getCheckboxItem()}
          {listhasItems
            ? currentList?.map?.((item, index) => this.getItem(item, index))
            : emptyMessage && this.getEmptyMessage()}
        </div>

        {this.state.sortingItem && (
          <div className={type} >
            {this.getItem(this.state.sortingItem, -1)}
          </div>
        )}
      </gs-item-list>
    );
  }
}
