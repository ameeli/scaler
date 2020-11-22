// const express = require("express");

const fetch = require("node-fetch");

// const app = express();

const base_url = "https://interview-api.sbly.com/ad-insights?";

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
  ad_insights = {};
  for (i in params) {
    const date = params[i].get("date").slice([-1]);
    const url = base_url.concat(params[i].toString());

    try {
      const insights = await fetchAdMetrics(url);

      for (i in insights) {
        if (!(insights[i].id in ad_insights)) {
          ad_insights[insights[i].id] = {};
        }

        ad_insights[insights[i].id][date] = insights[i];
      }
    } catch (err) {
      console.log(err);
    }
  }
  return ad_insights;
}

buildInsights().then((insights) => console.log(insights));

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
