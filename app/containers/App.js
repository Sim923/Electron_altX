// @flow
import * as React from 'react';

type Props = {
  children: React.Node
};

export default class App extends React.Component<Props> {
  // eslint-disable-next-line
  props: Props;

  render() {
    const { children } = this.props;
    return <>{children}</>;
  }
}
