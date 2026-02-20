import type { Metadata } from "next";
import Link from "next/link";
import { CodeBlock } from "@/components/code-block";
import { QuickStartDownload } from "@/components/quick-start-download";

export const metadata: Metadata = {
  title: "Getting Started - SurfContext",
  description:
    "Set up SurfContext in your project in under 5 minutes. No dependencies required.",
};

const step1Code = `# My Project

Brief description of what this project does and why it exists.

## Key Files

| Path | Purpose |
|------|---------|
| \`src/\` | Application source code |
| \`tests/\` | Test files |
| \`.context/agents/\` | Agent definitions |
| \`.context/docs/\` | Knowledge documents |

## Architecture

Describe your system architecture at a high level. Include
frameworks, data flow, and deployment targets.

## Stack & Development

**Stack**: TypeScript, React, Node.js
**Run locally**: \`npm run dev\`
**Run tests**: \`npm test\`
**Lint**: \`npm run lint\`

## Conventions

- List any coding conventions your project follows
- Include naming patterns, file organization rules, etc.`;

const step2Code = `mkdir -p .context/agents .context/docs .context/guides`;

const step2AgentCode = `---
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
- Check for proper error handling in all async operations`;

const step3Code = `{
  "version": "3.0",
  "source": "manual",
  "platforms": ["claude", "codex", "cursor"],
  "canonical": {
    "rootContext": "CONTEXT.md",
    "docsDir": ".context/docs",
    "agentsDir": ".context/agents",
    "guidesDir": ".context/guides"
  },
  "generation": {
    "claude": {
      "rootContext": "CLAUDE.md",
      "method": "sed-copy"
    },
    "codex": {
      "rootContext": "AGENTS.md",
      "method": "sed-copy"
    }
  },
  "discoveryOrder": [
    "CONTEXT.md",
    "surfcontext.json",
    ".context/docs/",
    ".context/guides/",
    ".context/agents/",
    "plans/"
  ]
}`;

const step4Code = `# Copy CONTEXT.md to generate platform files
cp CONTEXT.md CLAUDE.md
cp CONTEXT.md AGENTS.md

# Add a generated-file header (optional but recommended)
# You can also use the SurfContext CLI when available:
# npx surfcontext generate`;

const finalStructure = `my-project/
  CONTEXT.md              # Your canonical context (source of truth)
  surfcontext.json        # Platform targeting + discovery order
  .context/
    agents/
      code-reviewer.md    # Your agent definition
    docs/                 # Evergreen knowledge docs
    guides/               # Living how-to documents
  CLAUDE.md               # Generated for Claude Code
  AGENTS.md               # Generated for Codex CLI`;

