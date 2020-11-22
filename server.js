// const express = require("express");

const fetch = require("node-fetch");

// const app = express();

const base_url = "https://interview-api.sbly.com/ad-insights?";

let usp = new URLSearchParams(
  "metrics=spend,revenue,impressions,clicks&accessToken=SHAREABLY_SECRET_TOKEN"
);

let dates = [
  "2020-01-01",
  "2020-01-02",
  "2020-01-03",
  "2020-01-04",
  "2020-01-05",
];

function createUrls() {
  let urls = [];
  for (date in dates) {
    usp.set("date", dates[date]);
    url = base_url.concat(usp.toString());
    urls.push(url);
  }
  return urls;
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

const urls = createUrls();

async function buildInsights() {
  insights = [];
  for (url in urls) {
    try {
      const insight = await fetchAdMetrics(urls[url]);
      // processInsight(insight)
      insights.push(insight);
    } catch (err) {
      console.log(err);
    }
  }
  return insights;
}

buildInsights().then((insights) => console.log(insights));
