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

async function fetchCurrBudget(ad_id) {
  url = budgetsBaseIrl.concat(ad_id, accessToken);
  try {
    const budget = await fetchAdMetrics(url);
  } catch (err) {
    console.log(err);
  }
  return budget.budget;
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

  const weightedAverageProfitMargin = weightedMargins.reduce(
    (a, b) => a + b,
    0
  );

  const nextBudget =
    Math.round((1 + weightedAverageProfitMargin) * currBudget * 100) / 100;

  return nextBudget;
}

async function addNewBudget() {
  let adInsights = await buildInsights();

  for (ad in adInsights) {
    [profitMargins, weights] = caculateMarginWeight(ad, adInsights[ad]);

    const mostRecentProfitMargin = profitMargins.slice([-1]);
    const currBudget = await fetchCurrBudget(ad);
    let nextBudget = caculateNewBudget(profitMargins, weights, currBudget);

    if (mostRecentProfitMargin > 0) {
      nextBudget = Math.max(currBudget, nextBudget);
    }

    adInsights[ad]["recommenedBudget"] = nextBudget;
    adInsights[ad]["currentBudget"] = currBudget;
  }
  return adInsights;
}

addNewBudget().then((insights) => console.log(insights));
