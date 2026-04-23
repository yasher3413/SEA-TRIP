import { Octokit } from "@octokit/rest";

// GitHub Contents API wrapper — used by /admin to write JSON data files
// back to the repo so Vercel auto-redeploys with fresh data.
// Why GitHub commits instead of Vercel Blob: keeps all trip data version-
// controlled and auditable in the repo; every expense shows in git history.

function getOctokit() {
  return new Octokit({ auth: process.env.GITHUB_TOKEN });
}

function parseRepo() {
  const repo = process.env.GITHUB_REPO ?? "";
  const [owner, repoName] = repo.split("/");
  return { owner, repo: repoName };
}

export async function readDataFile(filename: string): Promise<string> {
  const octokit = getOctokit();
  const { owner, repo } = parseRepo();
  const { data } = await octokit.repos.getContent({
    owner,
    repo,
    path: `data/${filename}`,
    ref: process.env.GITHUB_BRANCH ?? "main",
  });
  if (!("content" in data)) throw new Error("Not a file");
  return Buffer.from(data.content, "base64").toString("utf-8");
}

export async function writeDataFile(
  filename: string,
  content: string,
  commitMessage: string
): Promise<void> {
  const octokit = getOctokit();
  const { owner, repo } = parseRepo();
  const branch = process.env.GITHUB_BRANCH ?? "main";

  // Get current SHA so GitHub allows the update
  let sha: string | undefined;
  try {
    const { data } = await octokit.repos.getContent({
      owner,
      repo,
      path: `data/${filename}`,
      ref: branch,
    });
    if ("sha" in data) sha = data.sha;
  } catch {
    // File doesn't exist yet — create it
  }

  await octokit.repos.createOrUpdateFileContents({
    owner,
    repo,
    path: `data/${filename}`,
    message: commitMessage,
    content: Buffer.from(content).toString("base64"),
    branch,
    ...(sha ? { sha } : {}),
  });
}
