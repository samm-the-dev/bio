---
name: add-show
description: Import upcoming shows from .ics calendar files in C:\temp into content/shows.yaml. Use when the user has exported Facebook events or other calendar events.
---

# Add Show

Import shows from `.ics` calendar event files into `content/shows.yaml`.

## Arguments

`$ARGUMENTS` can be:

- Empty: Scan `C:\temp\` for all `.ics` files
- A file path: Import that specific `.ics` file

## Workflow

### Find ICS Files

If no argument given, scan `C:\temp\` for `.ics` files:

```bash
ls C:/temp/*.ics
```

If no files found, inform the user.
If multiple files found, list them and process all (or let user pick).

### Parse Each ICS File

Read the `.ics` file and extract:

- **SUMMARY** -> `title`
- **LOCATION** -> `venue`
- **DTSTART** -> `date` (convert UTC to Central time, format as `"YYYY-MM-DD"`)
- **DESCRIPTION** -> scan for time info, ticket prices, door times for `note`

For the time field, check the DESCRIPTION for specific show times (e.g., "8pm show", "show starts at 8pm"). The DTSTART in Facebook exports is often door/event start in UTC, not the show time. If a specific show time is mentioned in the description, use that.

For venue URLs, check if the venue matches a known venue:

- Pocket Sandwich Theatre -> https://www.pocketsandwich.com/
- Cafe Bohemia -> https://www.cafebohemia.net/
- ACT / Alternative Comedy Theater -> https://www.improvact.org/
- Stomping Ground -> https://stompinggroundcomedy.org/

Otherwise set `venueUrl` to null and note it for the user.

### Check for Duplicates

Read `content/shows.yaml` and check if a show with the same date and similar title already exists. Skip duplicates and inform the user.

### Present to User

Show the parsed data for confirmation:

```
title: "Show Title"
venue: Venue Name
venueUrl: https://...
date: "2026-03-10"
time: "8:00 PM"
note: "Doors at 7 PM. $12 admission."
```

Ask the user to confirm or adjust before writing.

### Apply Changes

Once confirmed:

1. Read `content/shows.yaml`
2. Append the new show entries
3. Sort all entries by date ascending
4. Write back to `content/shows.yaml`
5. Run `node scripts/fetch-content.mjs` to rebuild

### Done

Report how many shows were added. Remind the user to check the Shows page and commit when ready.
