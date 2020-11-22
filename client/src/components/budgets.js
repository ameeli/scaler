import React, { Component } from "react";
import "./budgets.css";

class Budgets extends Component {
  constructor() {
    super();
    this.state = {
      ads: [],
    };
  }

  componentDidMount() {
    fetch("/api/budgets")
      .then((res) => res.json())
      .then((ads) =>
        this.setState({ ads }, () => console.log("Budgets fetched...", ads))
      );
  }

  render() {
    return (
      <React.Fragment>
        <div>
          <h2>AD Performance</h2>
        </div>
        <table className="table table-bordered table-hover">
          <caption>Jan 01, 2020 to Jan 05, 2020</caption>
          <thead className="thead-dark">
            <tr>
              <th scope="col">AD ID</th>
              <th scope="col">Current Budget</th>
              <th scope="col">Proposed Budget</th>
              <th scope="col">Weighted Average Profit Margin</th>
            </tr>
          </thead>
          {this.state.ads.map((ad) => (
            <tbody key={ad.id}>
              <tr>
                <th scope="row">{ad.id}</th>
                <td>{ad.currentBudget}</td>
                <td>{ad.proposedBudget}</td>
                <td>{ad.weightedAverageProfitMargin}</td>
              </tr>
            </tbody>
          ))}
        </table>
      </React.Fragment>
    );
  }
}

export default Budgets;