export default function GettingStartedPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 sm:px-6 py-12 sm:py-16">
      {/* Header */}
      <div className="mb-12">
        <h1 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
          Getting Started
        </h1>
        <p className="text-lg text-muted-foreground">
          Add SurfContext to your project in under 5 minutes. No dependencies,
          no build step, no lock-in.
        </p>
      </div>

      {/* Quick Start Download */}
      <section className="mb-16">
        <div className="flex items-center gap-3 mb-6">
          <span className="inline-flex items-center gap-2 rounded-full border border-accent/30 bg-accent/10 px-3 py-1 text-xs font-mono text-accent-foreground">
            Fastest way to start
          </span>
        </div>
        <QuickStartDownload />
        <div className="mt-4 rounded-lg border border-border bg-muted/20 p-4">
          <p className="text-sm font-medium text-foreground mb-2">
            After downloading:
          </p>
          <ol className="space-y-1.5 text-sm text-muted-foreground">
            <li className="flex items-start gap-2">
              <span className="font-mono text-accent-foreground text-xs mt-0.5 shrink-0">
                1.
              </span>
              Unzip into your project root
            </li>
            <li className="flex items-start gap-2">
              <span className="font-mono text-accent-foreground text-xs mt-0.5 shrink-0">
                2.
              </span>
              Edit CONTEXT.md with your full project details
            </li>
            <li className="flex items-start gap-2">
              <span className="font-mono text-accent-foreground text-xs mt-0.5 shrink-0">
                3.
              </span>
              Open your project in Claude Code, Cursor, or any supported AI tool
              -- it discovers your context automatically
            </li>
          </ol>
        </div>
      </section>

      {/* Divider */}
      <div className="flex items-center gap-4 mb-16">
        <div className="h-px flex-1 bg-border" />
        <span className="text-xs font-mono text-muted-foreground uppercase tracking-wider">
          Or set up manually
        </span>
        <div className="h-px flex-1 bg-border" />
      </div>

      {/* Step 1 */}
      <section className="mb-12">
        <div className="flex items-center gap-3 mb-4">
          <span className="flex items-center justify-center w-8 h-8 rounded-full bg-accent/10 text-accent-foreground text-sm font-bold font-mono shrink-0">
            1
          </span>
          <h2 className="text-xl font-bold text-foreground">
            Create CONTEXT.md
          </h2>
        </div>
        <p className="text-muted-foreground leading-relaxed mb-4 ml-11">
          Create a{" "}
          <code className="font-mono text-accent-foreground bg-accent/10 px-1.5 py-0.5 rounded text-xs">
            CONTEXT.md
          </code>{" "}
          file in your project root. This is your canonical project context --
          the single source of truth that all AI agents will read.
        </p>
        <div className="ml-11">
          <CodeBlock code={step1Code} language="markdown" filename="CONTEXT.md" />
        </div>
      </section>

      {/* Step 2 */}
      <section className="mb-12">
        <div className="flex items-center gap-3 mb-4">
          <span className="flex items-center justify-center w-8 h-8 rounded-full bg-accent/10 text-accent-foreground text-sm font-bold font-mono shrink-0">
            2
          </span>
          <h2 className="text-xl font-bold text-foreground">
            Create .context/ directory
          </h2>
        </div>
        <p className="text-muted-foreground leading-relaxed mb-4 ml-11">
          Set up the context directory with subdirectories for agents,
          knowledge docs, and guides.
        </p>
        <div className="ml-11">
          <CodeBlock code={step2Code} language="bash" filename="Terminal" />
        </div>
        <p className="text-muted-foreground leading-relaxed mt-4 mb-4 ml-11">
          Add your first agent definition:
        </p>
        <div className="ml-11">
          <CodeBlock
            code={step2AgentCode}
            language="markdown"
            filename=".context/agents/code-reviewer.md"
          />
        </div>
      </section>

      {/* Step 3 */}
      <section className="mb-12">
        <div className="flex items-center gap-3 mb-4">
          <span className="flex items-center justify-center w-8 h-8 rounded-full bg-accent/10 text-accent-foreground text-sm font-bold font-mono shrink-0">
            3
          </span>
          <h2 className="text-xl font-bold text-foreground">
            Add surfcontext.json
          </h2>
        </div>
        <p className="text-muted-foreground leading-relaxed mb-4 ml-11">
          Create a{" "}
          <code className="font-mono text-accent-foreground bg-accent/10 px-1.5 py-0.5 rounded text-xs">
            surfcontext.json
          </code>{" "}
          manifest to declare your target platforms and generation settings.
        </p>
        <div className="ml-11">
          <CodeBlock
            code={step3Code}
            language="json"
            filename="surfcontext.json"
          />
        </div>
      </section>

      {/* Step 4 */}
      <section className="mb-12">
        <div className="flex items-center gap-3 mb-4">
          <span className="flex items-center justify-center w-8 h-8 rounded-full bg-accent/10 text-accent-foreground text-sm font-bold font-mono shrink-0">
            4
          </span>
          <h2 className="text-xl font-bold text-foreground">
            Generate platform files (optional)
          </h2>
        </div>
        <p className="text-muted-foreground leading-relaxed mb-4 ml-11">
          Generate platform-specific config files from your canonical context.
          For now, a simple copy works. The SurfContext CLI will automate this.
        </p>
        <div className="ml-11">
          <CodeBlock code={step4Code} language="bash" filename="Terminal" />
        </div>
      </section>

      {/* Step 5 */}
      <section className="mb-12">
        <div className="flex items-center gap-3 mb-4">
          <span className="flex items-center justify-center w-8 h-8 rounded-full bg-accent/10 text-accent-foreground text-sm font-bold font-mono shrink-0">
            5
          </span>
          <h2 className="text-xl font-bold text-foreground">
            Open in your AI tool
          </h2>
        </div>
        <p className="text-muted-foreground leading-relaxed mb-4 ml-11">
          Open your project in Claude Code, Cursor, Codex CLI, or any supported
          tool. The AI agent will automatically discover and read your project
          context.
        </p>
        <div className="ml-11">
          <div className="rounded-lg border border-border bg-card p-4 text-sm text-muted-foreground">
            <p className="mb-2">
              <strong className="text-foreground">That&apos;s it.</strong> Your final
              project structure looks like this:
            </p>
          </div>
          <CodeBlock code={finalStructure} filename="Final Structure" />
        </div>
      </section>

      {/* Next steps */}
      <section className="rounded-lg border border-border bg-muted/30 p-6">
        <h2 className="text-lg font-bold text-foreground mb-4">Next steps</h2>
        <ul className="space-y-3 text-sm text-muted-foreground">
          <li className="flex items-start gap-2">
            <span className="text-accent-foreground mt-0.5">--</span>
            <span>
              Read the{" "}
              <Link
                href="/spec"
                className="text-accent-foreground hover:underline"
              >
                full specification
              </Link>{" "}
              for detailed requirements and examples
            </span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-accent-foreground mt-0.5">--</span>
            <span>
              Add knowledge docs to{" "}
              <code className="font-mono text-accent-foreground bg-accent/10 px-1 rounded text-xs">
                .context/docs/
              </code>{" "}
              for architecture decisions, API references, and domain knowledge
            </span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-accent-foreground mt-0.5">--</span>
            <span>
              Define more agents in{" "}
              <code className="font-mono text-accent-foreground bg-accent/10 px-1 rounded text-xs">
                .context/agents/
              </code>{" "}
              for specialized tasks
            </span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-accent-foreground mt-0.5">--</span>
            <span>
              Add living guides to{" "}
              <code className="font-mono text-accent-foreground bg-accent/10 px-1 rounded text-xs">
                .context/guides/
              </code>{" "}
              for implementation how-tos with gotcha callouts (
              <Link
                href="/whats-new"
                className="text-accent-foreground hover:underline"
              >
                new in v3
              </Link>
              )
            </span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-accent-foreground mt-0.5">--</span>
            <span>
              Check out the{" "}
              <Link
                href="/tools"
                className="text-accent-foreground hover:underline"
              >
                tools page
              </Link>{" "}
              for automated setup options
            </span>
          </li>
        </ul>
      </section>
    </div>
  );
}
