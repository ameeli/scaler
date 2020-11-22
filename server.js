const express = require("express");

const fetch = require("node-fetch");

const app = express();

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

app.get("/api/budgets", (req, res) => {
  recommenedBudget().then((insights) => {
    res.json(insights);
  });
});

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

async function fetchCurrBudget(adId) {
  url = budgetsBaseIrl.concat(adId, accessToken);
  try {
    const budget = await fetchAdMetrics(url);
    return budget.budget;
  } catch (err) {
    console.log(err);
  }
}

function caculateMarginWeight(adId, adInsight) {
  const dates = Object.keys(adInsight).map(Number);
  const mostRecentPerfDate = Math.max(...dates);

  let profitMargins = [];
  let weights = [];

  for (date in adInsight) {
    const profitMargin =
      (adInsight[date].revenue - adInsight[date].spend) / adInsight[date].spend;
    const weight =
      Math.pow(0.5, mostRecentPerfDate - Number(date)) * adInsight[date].spend;

    profitMargins.push(profitMargin);
    weights.push(weight);
  }
  return [profitMargins, weights];
}

function caculateNewBudget(profitMargins, weights, currBudget) {
  totalWeight = weights.reduce((a, b) => a + b, 0);
  weightedMargins = [];

  for (i = 0; i < weights.length; i++) {
    weightedMargin = profitMargins[i] * (weights[i] / totalWeight);
    weightedMargins.push(weightedMargin);
  }

  const weightedAverageProfitMargin =
    Math.round(weightedMargins.reduce((a, b) => a + b, 0) * 100) / 100;

  const nextBudget =
    Math.round((1 + weightedAverageProfitMargin) * currBudget * 100) / 100;

  return [weightedAverageProfitMargin, nextBudget];
}

const formatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  minimumFractionDigits: 2,
});

async function recommenedBudget() {
  let adInsights = await buildInsights();
  let adInsightsBudgets = [];

  for (ad in adInsights) {
    [profitMargins, weights] = caculateMarginWeight(ad, adInsights[ad]);

    const mostRecentProfitMargin = profitMargins.slice([-1]);
    const currBudget = await fetchCurrBudget(ad);
    let [weightedAverageProfitMargin, proposedBudget] = caculateNewBudget(
      profitMargins,
      weights,
      currBudget
    );

    if (mostRecentProfitMargin > 0) {
      proposedBudget = Math.max(currBudget, proposedBudget);
    }

    adInsightBudget = {
      id: ad,
      weightedAverageProfitMargin: weightedAverageProfitMargin,
      currentBudget: formatter.format(currBudget),
      proposedBudget: formatter.format(proposedBudget),
    };
    adInsightsBudgets.push(adInsightBudget);
  }
  return adInsightsBudgets;
}

const port = 5000;

app.listen(port, () => `Server running on port ${port}`);
