"use client";

import { useState, useCallback } from "react";

const TECH_STACKS = [
  "TypeScript",
  "JavaScript",
  "Python",
  "Rust",
  "Go",
  "Java",
  "React",
  "Next.js",
  "Node.js",
  "Django",
  "Rails",
  "Swift",
  "Kotlin",
  "C#",
  ".NET",
  "Vue",
  "Svelte",
  "Tailwind CSS",
  "PostgreSQL",
  "MongoDB",
  "Redis",
  "Docker",
  "AWS",
  "Vercel",
] as const;

function generateContextMd(
  projectName: string,
  description: string,
  stack: string[]
): string {
  const stackLine = stack.length > 0 ? stack.join(", ") : "Add your tech stack here";
  return `# ${projectName}

${description || "Brief description of what this project does and why it exists."}

## Key Files

| Path | Purpose |
|------|---------|
| \`src/\` | Application source code |
| \`tests/\` | Test files |
| \`.context/agents/\` | Agent definitions |
| \`.context/docs/\` | Knowledge documents |

## Architecture

Describe your system architecture at a high level. Include frameworks, data flow, and deployment targets.

## Stack & Development

**Stack**: ${stackLine}
**Run locally**: \`npm run dev\`
**Run tests**: \`npm test\`
**Lint**: \`npm run lint\`

## Conventions

- List any coding conventions your project follows
- Include naming patterns, file organization rules, etc.

## SurfContext Navigation

This repo uses **SurfContext/ARDS v3.0**. When exploring, follow this discovery order:

1. **Start with \`CONTEXT.md\`** (this file) -- project overview, key files table, architecture
2. **Check \`surfcontext.json\`** -- machine-readable config with platform targets
3. **Read \`.context/docs/\`** -- deep knowledge documents
4. **Read \`.context/agents/\`** -- agent definitions with YAML frontmatter
`;
}

function generateClaudeMd(
  projectName: string,
  description: string,
  stack: string[]
): string {
  const stackLine = stack.length > 0 ? stack.join(", ") : "Add your tech stack here";
  return `<!-- GENERATED from CONTEXT.md by SurfContext -->
# ${projectName}

${description || "Brief description of what this project does and why it exists."}

## Key Files

| Path | Purpose |
|------|---------|
| \`src/\` | Application source code |
| \`tests/\` | Test files |
| \`.context/agents/\` | Agent definitions |
| \`.context/docs/\` | Knowledge documents |

## Architecture

Describe your system architecture at a high level. Include frameworks, data flow, and deployment targets.

## Stack & Development

**Stack**: ${stackLine}
**Run locally**: \`npm run dev\`
**Run tests**: \`npm test\`
**Lint**: \`npm run lint\`

## Conventions

- List any coding conventions your project follows
- Include naming patterns, file organization rules, etc.
`;
}

function generateSurfcontextJson(
  projectName: string,
  stack: string[]
): string {
  return JSON.stringify(
    {
      version: "2.0",
      project: projectName,
      source: "surfcontext-quickstart",
      platforms: ["claude", "codex", "cursor"],
      techStack: stack.length > 0 ? stack : undefined,
      canonical: {
        rootContext: "CONTEXT.md",
        docsDir: ".context/docs",
        agentsDir: ".context/agents",
      },
      generation: {
        claude: {
          rootContext: "CLAUDE.md",
          method: "sed-copy",
        },
        codex: {
          rootContext: "AGENTS.md",
          method: "sed-copy",
        },
      },
    },
    null,
    2
  );
}

function generateAgentMd(): string {
  return `---
name: code-reviewer
description: Reviews code for quality, security, and best practices
tools:
  - Read
  - Grep
  - Glob
model: sonnet
---

# Code Reviewer

You review pull requests and code changes for:

- Security vulnerabilities
- Performance issues
- Code style consistency
- Test coverage gaps

## Rules

- Always explain *why* something is a problem, not just *what*
- Suggest specific fixes, not vague improvements
- Check for proper error handling in all async operations
`;
}

function DownloadIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <polyline points="7 10 12 15 17 10" />
      <line x1="12" y1="15" x2="12" y2="3" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}

