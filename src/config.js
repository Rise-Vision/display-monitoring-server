/* eslint-disable no-magic-numbers */

const SECONDS = 1000;
const QUERY_TIMEOUT = 60 * SECONDS;

module.exports = {
  QUERY_TIMEOUT,
  QUERY_DATA: {
    kind: "bigquery#queryRequest",
    query: "SELECT * FROM [client-side-events:System_Metrics_Events.WeekAverages]",
    timeoutMs: QUERY_TIMEOUT,
    useQueryCache: true
  },
  QUERY_URL: "https://www.googleapis.com/bigquery/v2/projects/client-side-events/queries",
  REFRESH_URL: "https://www.googleapis.com/oauth2/v3/token?client_id=1088527147109-6q1o2vtihn34292pjt4ckhmhck0rk0o7.apps.googleusercontent.com&client_secret=nlZyrcPLg6oEwO9f9Wfn29Wh&refresh_token=1/xzt4kwzE1H7W9VnKB8cAaCx6zb4Es4nKEoqaYHdTD15IgOrJDtdun6zK6XiATCKT&grant_type=refresh_token"
}
