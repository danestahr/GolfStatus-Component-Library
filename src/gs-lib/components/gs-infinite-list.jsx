import React, { Component } from "react";
import "./gs-infinite-list.scss";

/**
 * A component that tracks the scroller for infinite lists to fire a function when the scroller has hit the bottom of the container
 * 
 *
 * @param {Properties} props filter, loadMore
 */

export default class GSInfiniteList extends Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: false
    };
    this.scrollView = React.createRef();
    this.scrollContent = React.createRef();
  }
  componentDidMount() {
    this.viewScrolled = this.handleScroll.bind(this);
    if (this.scrollView?.current) {
      this.scrollView?.current?.addEventListener?.("scroll", this.viewScrolled);
    }
  }

  handleScroll() {
    const {filter, loadMore, scrollUpdated} = this.props
    scrollUpdated?.(this.scrollView?.current?.scrollTop, this.scrollView?.current?.scrollLeft)
    if (
      this.scrollView?.current?.scrollTop >=
      this.scrollContent?.current?.clientHeight - this.scrollView?.current?.clientHeight - 20
    ) {
      if (filter && loadMore !== undefined) {
        if (!this.state.loading) {
          if (filter.page && filter.page.number) {
            filter.page.number += 1;
          } else if (filter.page) {
            filter.page += 1;
          }
          const loader = loadMore?.(filter);
          this.setState({ loading: true });
          if (loader) {
            loader.then(() => this.setState({ loading: false }));
          } else {
            this.setState({ loading: false });
          }
        }
      }
    }
  }

  render() {
    return (
      <infinite-list id="scroller" ref={this.scrollView}>
        <div id="scroller-elements" ref={this.scrollContent}>{this.props.children}</div>
      </infinite-list>
    );
  }
}
