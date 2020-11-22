import React, { Component } from "react";
import "./App.css";
import Budgets from "./components/budgets";

class App extends Component {
  render() {
    return (
      <div className="App">
        <Budgets />
      </div>
    );
  }
}

export default App;
