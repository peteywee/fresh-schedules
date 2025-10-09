#!/usr/bin/env node
import fs from "fs";
import path from "path";

const [,, kindArg, slugArg] = process.argv;
const kind = (kindArg || "").toLowerCase();
const slug = (slugArg || "").toLowerCase().replace(/[^a-z0-9-_]/g, "-") || "untitled";

const map = {
  bible: { dir: "docs/bibles", ext: ".bible.md", title: "Project Bible" },
  wt: { dir: "docs/wt", ext: ".wt.md", title: "Walkthrough" },
  guide: { dir: "docs/guides", ext: ".guide.md", title: "Guide/Cookbook" },
  research: { dir: "docs/research", ext: ".r.md", title: "Research Brief" },
  note: { dir: "notes", ext: ".note.md", title: "Note" },
  todo: { dir: "todos", ext: ".todo.md", title: "TODO List" },
  scratch: { dir: "notes", ext: ".scratch.md", title: "Scratch" },
  mermaid: { dir: "docs/diagrams", ext: ".mermaid.md", title: "Mermaid Diagram" }
};

if (!map[kind]) {
  console.error(`Unknown kind '${kind}'. Allowed: ${Object.keys(map).join(", ")}`);
  process.exit(2);
}

const info = map[kind];
const file = path.join(process.cwd(), info.dir, `${slug}${info.ext}`);
fs.mkdirSync(path.dirname(file), { recursive: true });

const stamp = new Date().toISOString();
const boiler = `# ${info.title}: ${slug}

**Created:** ${stamp}

## What
(briefly describe)

## Why
(why this matters now)

## Acceptance Criteria
- [ ]

## Success Criteria
- [ ]

## TODO
- [ ]

`;

fs.writeFileSync(file, boiler, { encoding: "utf8", flag: "wx" });
console.log(file);
