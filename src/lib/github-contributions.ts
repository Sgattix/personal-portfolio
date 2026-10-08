const GITHUB_GRAPHQL_URL = "https://api.github.com/graphql";
const REVALIDATE_SECONDS = 60 * 60 * 6;

type CalendarResponse = {
  data?: {
    user: {
      contributionsCollection: {
        contributionYears?: number[];
        contributionCalendar?: {
          weeks: Array<{
            contributionDays: Array<{ date: string; contributionCount: number }>;
          }>;
        };
      };
    } | null;
  };
  errors?: Array<{ message: string }>;
};

async function queryGithub(
  token: string,
  query: string,
  variables: Record<string, unknown>,
): Promise<CalendarResponse | null> {
  const response = await fetch(GITHUB_GRAPHQL_URL, {
    method: "POST",
    headers: {
      Authorization: `bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ query, variables }),
    // The contributions page is force-dynamic; without this every visitor
    // would trigger a fresh GitHub API call.
    next: { revalidate: REVALIDATE_SECONDS, tags: ["github-contributions"] },
  });

  if (!response.ok) {
    console.error(`GitHub contributions request failed: ${response.status}`);
    return null;
  }

  const json = (await response.json()) as CalendarResponse;
  if (json.errors?.length) {
    console.error("GitHub contributions error:", json.errors[0].message);
    return null;
  }

  return json;
}

/**
 * Returns GitHub contribution counts keyed by `YYYY-MM-DD`, across every
 * contribution year. Returns an empty map when GITHUB_TOKEN/GITHUB_USERNAME
 * are not configured or the API fails, so the graph degrades to local data.
 */
export async function fetchGithubContributionDays(): Promise<
  Map<string, number>
> {
  const token = process.env.GITHUB_TOKEN;
  const login = process.env.GITHUB_USERNAME;
  const days = new Map<string, number>();

  if (!token || !login) {
    return days;
  }

  try {
    const yearsResult = await queryGithub(
      token,
      `query($login: String!) {
        user(login: $login) { contributionsCollection { contributionYears } }
      }`,
      { login },
    );
    const years =
      yearsResult?.data?.user?.contributionsCollection.contributionYears ?? [];

    // contributionCalendar spans at most one year per query.
    const calendars = await Promise.all(
      years.map((year) =>
        queryGithub(
          token,
          `query($login: String!, $from: DateTime!, $to: DateTime!) {
            user(login: $login) {
              contributionsCollection(from: $from, to: $to) {
                contributionCalendar {
                  weeks { contributionDays { date contributionCount } }
                }
              }
            }
          }`,
          {
            login,
            from: `${year}-01-01T00:00:00Z`,
            to: `${year}-12-31T23:59:59Z`,
          },
        ),
      ),
    );

    for (const calendar of calendars) {
      const weeks =
        calendar?.data?.user?.contributionsCollection.contributionCalendar
          ?.weeks ?? [];
      for (const week of weeks) {
        for (const day of week.contributionDays) {
          if (day.contributionCount > 0) {
            days.set(day.date, day.contributionCount);
          }
        }
      }
    }
  } catch (error) {
    console.error("Failed to load GitHub contributions:", error);
  }

  return days;
}
