---
name: publish-post
description: Prepare a draft blog post for publishing - generate excerpt, tags, related projects, and set the publish timestamp. Use when a post in content/posts/ is ready to go live.
---

# Publish Post

Prepare a draft blog post for publishing by filling in its metadata.

## Arguments

`$ARGUMENTS` can be:

- Empty: Find draft posts (missing `publishedAt`) and let user pick one
- A slug or filename: Target that specific post

## Workflow

### Find the Post

If no argument given, scan `content/posts/*.md` for posts where `publishedAt:` is empty:

```bash
grep -l "^publishedAt:$\|^publishedAt: *$" content/posts/*.md
```

If multiple drafts exist, list them and ask the user which one to publish.
If no drafts found, inform the user.

### Read and Analyze

Read the full post content. Understand the topic, tone, and technical content.

### Generate Metadata

For each empty or missing field, generate a suggestion and present it to the user for approval:

1. **excerpt** - A 1-2 sentence summary (under 300 chars) capturing what the post is about. Match the author's voice - direct, technical, no fluff.

2. **tags** - 2-5 lowercase tags relevant to the content. Use existing tags from other posts when possible for consistency. Check other posts first:

   ```bash
   grep "^tags:" content/posts/*.md
   ```

3. **relatedProjects** - Check if the post mentions any projects. Cross-reference against project slugs in `content/projects.yaml`. Only suggest if genuinely related.

### Confirm with User

Present all suggestions in a clear format:

```
excerpt: "Suggested excerpt here"
tags: [tag1, tag2, tag3]
relatedProjects: [project-slug]  (or omit if none)
```

Ask the user to confirm or adjust. Do NOT write to the file until confirmed.

### Apply Changes

Once confirmed:

1. Update the frontmatter fields using the Edit tool
2. Set `publishedAt` to the system's local time with UTC offset: `powershell -c "Get-Date -Format 'yyyy-MM-ddTHH:mm:ssK'"`
3. Read back the final frontmatter to confirm it looks right

### Generate Social Drafts

After applying changes, generate copy-pasteable drafts for social platforms and print them to the console. Do not post automatically — the user pastes these manually.

**LinkedIn** — professional tone, 2-4 sentences, end with relevant hashtags from `TAG_HASHTAGS` in `scripts/crosspost-bluesky.mjs` plus any platform-appropriate ones (e.g. `#BuildInPublic`). Link to the post.

**Facebook** — casual/personal tone, 1-3 sentences, no hashtags. Feels like something you'd say to friends, not an audience. Link to the post.

Print them clearly labeled:

```
--- LinkedIn ---
[draft]

--- Facebook ---
[draft]
```

Ask the user if they'd like to adjust either before wrapping up.

### Done

Report the post is ready. Remind the user to commit and push to deploy.

## Notes

- **CI**: Blog post PRs run the full CI pipeline (lint, test, build). The `paths-ignore` in `ci.yml` only skips `docs/` changes.
- **Copilot review**: Runs on all PRs (GitHub rulesets don't support path-based conditions for `copilot_code_review`). It's fast for content-only changes — just let it run.
- **Authors**: Valid values are `sam` and `claude`. Use `sam` for the human author (not `samm`). Add `claude` when the post was co-authored with Claude.
