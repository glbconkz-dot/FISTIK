---
description: Use when setting up GitHub (or git) for a project's drawings, notes, and expertise album.
---

# GitHub documentation layout

One repo per object, never mix with FISTIK or other products.

```text
<project-code>/
  00-brief/           TZ, APZ scans, meeting notes
  01-concept/
  02-sketch-ep/       ЭП sheets + 3D
  03-working-rp/
    AR/ KR/ OV/ VK/ EO/ SS/ PB/ POS/ OOS/ SM/
  04-expertise/       cover letters, comment sheets, replies
  05-as-built/        after construction
  README.md           stage, GIP, current gate
```

Rules:

- PDF/DWG/RVT live in Git LFS or object storage; git tracks the register
- Sheet index is markdown in each discipline folder
- Expertise comments are PRs against `04-expertise/comments.md`
- Do not commit client personal data or license scans of people
- Branch: `ep`, `rp`, `expertise-round-N`

If the user has not created the repo yet, give them this tree and stop.
Do not attach this agent to the FISTIK bakery repository.
