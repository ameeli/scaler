// const express = require("express");

const fetch = require("node-fetch");

// const app = express();

const metricsBaseUrl = "https://interview-api.sbly.com/ad-insights?";
const budgetsBaseIrl = "https://interview-api.sbly.com/ad/";
const accessToken = "?accessToken=SHAREABLY_SECRET_TOKEN";

let dates = [
  "2020-01-01",
  "2020-01-02",
  "2020-01-03",
  "2020-01-04",
  "2020-01-05",
];

function createParams() {
  let params = [];
  for (date in dates) {
    let usp = new URLSearchParams(
      "metrics=spend,revenue,impressions,clicks&accessToken=SHAREABLY_SECRET_TOKEN"
    );
    usp.set("date", dates[date]);
    params.push(usp);
  }
  return params;
}

async function fetchAdMetrics(url) {
  try {
    const res = await fetch(url);
    const data = await res.json();
    return data;
  } catch (err) {
    console.log(err);
  }
}

const params = createParams();
async function buildInsights() {
  let adInsights = {};
  for (i in params) {
    const date = params[i].get("date").slice([-1]);
    const url = metricsBaseUrl.concat(params[i].toString());

    try {
      const insights = await fetchAdMetrics(url);

      for (i in insights) {
        if (!(insights[i].id in adInsights)) {
          adInsights[insights[i].id] = {};
        }

        adInsights[insights[i].id][date] = insights[i];
      }
    } catch (err) {
      console.log(err);
    }
  }
  return adInsights;
}

async function computeNewBudget() {
  let adInsights = await buildInsights();

  for (ad in adInsights) {
    // Calculate margin and weight
    const dates = Object.keys(adInsights[ad]).map(Number);
    const mostRecentPerfDate = Math.max(...dates);

    let profitMargins = [];
    let weights = [];

    for (const [date, value] of Object.entries(adInsights[ad])) {
      const profitMargin = (value.revenue - value.spend) / value.spend;
      const weight =
        Math.pow(0.5, mostRecentPerfDate - Number(date)) * value.spend;

      profitMargins.push(profitMargin);
      weights.push(weight);
    }

    // Calculate budget
    totalWeight = weights.reduce((a, b) => a + b, 0);
    weightedMargins = [];
    for (i = 0; i < weights.length; i++) {
      weightedMargin = profitMargins[i] * (weights[i] / totalWeight);
      weightedMargins.push(weightedMargin);
    }

    const currBudget = await fetchCurrBudget(ad);
    const weightedAverageProfitMargin = weightedMargins.reduce(
      (a, b) => a + b,
      0
    );
    const mostRecentProfitMargin = profitMargins.slice([-1]);
    let nextBudget =
      Math.round((1 + weightedAverageProfitMargin) * currBudget * 100) / 100;

    if (mostRecentProfitMargin > 0) {
      nextBudget = Math.max(currBudget, nextBudget);
    }

    adInsights[ad]["recommenedBudget"] = nextBudget;
    adInsights[ad]["currentBudget"] = currBudget;
  }
  return adInsights;
}

computeNewBudget().then((insights) => console.log(insights));

async function fetchCurrBudget(ad_id) {
  url = budgetsBaseIrl.concat(ad_id, accessToken);
  const budget = await fetchAdMetrics(url);
  return budget.budget;
}

// addCurrBudget().then((insights) => console.log(insights));

//   "ad_id": {
//     "weighted_average_profit_margin": "int",
//     "curr_budget": "int",
//     "next_budget": "int",
//     "most_recent_perf": "int representing date";
//     "most_recent_profit_margin": "int";
//     "weights_total": "int",
//     "date1": {
//       "spend": "",
//       "rev": "",
//       "impressions": "",
//       "clicks": "",
//       "profit_margin": "calculate int, (rev - spend) / spend"
//     }
//   }
// }
