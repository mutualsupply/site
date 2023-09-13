import { Endpoints } from "@octokit/types"

export type GithubPullResponse =
  Endpoints["GET /repos/{owner}/{repo}/pulls"]["response"]["data"]

export async function getPulls(): Promise<GithubPullResponse> {
  const res = await fetch("/api/pulls")
  if (!res.ok) {
    throw new Error("Failed to fetch pulls")
  }
  return res.json()
}

export async function getDrafts(): Promise<GithubPullResponse> {
  const res = await fetch("/api/draft", {
    method: "GET",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
    },
  })
  if (!res.ok) {
    throw new Error("Failed to fetch pulls")
  }
  return res.json()
}

export const GITHUB_OWNER = "mutualsupply"
export const GITHUB_REPO = "library"