export function QuickStartDownload() {
  const [projectName, setProjectName] = useState("");
  const [description, setDescription] = useState("");
  const [selectedStack, setSelectedStack] = useState<string[]>([]);
  const [downloaded, setDownloaded] = useState(false);
  const [generating, setGenerating] = useState(false);

  const toggleStack = useCallback((tech: string) => {
    setSelectedStack((prev) =>
      prev.includes(tech) ? prev.filter((t) => t !== tech) : [...prev, tech]
    );
  }, []);

  const handleDownload = useCallback(async () => {
    const name = projectName.trim() || "my-project";
    const desc = description.trim();

    setGenerating(true);

    try {
      const JSZip = (await import("jszip")).default;
      const zip = new JSZip();

      // Root files
      zip.file("CONTEXT.md", generateContextMd(name, desc, selectedStack));
      zip.file("CLAUDE.md", generateClaudeMd(name, desc, selectedStack));
      zip.file("AGENTS.md", generateClaudeMd(name, desc, selectedStack));
      zip.file("surfcontext.json", generateSurfcontextJson(name, selectedStack));

      // .context directory structure
      zip.file(
        ".context/agents/code-reviewer.md",
        generateAgentMd()
      );
      zip.file(
        ".context/docs/.gitkeep",
        ""
      );

      const blob = await zip.generateAsync({ type: "blob" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `surfcontext-${name.toLowerCase().replace(/[^a-z0-9]+/g, "-")}.zip`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      setDownloaded(true);
      setTimeout(() => setDownloaded(false), 3000);
    } catch (error) {
      console.error("Failed to generate ZIP:", error);
    } finally {
      setGenerating(false);
    }
  }, [projectName, description, selectedStack]);

  return (
    <div className="rounded-lg border border-border bg-card overflow-hidden">
      {/* Form header */}
      <div className="px-6 py-4 border-b border-border bg-muted/30">
        <h3 className="text-base font-bold text-foreground">
          Generate your SurfContext starter kit
        </h3>
        <p className="text-sm text-muted-foreground mt-1">
          Fill in your project details and download a ready-to-use SurfContext
          package.
        </p>
      </div>

      {/* Form body */}
      <div className="px-6 py-5 space-y-5">
        {/* Project name */}
        <div>
          <label
            htmlFor="project-name"
            className="block text-sm font-medium text-foreground mb-1.5"
          >
            Project name
          </label>
          <input
            id="project-name"
            type="text"
            value={projectName}
            onChange={(e) => setProjectName(e.target.value)}
            placeholder="my-project"
            className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent transition-colors"
          />
        </div>

        {/* Description */}
        <div>
          <label
            htmlFor="project-description"
            className="block text-sm font-medium text-foreground mb-1.5"
          >
            What is your project about?
          </label>
          <textarea
            id="project-description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="A brief description of what your project does and why it exists..."
            rows={3}
            className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent transition-colors resize-none"
          />
        </div>

        {/* Tech stack */}
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">
            Tech stack{" "}
            <span className="font-normal text-muted-foreground">(optional)</span>
          </label>
          <div className="flex flex-wrap gap-2">
            {TECH_STACKS.map((tech) => {
              const isSelected = selectedStack.includes(tech);
              return (
                <button
                  key={tech}
                  type="button"
                  onClick={() => toggleStack(tech)}
                  className={`inline-flex items-center rounded-md px-2.5 py-1 text-xs font-medium transition-colors border ${
                    isSelected
                      ? "border-accent/50 bg-accent/10 text-accent-foreground"
                      : "border-border bg-muted/30 text-muted-foreground hover:text-foreground hover:border-border"
                  }`}
                >
                  {tech}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Download action */}
      <div className="px-6 py-4 border-t border-border bg-muted/20">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <p className="text-xs text-muted-foreground">
            Generates CONTEXT.md, CLAUDE.md, AGENTS.md, surfcontext.json, and
            .context/ directory
          </p>
          <button
            onClick={handleDownload}
            disabled={generating}
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary text-primary-foreground px-5 py-2.5 text-sm font-medium hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shrink-0"
          >
            {downloaded ? (
              <>
                <CheckIcon />
                Downloaded
              </>
            ) : generating ? (
              <>
                <span className="inline-block w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <DownloadIcon />
                Download SurfContext
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
