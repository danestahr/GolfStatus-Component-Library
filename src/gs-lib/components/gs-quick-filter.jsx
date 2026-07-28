import React from "react";
import "./gs-quick-filter.scss";

import { faTimesCircle } from "@fortawesome/free-solid-svg-icons";
import GSButton from "./gs-button";
import GSItemList from "./gs-item-list";

/**
 * A component that displays a list of options to select and a list of selected items
 *
 * @param {Properties} props filteredList,
    getItem,
    itemSelected,
    itemRemoved,
    getDefaultSearch,
    selectedItem,
    selectedList,
    multiple,
    emptySearchList,
    emptySelectedList,
    loading,
    loadingMainText,
    loadingSubtext,
    disabled,
    searchListType,
    selectListType
 */

const GSQuickFilter = props => {
  const {
    filteredList,
    getItem,
    itemSelected,
    itemRemoved,
    getDefaultSearch,
    selectedItem,
    selectedList,
    multiple,
    emptySearchList,
    emptySelectedList,
    loading,
    loadingMainText,
    loadingSubtext,
    disabled,
    searchListType,
    selectListType,
    style,
    itemStyle
  } = props;

  

  const Search = () => {
    if (disabled) {
      return <div className="none-selected">No item selected...</div>;
    }
    return getDefaultSearch?.();
  };

  const removeItem = item => {
    itemRemoved?.(item);
  };

  const itemIsSelected = () => {
    return !multiple && selectedItem;
  };

  const getForm = () => {
    return (
      <div className="filter-form">
        {multiple && getSelectedList()}
        {Search()}
        {getItemList()}
      </div>
    );
  };

  const getSelectedItem = item => {
    return (
      <div className="selected-item" style={itemStyle}>
        {getItem?.(item)}
        {!disabled ? (
          <GSButton
            buttonIcon={faTimesCircle}
            onClick={() => removeItem(item)}
          ></GSButton>
        ) : null}
      </div>
    );
  };

  const getUnselectedItem = (item) => {
    return (
      <div className="unselected-item hover-color-shift" style={itemStyle}>
        {getItem?.(item)}
      </div>
    );
  }

  const getSelectedList = () => {
    if(selectedList === undefined){
      return null
    }
    return (
      <GSItemList
        items={selectedList}
        listItem={item => getSelectedItem(item)}
        emptyMessage={emptySelectedList}
        type={`vertical small-gap ${selectListType}`}
      />
    );
  };

  const getItemList = () => {
    if (disabled) {
      return;
    }
    return (
      <GSItemList
        items={filteredList}
        listItem={item => getUnselectedItem?.(item)}
        itemSelected={item => itemSelected?.(item)}
        emptyMessage={emptySearchList}
        loading={loading}
        loadingMainText={loadingMainText}
        loadingSubtext={loadingSubtext}
        type={`vertical selectable ${searchListType}`}
      ></GSItemList>
    );
  };

  const getContent = () => {
    if (itemIsSelected()) {
      return getSelectedItem(selectedItem);
    } else {
      return getForm();
    }
  };

  return <gs-quick-filter style={style}>{getContent()}</gs-quick-filter>;
};

export default GSQuickFilter;
