---
name: recent-activity
description: Summarize recent GitHub activity across all repos (merged PRs, commits). Use when the user wants to review what they've shipped lately or draft a blog post about recent work.
disable-model-invocation: true
allowed-tools:
  - Bash(gh search prs *)
  - Bash(gh pr view *)
  - Bash(gh repo list *)
---

# Recent Activity Summary

Fetch and summarize recent merged PRs across all of the user's repos.

## Arguments

`$ARGUMENTS` can be:

- Empty: last 7 days
- A number: last N days (e.g. `14`)
- A date: since that date (e.g. `2026-03-01`)

## Workflow

### 1. Determine Time Window

Parse `$ARGUMENTS` to set a since date. Default to 7 days ago if empty.

### 2. Fetch Merged PRs

Use `gh search prs` to find merged PRs authored by the user across all repos:

```bash
gh search prs --author @me --merged --sort updated --limit 50 \
  --merged-at ">=SINCE_DATE" \
  --json title,url,closedAt,repository,body,number
```

Replace `SINCE_DATE` with the ISO date (e.g. `2026-03-05`).

Note: `gh search prs` doesn't support `--state merged` (use `--merged` flag)
and doesn't expose a `mergedAt` JSON field (use `closedAt` instead, which
equals merge time for merged PRs). The `--merged-at` flag handles date
filtering server-side so no `jq` post-filter is needed.

If no results, tell the user and stop.

### 3. Fetch PR Bodies for Context

For any PRs where the body is empty or very short (under 50 chars), fetch the
full PR description to get better context:

```bash
gh pr view NUMBER --repo OWNER/REPO --json title,body,commits
```

Limit to the 10 most recent PRs to avoid excessive API calls.

### 4. Group and Summarize

Group PRs by repository. For each repo, write a 1-3 sentence summary of what
changed — focus on the "what and why" not a commit-by-commit list.

Present the summary clearly:

```
## REPO_NAME (N PRs)
What changed and why it matters.

## REPO_NAME (N PRs)
...
```

Then write a short overall paragraph (3-5 sentences) synthesizing the themes
across all repos — what kind of work dominated, any cross-cutting concerns.

### 5. Offer Next Steps

Ask the user:

> Would you like to draft a blog post from this? Or just use this as a summary?

If they want a draft, hand off to the blog post drafting flow:

- Suggest a title and slug
- Draft the post in the user's voice (conversational, specific, honest about
  work-in-progress — see content voice guidelines in CLAUDE.md)
- Offer to save it to `content/posts/SLUG.md` as a draft (empty `publishedAt`)
- Remind them to run `/publish-post` when ready to go live

## Notes

- `gh` must be authenticated (`gh auth status`) — if not, tell the user to run
  `gh auth login` first
- Bot/automated PRs (e.g. Dependabot, claude/ branches that were just workflow
  scaffolding) can be filtered out — use judgment based on PR title patterns
- The `claude/` prefix branches are Claude-authored PRs; include them but note
  they were AI-assisted so the user can decide whether to feature them
