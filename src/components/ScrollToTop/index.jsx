import { Component } from 'react';
import { node } from 'prop-types';
import { withRouter } from 'react-router-dom';

@withRouter
export default class ScrollToTop extends Component {
  static propTypes = {
    children: node,
  };

  componentDidUpdate(prevProps) {
    if (this.props.location.pathname !== prevProps.location.pathname) {
      window.scrollTo(0, 0);
    }
  }

  render() {
    return this.props.children;
  }
}
