import React from 'react';
import ReactDOM from 'react-dom';
import TextCardApp from './components/TextCardApp';

require('style!css!./components/TextCardApp/index.css')


class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
    };
  }
  render() {
    return (
      <div>
        <h1>Hello, World!</h1>
        <TextCardApp/>
      </div>
    );
  }
}

ReactDOM.render(<App />, document.body);
