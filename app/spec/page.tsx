import type { Metadata } from "next";
import { CodeBlock } from "@/components/code-block";
import { SpecSidebar } from "@/components/spec-sidebar";

export const metadata: Metadata = {
  title: "Specification - SurfContext ARDS v3.0",
  description:
    "The complete ARDS v3.0 specification for agent-ready project documentation.",
};

function Keyword({ children }: { children: string }) {
  return (
    <strong className="font-bold text-foreground uppercase text-sm">
      {children}
    </strong>
  );
}

function V3Badge() {
  return (
    <span className="inline-flex items-center gap-1 rounded-full border border-green-500/30 bg-green-500/10 px-2 py-0.5 text-[10px] font-mono text-green-500 ml-2 align-middle">
      v3
    </span>
  );
}

const fileHierarchyRequired = `project-root/
  CONTEXT.md                          # Root context (required)
  surfcontext.json                    # Configuration (recommended)
  .context/
    agents/                           # Agent definitions (1 file per agent)
      agent-name.md
    docs/                             # Evergreen knowledge docs
      architecture.md
      conventions.md`;

const fileHierarchyFull = `project-root/
  CONTEXT.md                          # Root context (canonical)
  surfcontext.json                    # ARDS configuration
  CLAUDE.md                           # Platform-specific (generated)
  AGENTS.md                           # Platform-specific (generated)
  .context/
    agents/                           # Agent definitions
      agent-name.md
    skills/                           # Reusable expertise (directory per skill)
      skill-name/
        SKILL.md
    docs/                             # Evergreen knowledge docs
      architecture.md
    guides/                           # Living how-to documents
      deploying-to-aws.md
    queue.md                          # Multi-agent task queue
  plans/                              # Time-stamped deliverables
    [category]/
      YYYY-MM-DD-topic.md
    sessions/                         # Session checkpoints
      YYYY-MM-DD-checkpoint.md
  research/                           # Academic manuscripts
    [project-name]/
      manuscript/v[N]/`;

const contextMdExample = `# Project Name

Brief description of what this project does.

## Key Files

| Path | Purpose |
|------|---------|
| \`src/app/\` | Next.js App Router pages |
| \`.context/agents/\` | Agent definitions |
| \`.context/docs/\` | Knowledge documents |
| \`.context/guides/\` | Living how-to guides |

## Architecture

Describe the high-level architecture: frameworks, data flow,
deployment targets, and key design decisions.

## Stack & Development

**Stack**: Next.js 15, React 19, AWS Amplify Gen 2, TypeScript
**Run locally**: \`npm run dev\`
**Run tests**: \`npm test\`

## Active Work

Current state: what's deployed, in progress, blocked, planned.

## Agents

| Agent | Scope |
|-------|-------|
| devops-architect | AWS architecture, deployment, CI/CD |
| code-reviewer | Code quality, security, best practices |`;

const surfcontextJsonExample = `{
  "version": "3.0",
  "platforms": ["claude", "codex", "cursor"],
  "canonical": {
    "rootContext": "CONTEXT.md",
    "docsDir": ".context/docs",
    "agentsDir": ".context/agents",
    "skillsDir": ".context/skills",
    "guidesDir": ".context/guides",
    "checkpointsDir": "plans/sessions",
    "plansDir": "plans"
  },
  "generation": {
    "claude": {
      "rootContext": "CLAUDE.md",
      "method": "sed-copy"
    },
    "codex": {
      "rootContext": "AGENTS.md",
      "method": "template-copy"
    }
  },
  "discoveryOrder": [
    "CONTEXT.md",
    "surfcontext.json",
    ".context/docs/",
    ".context/guides/",
    ".context/agents/",
    ".context/skills/",
    ".context/queue.md",
    "plans/"
  ],
  "ipSafety": {
    "enabled": true,
    "owner": "Example Corp",
    "noAiCoAuthor": true,
    "noSecrets": true
  },
  "mcp": {
    "serverName": "@surfcontext/mcp-server",
    "tools": [
      "surfcontext_read_context",
      "surfcontext_list_agents",
      "surfcontext_list_docs",
      "surfcontext_list_guides",
      "surfcontext_search"
    ]
  }
}`;

const agentExample = `---
name: devops-architect
description: AWS architecture, deployment, CI/CD, cost optimization
tools:
  - Read
  - Write
  - Bash
  - Grep
  - Glob
model: sonnet
---

# DevOps Architect

You are a DevOps specialist focused on AWS infrastructure.

## Scope

- Review and optimize AWS architecture decisions
- Diagnose deployment failures in Amplify Gen 2
- Manage CI/CD pipelines and build configurations

## Context Files

Read before starting work:
- \`.context/docs/architecture.md\` -- system structure
- \`.context/guides/deploying-to-aws.md\` -- deployment guide

## Cross-Agent Coordination

| Direction | Agent | What Flows | Format |
|-----------|-------|-----------|--------|
| Receives from | product-strategist | Feature specs | \`plans/product/*.md\` |
| Sends to | dev-workflow | Deploy status | \`plans/dev/*.md\` |`;

const skillExample = `---
name: patent-draft
description: Draft patent applications following USPTO conventions.
allowed-tools: Read, Write, Edit, Glob, Grep
model: opus
---

# Patent Drafting Skill

[Skill content -- expertise, procedures, templates]`;

const guideExample = `# Guide: Deploying to AWS Amplify

> Platform: AWS Amplify Gen 2
> Last updated: 2026-02-10
> Confidence: high

## Table of Contents

- [Initial Setup](#initial-setup)
- [Common Issues](#common-issues)

## Initial Setup

Deploy using \`npx ampx pipeline-deploy\` with CI=1 flag.

> **Gotcha** (learned 2026-02-08): CDK tokens like
> \`cdk.Stack.of().stackName\` are unresolved at synth time.
> Use \`process.env.AWS_BRANCH\` for branch-specific naming.

## Common Issues

Check CloudWatch logs before assuming the issue is in your code.

> **Gotcha** (learned 2026-02-09): \`force-dynamic\` on root
> layout forces SSR on every request and crashes when client
> providers aren't available server-side.`;

const checkpointExample = `# Session Checkpoint: Sprint Review

> Date: 2026-02-10 14:30
> Session: sprint-review
> Status: Checkpoint

## Accomplished

- Deployed billing integration
- Fixed production outage (FeedbackButton outside Providers)

## Remaining

- Wire Stripe webhook for subscription events
- Add usage tracking for metered billing

## Files Modified

| File | Change |
|------|--------|
| \`src/app/billing/page.tsx\` | Added tier subscription buttons |
| \`amplify/backend.ts\` | Fixed declaration ordering |

## Next Steps

1. Test subscription flow end-to-end
2. Deploy to production`;

const queueExample = `# Agent Task Queue

## Pending

### TASK-001: Review PR for Security Issues

| Field | Value |
|-------|-------|
| Assigned to | **claude** |
| Priority | High |
| Status | **pending** |

**What to do:**
1. Review all changed files for OWASP top 10
2. Check for credential leaks

**Expected result:** Security assessment with pass/fail

---

## In Progress

## Done`;

export default function SpecPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 sm:px-6 py-12 sm:py-16">
      <div className="flex gap-12">
        <SpecSidebar />

        {/* Content */}
        <article className="min-w-0 flex-1 max-w-3xl">
          {/* Header */}
          <div className="mb-12">
            <div className="inline-flex items-center gap-2 rounded-full border border-border bg-muted/50 px-3 py-1 text-xs font-mono text-muted-foreground mb-4">
              v3.0
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
              SurfContext Specification
            </h1>
            <p className="text-lg text-muted-foreground">
              Agent-Ready Documentation Standard (ARDS) v3.0
            </p>
          </div>

          {/* Overview */}
          <section id="overview" className="mb-16">
            <h2 className="text-2xl font-bold text-foreground mb-4 pb-2 border-b border-border">
              Overview
            </h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              The Agent-Ready Documentation Standard (ARDS) defines a file
              structure and set of conventions that make software repositories
              fully navigable by AI coding agents across all major platforms.
              ARDS provides a canonical source of truth (
              <code className="font-mono text-accent-foreground bg-accent/10 px-1.5 py-0.5 rounded text-xs">
                .context/
              </code>
              ) from which platform-specific files (
              <code className="font-mono text-accent-foreground bg-accent/10 px-1.5 py-0.5 rounded text-xs">
                CLAUDE.md
              </code>
              ,{" "}
              <code className="font-mono text-accent-foreground bg-accent/10 px-1.5 py-0.5 rounded text-xs">
                AGENTS.md
              </code>
              ,{" "}
              <code className="font-mono text-accent-foreground bg-accent/10 px-1.5 py-0.5 rounded text-xs">
                .cursorrules
              </code>
              ) are generated, solving the fragmentation problem caused by
              incompatible AI tool formats.
            </p>
            <p className="text-muted-foreground leading-relaxed mb-4">
              Version 3.0 introduces nine new sections: living guides, session
              checkpoints, evidence epistemology, formalized discovery order,
              multi-agent coordination contracts, cross-repository references,
              IP safety protocols, MCP integration, and context budget
              management. All v3 additions are backward-compatible.
            </p>

            <h3 className="text-lg font-semibold text-foreground mt-8 mb-3">
              What ARDS Is
            </h3>
            <ul className="list-disc list-inside space-y-2 text-muted-foreground mb-4">
              <li>A file structure specification for AI-navigable repositories</li>
              <li>A set of document type definitions (root context, agents, skills, docs, guides, plans, research)</li>
              <li>A discovery protocol that agents follow to build context</li>
              <li>A generation pipeline from canonical source to platform-specific output</li>
            </ul>

            <h3 className="text-lg font-semibold text-foreground mt-8 mb-3">
              What ARDS Is Not
            </h3>
            <ul className="list-disc list-inside space-y-2 text-muted-foreground">
              <li>Not a replacement for any single platform&apos;s format -- it generates them</li>
              <li>Not a runtime protocol (that&apos;s MCP)</li>
              <li>Not a build system or package manager</li>
              <li>Not required to use any specific AI tool</li>
            </ul>
          </section>

          {/* Design Principles */}
          <section id="design-principles" className="mb-16">
            <h2 className="text-2xl font-bold text-foreground mb-4 pb-2 border-b border-border">
              Design Principles
            </h2>
            <div className="space-y-4">
              {[
                { n: "1", title: "Token budget awareness", desc: "Root context is loaded every agent turn. Everything else loads on demand. Structure files to minimize per-turn cost while maximizing agent effectiveness." },
                { n: "2", title: "Tables over prose", desc: "AI agents parse structured data faster and more reliably than paragraphs. Use tables for any data with 2+ attributes." },
                { n: "3", title: "Explicit paths over descriptions", desc: "Write src/lib/auth.ts, not \"the auth file.\" Agents cannot infer locations from vague descriptions." },
                { n: "4", title: "Single source of truth", desc: "Each fact lives in one file. Other files reference it, never duplicate it. This is the core principle that prevents context rot." },
                { n: "5", title: "Temporal separation", desc: "Evergreen reference (.context/docs/) and time-stamped work (plans/) serve different purposes. Never mix them." },
                { n: "6", title: "Self-containment per type", desc: "Each document should be useful when read in isolation." },
                { n: "7", title: "Progressive disclosure", desc: "Summaries load first; details load on demand. Match depth to access pattern." },
                { n: "8", title: "Canonical source, generated output", desc: "Edit .context/. Never edit .claude/ or .cursor/ directly. Generated files are disposable." },
                { n: "9", title: "Backward compatibility", desc: "New spec versions must not break existing conforming projects. All additions are optional unless the version field is explicitly bumped." },
              ].map((p) => (
                <div key={p.n} className="flex gap-3">
                  <span className="flex items-center justify-center w-7 h-7 rounded-full bg-accent/10 text-accent-foreground text-xs font-bold font-mono shrink-0 mt-0.5">
                    {p.n}
                  </span>
                  <div>
                    <p className="text-sm font-semibold text-foreground">{p.title}</p>
                    <p className="text-sm text-muted-foreground">{p.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* File Hierarchy */}
          <section id="file-hierarchy" className="mb-16">
            <h2 className="text-2xl font-bold text-foreground mb-4 pb-2 border-b border-border">
              File Hierarchy
            </h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              A conforming SurfContext project <Keyword>MUST</Keyword> include a{" "}
              <code className="font-mono text-accent-foreground bg-accent/10 px-1.5 py-0.5 rounded text-xs">
                CONTEXT.md
              </code>{" "}
              file at the project root. It <Keyword>SHOULD</Keyword> include a{" "}
              <code className="font-mono text-accent-foreground bg-accent/10 px-1.5 py-0.5 rounded text-xs">
                surfcontext.json
              </code>{" "}
              manifest and a{" "}
              <code className="font-mono text-accent-foreground bg-accent/10 px-1.5 py-0.5 rounded text-xs">
                .context/
              </code>{" "}
              directory.
            </p>

            <h3 className="text-lg font-semibold text-foreground mt-8 mb-3">
              Required Structure
            </h3>
            <CodeBlock code={fileHierarchyRequired} filename="Minimum Structure" />

            <h3 className="text-lg font-semibold text-foreground mt-8 mb-3">
              Full Structure (All Optional Additions)
            </h3>
            <CodeBlock code={fileHierarchyFull} filename="Full Structure" />

            <h3 className="text-lg font-semibold text-foreground mt-8 mb-3">
              Naming Conventions
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm border border-border rounded-lg overflow-hidden">
                <thead>
                  <tr className="bg-muted/50 border-b border-border">
                    <th className="text-left px-4 py-2 font-medium text-foreground">Element</th>
                    <th className="text-left px-4 py-2 font-medium text-foreground">Convention</th>
                    <th className="text-left px-4 py-2 font-medium text-foreground">Example</th>
                  </tr>
                </thead>
                <tbody className="text-muted-foreground">
                  {[
                    ["Agent files", "kebab-case.md", "devops-architect.md"],
                    ["Skill directories", "kebab-case/", "patent-draft/"],
                    ["Knowledge docs", "kebab-case.md", "architecture.md"],
                    ["Guide files", "kebab-case.md", "deploying-to-aws.md"],
                    ["Plan docs", "YYYY-MM-DD-topic.md", "2026-02-04-launch-plan.md"],
                    ["Checkpoint files", "YYYY-MM-DD-topic-checkpoint.md", "2026-02-10-sprint-checkpoint.md"],
                    ["Research projects", "kebab-case/", "remote-flow/"],
                  ].map(([item, convention, example], i, arr) => (
                    <tr key={item} className={i < arr.length - 1 ? "border-b border-border" : ""}>
                      <td className="px-4 py-2">{item}</td>
                      <td className="px-4 py-2">{convention}</td>
                      <td className="px-4 py-2 font-mono text-xs">{example}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          {/* Root Context */}
          <section id="root-context" className="mb-16">
            <h2 className="text-2xl font-bold text-foreground mb-4 pb-2 border-b border-border">
              Root Context (CONTEXT.md)
            </h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              CONTEXT.md is the single most important file in any ARDS-compliant
              repository. It is auto-loaded by AI agents every turn through
              platform-specific files (CLAUDE.md, AGENTS.md, etc.) and serves as
              the primary orientation for any AI agent or human contributor.
            </p>

            <h3 id="context-md-structure" className="text-lg font-semibold text-foreground mt-8 mb-3">
              Structure
            </h3>
            <CodeBlock code={contextMdExample} language="markdown" filename="CONTEXT.md" />

            <h3 id="context-md-requirements" className="text-lg font-semibold text-foreground mt-8 mb-3">
              Requirements
            </h3>
            <ul className="list-disc list-inside space-y-2 text-muted-foreground">
              <li><Keyword>MUST</Keyword> begin with an H1 heading containing the project name</li>
              <li><Keyword>MUST</Keyword> include a Key Files table mapping paths to purposes</li>
              <li><Keyword>SHOULD</Keyword> include an Architecture section with high-level system design</li>
              <li><Keyword>SHOULD</Keyword> include a Stack &amp; Development section with build/run/test commands</li>
              <li><Keyword>SHOULD</Keyword> include an Active Work section with current state</li>
              <li><Keyword>SHOULD</Keyword> be under 200 lines (product repos) or 300 lines (command centers)</li>
              <li><Keyword>MAY</Keyword> include Agents, Commands, and Cross-Repo Dependencies sections</li>
              <li><Keyword>MUST NOT</Keyword> contain secrets, API keys, or credentials</li>
            </ul>

            <div className="rounded-lg border border-border bg-card p-4 text-sm text-muted-foreground mt-6">
              <p className="font-semibold text-foreground mb-2">Token budget</p>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left py-1 pr-4 font-medium text-foreground">Repo Type</th>
                      <th className="text-left py-1 pr-4 font-medium text-foreground">Target Lines</th>
                      <th className="text-left py-1 pr-4 font-medium text-foreground">Tokens/Turn</th>
                      <th className="text-left py-1 font-medium text-foreground">30-Turn Cost</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b border-border">
                      <td className="py-1 pr-4">Product repo</td>
                      <td className="py-1 pr-4 font-mono text-xs">&lt; 200</td>
                      <td className="py-1 pr-4 font-mono text-xs">~800</td>
                      <td className="py-1 font-mono text-xs">~24,000</td>
                    </tr>
                    <tr>
                      <td className="py-1 pr-4">Command center</td>
                      <td className="py-1 pr-4 font-mono text-xs">&lt; 300</td>
                      <td className="py-1 pr-4 font-mono text-xs">~1,200</td>
                      <td className="py-1 font-mono text-xs">~36,000</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </section>

          {/* surfcontext.json */}
          <section id="surfcontext-json" className="mb-16">
            <h2 className="text-2xl font-bold text-foreground mb-4 pb-2 border-b border-border">
              surfcontext.json
            </h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              The manifest file provides machine-readable configuration for
              SurfContext tooling. It declares which platforms to target, how
              to generate platform-specific files, and v3 features like
              discovery order, IP safety, and MCP integration.
            </p>

            <h3 id="surfcontext-schema" className="text-lg font-semibold text-foreground mt-8 mb-3">
              Schema (v3.0)
            </h3>
            <CodeBlock code={surfcontextJsonExample} language="json" filename="surfcontext.json" />

            <h3 id="surfcontext-fields" className="text-lg font-semibold text-foreground mt-8 mb-3">
              Field Reference
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm border border-border rounded-lg overflow-hidden">
                <thead>
                  <tr className="bg-muted/50 border-b border-border">
                    <th className="text-left px-4 py-2 font-medium text-foreground">Field</th>
                    <th className="text-left px-4 py-2 font-medium text-foreground">Required</th>
                    <th className="text-left px-4 py-2 font-medium text-foreground">Description</th>
                  </tr>
                </thead>
                <tbody className="text-muted-foreground">
                  {[
                    ["version", true, "ARDS version: \"3.0\""],
                    ["platforms", true, "Target platforms: \"claude\", \"codex\", \"cursor\", \"copilot\""],
                    ["canonical.rootContext", true, "Path to canonical root context file"],
                    ["canonical.agentsDir", true, "Path to agent definitions directory"],
                    ["canonical.docsDir", true, "Path to knowledge docs directory"],
                    ["canonical.skillsDir", false, "Path to skills directory"],
                    ["canonical.guidesDir", false, "Path to guides directory (new in v3)"],
                    ["canonical.checkpointsDir", false, "Path to session checkpoints (new in v3)"],
                    ["canonical.plansDir", false, "Path to plans directory (new in v3)"],
                    ["generation", false, "Platform-specific generation configuration"],
                    ["discoveryOrder", false, "Ordered list of paths agents navigate (new in v3)"],
                    ["ipSafety", false, "IP safety configuration (new in v3)"],
                    ["mcp", false, "MCP server integration (new in v3)"],
                  ].map(([field, required, desc], i, arr) => (
                    <tr key={field as string} className={i < arr.length - 1 ? "border-b border-border" : ""}>
                      <td className="px-4 py-2 font-mono text-xs text-accent-foreground">{field as string}</td>
                      <td className="px-4 py-2">
                        <Keyword>{required ? "REQUIRED" : "OPTIONAL"}</Keyword>
                      </td>
                      <td className="px-4 py-2">{desc as string}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          {/* Agent Configs */}
          <section id="agent-configs" className="mb-16">
            <h2 className="text-2xl font-bold text-foreground mb-4 pb-2 border-b border-border">
              Agent Configurations
            </h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              Agent definition files live in{" "}
              <code className="font-mono text-accent-foreground bg-accent/10 px-1.5 py-0.5 rounded text-xs">
                .context/agents/
              </code>
              . Each file defines a specialized agent with specific
              responsibilities, tool access, and output patterns.
            </p>

            <h3 id="agent-format" className="text-lg font-semibold text-foreground mt-8 mb-3">
              File Format
            </h3>
            <CodeBlock code={agentExample} language="markdown" filename=".context/agents/devops-architect.md" />

            <h3 id="agent-fields" className="text-lg font-semibold text-foreground mt-8 mb-3">
              Frontmatter Fields
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm border border-border rounded-lg overflow-hidden">
                <thead>
                  <tr className="bg-muted/50 border-b border-border">
                    <th className="text-left px-4 py-2 font-medium text-foreground">Field</th>
                    <th className="text-left px-4 py-2 font-medium text-foreground">Required</th>
                    <th className="text-left px-4 py-2 font-medium text-foreground">Description</th>
                  </tr>
                </thead>
                <tbody className="text-muted-foreground">
                  {[
                    ["name", true, "Kebab-case. Must match filename without .md."],
                    ["description", true, "80-150 chars. Action-oriented. Starts with verb."],
                    ["tools", true, "Comma-separated. Only tools the agent needs."],
                    ["model", true, "haiku, sonnet, opus, or inherit."],
                  ].map(([field, required, desc], i, arr) => (
                    <tr key={field as string} className={i < arr.length - 1 ? "border-b border-border" : ""}>
                      <td className="px-4 py-2 font-mono text-xs text-accent-foreground">{field as string}</td>
                      <td className="px-4 py-2"><Keyword>{required ? "REQUIRED" : "OPTIONAL"}</Keyword></td>
                      <td className="px-4 py-2">{desc as string}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <h3 className="text-lg font-semibold text-foreground mt-8 mb-3">
              Scoping Rules
            </h3>
            <ul className="list-disc list-inside space-y-2 text-muted-foreground">
              <li><strong className="text-foreground">One job per agent</strong> -- don&apos;t combine frontend + deployment + testing</li>
              <li><strong className="text-foreground">3-5 per product repo</strong> -- enough coverage without overlap</li>
              <li><strong className="text-foreground">Up to 25 for command centers</strong> -- strategy repos coordinate many domains</li>
              <li><strong className="text-foreground">Stack-appropriate tools</strong> -- don&apos;t give every agent every tool</li>
            </ul>
          </section>

          {/* Skill Configs */}
          <section id="skill-configs" className="mb-16">
            <h2 className="text-2xl font-bold text-foreground mb-4 pb-2 border-b border-border">
              Skill Definitions
            </h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              Skills define reusable expertise with progressive disclosure.
              Unlike agents, skills support slash-command invocation,
              supporting files, and cross-platform portability via the Agent
              Skills standard.
            </p>
            <CodeBlock code={skillExample} language="markdown" filename=".context/skills/patent-draft/SKILL.md" />

            <h3 className="text-lg font-semibold text-foreground mt-8 mb-3">
              Skills vs Agents
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm border border-border rounded-lg overflow-hidden">
                <thead>
                  <tr className="bg-muted/50 border-b border-border">
                    <th className="text-left px-4 py-2 font-medium text-foreground">Property</th>
                    <th className="text-left px-4 py-2 font-medium text-foreground">Agents</th>
                    <th className="text-left px-4 py-2 font-medium text-foreground">Skills</th>
                  </tr>
                </thead>
                <tbody className="text-muted-foreground">
                  {[
                    ["Primary purpose", "Independent parallel workers", "Reusable expertise"],
                    ["Execution model", "Forked subagent (isolated context)", "Inline or forked"],
                    ["Best for", "Long analysis, strategy", "Code patterns, templates"],
                    ["Cross-platform", "Single platform", "Multi-platform"],
                    ["Invocation", "Description match", "Description match or /command"],
                  ].map(([prop, agents, skills], i, arr) => (
                    <tr key={prop} className={i < arr.length - 1 ? "border-b border-border" : ""}>
                      <td className="px-4 py-2 font-medium text-foreground">{prop}</td>
                      <td className="px-4 py-2">{agents}</td>
                      <td className="px-4 py-2">{skills}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          {/* Knowledge Docs */}
          <section id="knowledge-docs" className="mb-16">
            <h2 className="text-2xl font-bold text-foreground mb-4 pb-2 border-b border-border">
              Knowledge Documents
            </h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              Knowledge documents live in{" "}
              <code className="font-mono text-accent-foreground bg-accent/10 px-1.5 py-0.5 rounded text-xs">
                .context/docs/
              </code>{" "}
              and store evergreen reference material too detailed for
              CONTEXT.md but essential for agent work. Read on demand, not
              every turn.
            </p>
            <ul className="list-disc list-inside space-y-2 text-muted-foreground mb-4">
              <li><Keyword>MUST</Keyword> include a <code className="font-mono text-accent-foreground bg-accent/10 px-1 rounded text-xs">&gt; Last updated: YYYY-MM-DD</code> date</li>
              <li><Keyword>SHOULD</Keyword> use descriptive kebab-case filenames</li>
              <li><Keyword>SHOULD</Keyword> begin with an H1 heading</li>
              <li><Keyword>MUST NOT</Keyword> contain secrets or credentials</li>
              <li><Keyword>SHOULD NOT</Keyword> exceed 400 lines</li>
            </ul>
            <div className="rounded-lg border border-border bg-card p-4 text-sm text-muted-foreground">
              <p className="font-semibold text-foreground mb-2">Standard docs</p>
              <p className="mb-1"><strong className="text-foreground">All repos:</strong> <code className="font-mono text-accent-foreground bg-accent/10 px-1 rounded text-xs">architecture.md</code>, <code className="font-mono text-accent-foreground bg-accent/10 px-1 rounded text-xs">conventions.md</code></p>
              <p><strong className="text-foreground">Strategy repos add:</strong> <code className="font-mono text-accent-foreground bg-accent/10 px-1 rounded text-xs">company-overview.md</code>, <code className="font-mono text-accent-foreground bg-accent/10 px-1 rounded text-xs">product-portfolio.md</code>, <code className="font-mono text-accent-foreground bg-accent/10 px-1 rounded text-xs">repo-registry.md</code></p>
            </div>
          </section>

          {/* Guides */}
          <section id="guides" className="mb-16">
            <h2 className="text-2xl font-bold text-foreground mb-4 pb-2 border-b border-border">
              Guides<V3Badge />
            </h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              Guides are living how-to documents in{" "}
              <code className="font-mono text-accent-foreground bg-accent/10 px-1.5 py-0.5 rounded text-xs">
                .context/guides/
              </code>{" "}
              that accumulate battle-tested implementation knowledge over
              time. They are distinct from every other document type:
            </p>
            <div className="overflow-x-auto mb-6">
              <table className="w-full text-sm border border-border rounded-lg overflow-hidden">
                <thead>
                  <tr className="bg-muted/50 border-b border-border">
                    <th className="text-left px-4 py-2 font-medium text-foreground">Type</th>
                    <th className="text-left px-4 py-2 font-medium text-foreground">Purpose</th>
                    <th className="text-left px-4 py-2 font-medium text-foreground">Mutability</th>
                  </tr>
                </thead>
                <tbody className="text-muted-foreground">
                  <tr className="border-b border-border"><td className="px-4 py-2 font-medium text-foreground">Docs</td><td className="px-4 py-2">Describe what IS</td><td className="px-4 py-2">Updated when state changes</td></tr>
                  <tr className="border-b border-border"><td className="px-4 py-2 font-medium text-foreground">Agents</td><td className="px-4 py-2">Define WHO</td><td className="px-4 py-2">Stable</td></tr>
                  <tr className="border-b border-border"><td className="px-4 py-2 font-medium text-foreground">Skills</td><td className="px-4 py-2">Define COMMANDS</td><td className="px-4 py-2">Stable</td></tr>
                  <tr><td className="px-4 py-2 font-medium text-green-500">Guides</td><td className="px-4 py-2">Describe HOW TO</td><td className="px-4 py-2 font-medium text-green-500">Living -- grows with each implementation</td></tr>
                </tbody>
              </table>
            </div>
            <CodeBlock code={guideExample} language="markdown" filename=".context/guides/deploying-to-aws.md" />

            <h3 className="text-lg font-semibold text-foreground mt-8 mb-3">Key Properties</h3>
            <ul className="list-disc list-inside space-y-2 text-muted-foreground">
              <li><strong className="text-foreground">Table of contents</strong> -- required; guides are long-form, agents need navigation</li>
              <li><strong className="text-foreground">Last updated date</strong> -- required; signals freshness</li>
              <li><strong className="text-foreground">Confidence level</strong> -- required; <code className="font-mono text-accent-foreground bg-accent/10 px-1 rounded text-xs">low</code> / <code className="font-mono text-accent-foreground bg-accent/10 px-1 rounded text-xs">medium</code> / <code className="font-mono text-accent-foreground bg-accent/10 px-1 rounded text-xs">high</code></li>
              <li><strong className="text-foreground">Gotcha callouts</strong> -- blockquote with <code className="font-mono text-accent-foreground bg-accent/10 px-1 rounded text-xs">**Gotcha**</code> prefix and date</li>
              <li><strong className="text-foreground">Living by design</strong> -- agents SHOULD update the relevant guide after completing work</li>
            </ul>
          </section>

          {/* Plan Docs */}
          <section id="plan-docs" className="mb-16">
            <h2 className="text-2xl font-bold text-foreground mb-4 pb-2 border-b border-border">
              Plan Documents
            </h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              Plan docs in{" "}
              <code className="font-mono text-accent-foreground bg-accent/10 px-1.5 py-0.5 rounded text-xs">
                plans/
              </code>{" "}
              capture point-in-time analysis, decisions, strategies, and
              deliverables. Named with{" "}
              <code className="font-mono text-accent-foreground bg-accent/10 px-1.5 py-0.5 rounded text-xs">
                YYYY-MM-DD-descriptive-slug.md
              </code>{" "}
              format, organized by category subdirectory.
            </p>
            <div className="overflow-x-auto">
              <table className="w-full text-sm border border-border rounded-lg overflow-hidden">
                <thead>
                  <tr className="bg-muted/50 border-b border-border">
                    <th className="text-left px-4 py-2 font-medium text-foreground">Category</th>
                    <th className="text-left px-4 py-2 font-medium text-foreground">Contents</th>
                  </tr>
                </thead>
                <tbody className="text-muted-foreground">
                  {[
                    ["capital/", "Funding, cap table, investor strategy"],
                    ["product/", "Product strategy, design specs, roadmaps"],
                    ["strategy/", "Business strategy, thesis evaluations"],
                    ["competitive/", "Competitor landscape, market sizing"],
                    ["patents/", "Patent families, prior art, filing strategy"],
                    ["sessions/", "Session checkpoints"],
                    ["dev/", "Workflow audits, CI/CD, testing"],
                    ["launches/", "Launch checklists, beta programs"],
                    ["legal/", "Corporate structure, compliance"],
                    ["research/", "Study designs, venue analysis"],
                  ].map(([cat, contents], i, arr) => (
                    <tr key={cat} className={i < arr.length - 1 ? "border-b border-border" : ""}>
                      <td className="px-4 py-2 font-mono text-xs text-accent-foreground">{cat}</td>
                      <td className="px-4 py-2">{contents}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          {/* Research Docs */}
          <section id="research-docs" className="mb-16">
            <h2 className="text-2xl font-bold text-foreground mb-4 pb-2 border-b border-border">
              Research Documents
            </h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              Research docs in{" "}
              <code className="font-mono text-accent-foreground bg-accent/10 px-1.5 py-0.5 rounded text-xs">
                research/
              </code>{" "}
              are academic manuscripts with versioned drafts. Each project
              has its own directory with{" "}
              <code className="font-mono text-accent-foreground bg-accent/10 px-1 rounded text-xs">
                manuscript/v[N]/
              </code>{" "}
              and{" "}
              <code className="font-mono text-accent-foreground bg-accent/10 px-1 rounded text-xs">
                analysis/
              </code>{" "}
              subdirectories.
            </p>
            <ul className="list-disc list-inside space-y-2 text-muted-foreground">
              <li><strong className="text-foreground">Never overwrite</strong> a previous version -- create a new directory</li>
              <li>Analysis docs use <code className="font-mono text-accent-foreground bg-accent/10 px-1 rounded text-xs">YYYY-MM-DD</code> naming</li>
              <li>README.md at project root describes status and venue</li>
            </ul>
          </section>

          {/* Session Checkpoints */}
          <section id="session-checkpoints" className="mb-16">
            <h2 className="text-2xl font-bold text-foreground mb-4 pb-2 border-b border-border">
              Session Checkpoints<V3Badge />
            </h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              Session checkpoints are structured handoff documents that
              preserve work state across context boundaries -- when a
              conversation ends, an agent is swapped, or a developer switches
              machines.
            </p>
            <CodeBlock code={checkpointExample} language="markdown" filename="plans/sessions/2026-02-10-sprint-review-checkpoint.md" />

            <h3 className="text-lg font-semibold text-foreground mt-8 mb-3">When to Checkpoint</h3>
            <ul className="list-disc list-inside space-y-2 text-muted-foreground">
              <li><strong className="text-foreground">Context getting long</strong> -- better to checkpoint with margin than lose work</li>
              <li><strong className="text-foreground">Switching agents</strong> -- when handing work between agent types</li>
              <li><strong className="text-foreground">End of session</strong> -- before closing a conversation</li>
              <li><strong className="text-foreground">Switching machines</strong> -- when continuing on a different computer</li>
              <li><strong className="text-foreground">Before risky operations</strong> -- before large refactors or deployments</li>
            </ul>
          </section>

          {/* Discovery Order */}
          <section id="discovery-order" className="mb-16">
            <h2 className="text-2xl font-bold text-foreground mb-4 pb-2 border-b border-border">
              Discovery Order<V3Badge />
            </h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              Discovery order defines the sequence in which agents should
              navigate an ARDS-compliant repository. This was implicit in v2;
              v3 makes it explicit and configurable.
            </p>
            <div className="overflow-x-auto">
              <table className="w-full text-sm border border-border rounded-lg overflow-hidden">
                <thead>
                  <tr className="bg-muted/50 border-b border-border">
                    <th className="text-left px-4 py-2 font-medium text-foreground">Step</th>
                    <th className="text-left px-4 py-2 font-medium text-foreground">Path</th>
                    <th className="text-left px-4 py-2 font-medium text-foreground">Loading</th>
                    <th className="text-left px-4 py-2 font-medium text-foreground hidden sm:table-cell">Purpose</th>
                  </tr>
                </thead>
                <tbody className="text-muted-foreground">
                  {[
                    ["1", "CONTEXT.md", "Always", "Project identity and map"],
                    ["2", "surfcontext.json", "Always", "Configuration and platform targets"],
                    ["3", ".context/docs/", "On demand", "Evergreen knowledge"],
                    ["4", ".context/guides/", "On demand", "Living how-to documents"],
                    ["5", ".context/agents/", "On dispatch", "Agent definitions"],
                    ["6", ".context/skills/", "On invoke", "Skill definitions"],
                    ["7", ".context/queue.md", "On request", "Multi-agent task queue"],
                    ["8", "plans/", "On demand", "Time-stamped work"],
                    ["9", "research/", "On demand", "Academic manuscripts"],
                    ["10", "Source code", "On demand", "Follow architecture from CONTEXT.md"],
                  ].map(([step, path, loading, purpose], i, arr) => (
                    <tr key={step} className={i < arr.length - 1 ? "border-b border-border" : ""}>
                      <td className="px-4 py-2 font-mono text-xs font-bold">{step}</td>
                      <td className="px-4 py-2 font-mono text-xs text-accent-foreground">{path}</td>
                      <td className="px-4 py-2">
                        <span className={`text-xs font-medium ${loading === "Always" ? "text-green-500" : loading === "On dispatch" || loading === "On invoke" ? "text-purple-500" : "text-muted-foreground"}`}>
                          {loading}
                        </span>
                      </td>
                      <td className="px-4 py-2 hidden sm:table-cell">{purpose}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="rounded-lg border border-border bg-card p-4 text-sm text-muted-foreground mt-4">
              <p>
                <strong className="text-foreground">Custom order:</strong>{" "}
                Projects can override via{" "}
                <code className="font-mono text-accent-foreground bg-accent/10 px-1 rounded text-xs">
                  discoveryOrder
                </code>{" "}
                in surfcontext.json. Agents and tooling should respect this
                order when present.
              </p>
            </div>
          </section>

          {/* Evidence Epistemology */}
          <section id="evidence-epistemology" className="mb-16">
            <h2 className="text-2xl font-bold text-foreground mb-4 pb-2 border-b border-border">
              Evidence Epistemology<V3Badge />
            </h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              Evidence epistemology defines how agents handle claims, sources,
              and uncertainty in documents they produce. This prevents
              strategy built on unverified claims from compounding errors.
            </p>

            <h3 className="text-lg font-semibold text-foreground mt-8 mb-3">Claim Tags</h3>
            <div className="overflow-x-auto mb-6">
              <table className="w-full text-sm border border-border rounded-lg overflow-hidden">
                <thead>
                  <tr className="bg-muted/50 border-b border-border">
                    <th className="text-left px-4 py-2 font-medium text-foreground">Tag</th>
                    <th className="text-left px-4 py-2 font-medium text-foreground">When to Use</th>
                  </tr>
                </thead>
                <tbody className="text-muted-foreground">
                  <tr className="border-b border-border"><td className="px-4 py-2 font-mono text-xs text-green-500">[verified]</td><td className="px-4 py-2">Claim backed by Tier 1-2 source</td></tr>
                  <tr className="border-b border-border"><td className="px-4 py-2 font-mono text-xs text-yellow-500">[unverified]</td><td className="px-4 py-2">From memory or secondary source</td></tr>
                  <tr className="border-b border-border"><td className="px-4 py-2 font-mono text-xs text-orange-500">[assumption]</td><td className="px-4 py-2">Logical inference, not established fact</td></tr>
                  <tr><td className="px-4 py-2 font-mono text-xs text-blue-500">[internal estimate]</td><td className="px-4 py-2">Internal modeling or judgment</td></tr>
                </tbody>
              </table>
            </div>

            <h3 className="text-lg font-semibold text-foreground mt-8 mb-3">Evidence Hierarchy</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm border border-border rounded-lg overflow-hidden">
                <thead>
                  <tr className="bg-muted/50 border-b border-border">
                    <th className="text-left px-4 py-2 font-medium text-foreground">Tier</th>
                    <th className="text-left px-4 py-2 font-medium text-foreground">Source Type</th>
                    <th className="text-left px-4 py-2 font-medium text-foreground">Trust Level</th>
                  </tr>
                </thead>
                <tbody className="text-muted-foreground">
                  <tr className="border-b border-border"><td className="px-4 py-2 font-bold">1</td><td className="px-4 py-2">Peer-reviewed research, SEC filings, official docs</td><td className="px-4 py-2">Highest -- cite directly</td></tr>
                  <tr className="border-b border-border"><td className="px-4 py-2 font-bold">2</td><td className="px-4 py-2">Industry reports (Gartner, Forrester), reputable journalism</td><td className="px-4 py-2">High -- cite with date</td></tr>
                  <tr className="border-b border-border"><td className="px-4 py-2 font-bold">3</td><td className="px-4 py-2">Blog posts, conference talks, social media</td><td className="px-4 py-2">Medium -- cross-reference first</td></tr>
                  <tr><td className="px-4 py-2 font-bold">4</td><td className="px-4 py-2">Internal estimates, founder intuition</td><td className="px-4 py-2">Use freely, always tag</td></tr>
                </tbody>
              </table>
            </div>
          </section>

          {/* Multi-Agent Coordination */}
          <section id="multi-agent" className="mb-16">
            <h2 className="text-2xl font-bold text-foreground mb-4 pb-2 border-b border-border">
              Multi-Agent Coordination<V3Badge />
            </h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              Multi-agent coordination defines how multiple AI agents share
              work within and across repositories using the shared task queue
              at{" "}
              <code className="font-mono text-accent-foreground bg-accent/10 px-1.5 py-0.5 rounded text-xs">
                .context/queue.md
              </code>
              .
            </p>
            <CodeBlock code={queueExample} language="markdown" filename=".context/queue.md" />

            <h3 className="text-lg font-semibold text-foreground mt-8 mb-3">Queue Protocol</h3>
            <ol className="list-decimal list-inside space-y-2 text-muted-foreground mb-6">
              <li>Agent creates task in Pending with clear steps</li>
              <li>Assigned agent starts -- moves to In Progress</li>
              <li>On completion -- fills Result, moves to Done</li>
              <li>Tasks older than 2 weeks -- move to Archive</li>
            </ol>

            <h3 className="text-lg font-semibold text-foreground mt-8 mb-3">Agent Contracts</h3>
            <p className="text-muted-foreground leading-relaxed mb-4">
              When agents depend on each other&apos;s output, the dependency
              is documented in both agent configs with a{" "}
              <code className="font-mono text-accent-foreground bg-accent/10 px-1 rounded text-xs">
                Format
              </code>{" "}
              column specifying the expected file pattern (new in v3).
            </p>
          </section>

          {/* Cross-Repo References */}
          <section id="cross-repo" className="mb-16">
            <h2 className="text-2xl font-bold text-foreground mb-4 pb-2 border-b border-border">
              Cross-Repository References<V3Badge />
            </h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              Cross-repo references define how projects link to and read from
              sibling repositories using a hub-and-spoke model.
            </p>
            <div className="rounded-lg border border-border bg-card p-4 text-sm text-muted-foreground mb-4">
              <p className="font-medium text-foreground mb-2">Hub-and-spoke model</p>
              <p>The strategy repo (hub) reads state from product repos (spokes). Product repos reference back for business context. Always use explicit relative paths.</p>
            </div>
            <ul className="list-disc list-inside space-y-2 text-muted-foreground">
              <li><strong className="text-foreground">Never duplicate</strong> company-wide context in product repos -- reference strategy</li>
              <li><strong className="text-foreground">Product repos are self-contained</strong> for development; cross-refs are for business context</li>
              <li><strong className="text-foreground">Strategy reads product state</strong>, not implementation code</li>
              <li><strong className="text-foreground">Use the repo registry</strong> (<code className="font-mono text-accent-foreground bg-accent/10 px-1 rounded text-xs">.context/docs/repo-registry.md</code>) as the master index</li>
            </ul>
          </section>

          {/* IP Safety */}
          <section id="ip-safety" className="mb-16">
            <h2 className="text-2xl font-bold text-foreground mb-4 pb-2 border-b border-border">
              IP Safety<V3Badge />
            </h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              IP safety defines pre-write verification checks that protect
              intellectual property from misattribution, accidental
              disclosure, and brand contamination.
            </p>
            <div className="overflow-x-auto mb-4">
              <table className="w-full text-sm border border-border rounded-lg overflow-hidden">
                <thead>
                  <tr className="bg-muted/50 border-b border-border">
                    <th className="text-left px-4 py-2 font-medium text-foreground">Check</th>
                    <th className="text-left px-4 py-2 font-medium text-foreground">Rule</th>
                  </tr>
                </thead>
                <tbody className="text-muted-foreground">
                  <tr className="border-b border-border"><td className="px-4 py-2 font-medium text-foreground">No misattribution</td><td className="px-4 py-2">IP is never attributed to another company</td></tr>
                  <tr className="border-b border-border"><td className="px-4 py-2 font-medium text-foreground">No AI co-author</td><td className="px-4 py-2">No AI co-author credits in commits</td></tr>
                  <tr className="border-b border-border"><td className="px-4 py-2 font-medium text-foreground">No leaked secrets</td><td className="px-4 py-2">No API keys, tokens, passwords, or credentials</td></tr>
                  <tr className="border-b border-border"><td className="px-4 py-2 font-medium text-foreground">No internal paths</td><td className="px-4 py-2">No absolute local filesystem paths in public content</td></tr>
                  <tr><td className="px-4 py-2 font-medium text-foreground">No competitor branding</td><td className="px-4 py-2">Materials never carry competitor branding</td></tr>
                </tbody>
              </table>
            </div>
            <p className="text-muted-foreground leading-relaxed">
              Configure in surfcontext.json under the{" "}
              <code className="font-mono text-accent-foreground bg-accent/10 px-1 rounded text-xs">
                ipSafety
              </code>{" "}
              block. Tools implementing ARDS should read this and enforce
              rules during file writes and pre-commit checks.
            </p>
          </section>

          {/* MCP Integration */}
          <section id="mcp-integration" className="mb-16">
            <h2 className="text-2xl font-bold text-foreground mb-4 pb-2 border-b border-border">
              MCP Integration<V3Badge />
            </h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              The Model Context Protocol (MCP) provides a standard way for AI
              agents to access tools and data. ARDS defines how{" "}
              <code className="font-mono text-accent-foreground bg-accent/10 px-1 rounded text-xs">
                .context/
              </code>{" "}
              content can be exposed as MCP tools.
            </p>
            <div className="rounded-lg border border-border bg-card p-4 text-sm text-muted-foreground mb-4">
              <p className="font-medium text-foreground mb-2">MCP and ARDS are complementary</p>
              <p><strong className="text-foreground">MCP</strong> = what agents CAN DO (tools, actions, data access)</p>
              <p><strong className="text-foreground">ARDS</strong> = what agents SHOULD KNOW (documentation, context, navigation)</p>
            </div>

            <h3 className="text-lg font-semibold text-foreground mt-8 mb-3">Standard Tool Names</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm border border-border rounded-lg overflow-hidden">
                <thead>
                  <tr className="bg-muted/50 border-b border-border">
                    <th className="text-left px-4 py-2 font-medium text-foreground">Tool Name</th>
                    <th className="text-left px-4 py-2 font-medium text-foreground">Returns</th>
                  </tr>
                </thead>
                <tbody className="text-muted-foreground">
                  {[
                    ["surfcontext_read_context", "CONTEXT.md content"],
                    ["surfcontext_list_agents", "Agent names + descriptions"],
                    ["surfcontext_read_agent", "Full agent definition"],
                    ["surfcontext_list_docs", "Doc names + last-updated dates"],
                    ["surfcontext_read_doc", "Full doc content"],
                    ["surfcontext_list_guides", "Guide names + confidence levels"],
                    ["surfcontext_read_guide", "Full guide content"],
                    ["surfcontext_list_plans", "Plan titles + dates + status"],
                    ["surfcontext_read_plan", "Full plan content"],
                    ["surfcontext_search", "Matching excerpts with paths"],
                  ].map(([name, returns], i, arr) => (
                    <tr key={name} className={i < arr.length - 1 ? "border-b border-border" : ""}>
                      <td className="px-4 py-2 font-mono text-xs text-accent-foreground">{name}</td>
                      <td className="px-4 py-2">{returns}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          {/* Context Budget Management */}
          <section id="context-budget" className="mb-16">
            <h2 className="text-2xl font-bold text-foreground mb-4 pb-2 border-b border-border">
              Context Budget Management<V3Badge />
            </h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              Context budget management treats the AI agent&apos;s context window
              as a finite computational resource that must be allocated
              deliberately.
            </p>
            <div className="overflow-x-auto mb-4">
              <table className="w-full text-sm border border-border rounded-lg overflow-hidden">
                <thead>
                  <tr className="bg-muted/50 border-b border-border">
                    <th className="text-left px-4 py-2 font-medium text-foreground">Content Class</th>
                    <th className="text-left px-4 py-2 font-medium text-foreground">Budget Share</th>
                    <th className="text-left px-4 py-2 font-medium text-foreground">Loading Strategy</th>
                  </tr>
                </thead>
                <tbody className="text-muted-foreground">
                  <tr className="border-b border-border"><td className="px-4 py-2">System prompt + CONTEXT.md</td><td className="px-4 py-2 font-mono text-xs">5-10%</td><td className="px-4 py-2">Always loaded</td></tr>
                  <tr className="border-b border-border"><td className="px-4 py-2">Active working files</td><td className="px-4 py-2 font-mono text-xs">30-50%</td><td className="px-4 py-2">Loaded for current task</td></tr>
                  <tr className="border-b border-border"><td className="px-4 py-2">Reference docs + guides</td><td className="px-4 py-2 font-mono text-xs">10-20%</td><td className="px-4 py-2">On demand</td></tr>
                  <tr className="border-b border-border"><td className="px-4 py-2">Agent/skill definitions</td><td className="px-4 py-2 font-mono text-xs">5-10%</td><td className="px-4 py-2">On dispatch</td></tr>
                  <tr><td className="px-4 py-2">Conversation history</td><td className="px-4 py-2 font-mono text-xs">20-30%</td><td className="px-4 py-2">Managed by platform</td></tr>
                </tbody>
              </table>
            </div>

            <h3 className="text-lg font-semibold text-foreground mt-8 mb-3">Progressive Disclosure Protocol</h3>
            <ol className="list-decimal list-inside space-y-2 text-muted-foreground">
              <li><strong className="text-foreground">Load CONTEXT.md</strong> -- provides the map</li>
              <li><strong className="text-foreground">Identify needed docs</strong> -- from key files table and task requirements</li>
              <li><strong className="text-foreground">Load only relevant docs/guides</strong> -- not the entire .context/ directory</li>
              <li><strong className="text-foreground">Checkpoint when long</strong> -- save state before context fills</li>
              <li><strong className="text-foreground">Prune completed context</strong> -- when a subtask finishes, its context can be released</li>
            </ol>
          </section>

          {/* Token Budget Guidance */}
          <section id="token-budget" className="mb-16">
            <h2 className="text-2xl font-bold text-foreground mb-4 pb-2 border-b border-border">
              Token Budget Guidance
            </h2>
            <div className="overflow-x-auto mb-4">
              <table className="w-full text-sm border border-border rounded-lg overflow-hidden">
                <thead>
                  <tr className="bg-muted/50 border-b border-border">
                    <th className="text-left px-4 py-2 font-medium text-foreground">Content</th>
                    <th className="text-left px-4 py-2 font-medium text-foreground">Lines</th>
                    <th className="text-left px-4 py-2 font-medium text-foreground">Tokens</th>
                    <th className="text-left px-4 py-2 font-medium text-foreground">30-Turn Cost</th>
                  </tr>
                </thead>
                <tbody className="text-muted-foreground">
                  {[
                    ["CONTEXT.md (200 lines)", "200", "~800", "~24,000"],
                    ["CONTEXT.md (300 lines)", "300", "~1,200", "~36,000"],
                    ["Agent config", "100", "~400", "~400 (once)"],
                    ["Knowledge doc", "150", "~600", "~600 (once)"],
                    ["Guide", "200", "~800", "~800 (once)"],
                    ["Plan doc", "200", "~800", "~800 (once)"],
                  ].map(([content, lines, tokens, cost], i, arr) => (
                    <tr key={content} className={i < arr.length - 1 ? "border-b border-border" : ""}>
                      <td className="px-4 py-2">{content}</td>
                      <td className="px-4 py-2 font-mono text-xs">{lines}</td>
                      <td className="px-4 py-2 font-mono text-xs">{tokens}</td>
                      <td className="px-4 py-2 font-mono text-xs">{cost}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <h3 className="text-lg font-semibold text-foreground mt-8 mb-3">Optimization Strategies</h3>
            <ul className="list-disc list-inside space-y-2 text-muted-foreground">
              <li><strong className="text-foreground">Move rarely-needed content</strong> to .context/docs/. If agents read it &lt; 20% of sessions, extract from CONTEXT.md.</li>
              <li><strong className="text-foreground">Use tables over prose.</strong> A 3-column table conveys the same info at ~1/3 the tokens.</li>
              <li><strong className="text-foreground">Link, don&apos;t summarize.</strong> Path + one-line description, not a summary.</li>
              <li><strong className="text-foreground">Prune Active Work.</strong> Remove completed items from CONTEXT.md.</li>
            </ul>
          </section>

          {/* Platform Compatibility */}
          <section id="platform-compatibility" className="mb-16">
            <h2 className="text-2xl font-bold text-foreground mb-4 pb-2 border-b border-border">
              Platform Compatibility
            </h2>
            <div className="space-y-4">
              {[
                { name: "CLAUDE.md", details: "Auto-loaded every turn. Agents dispatched from .claude/agents/ by description match. Skills invoked by /command." },
                { name: "AGENTS.md", details: "Read as project context on start. Supports Agent Skills (SKILL.md). PLANS.md for multi-step problems." },
                { name: ".cursorrules", details: ".cursor/rules/*.mdc with YAML frontmatter and glob scoping. Rules scoped to file patterns." },
                { name: "copilot-instructions.md", details: ".github/copilot-instructions.md (workspace-wide). .github/instructions/*.instructions.md (path-specific with applyTo)." },
                { name: ".windsurfrules", details: ".windsurfrules at repo root. Single context file." },
              ].map((p) => (
                <div key={p.name} className="rounded-lg border border-border bg-card p-4">
                  <p className="font-semibold text-foreground mb-1 font-mono text-sm">{p.name}</p>
                  <p className="text-sm text-muted-foreground">{p.details}</p>
                </div>
              ))}
            </div>
          </section>

          {/* ARDS as Superset */}
          <section id="ards-superset" className="mb-16">
            <h2 className="text-2xl font-bold text-foreground mb-4 pb-2 border-b border-border">
              ARDS as Superset
            </h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              ARDS is not competing with AGENTS.md, Agent Skills, or MCP. It
              is a superset that defines the full documentation architecture
              and generates files for every other format.
            </p>
            <div className="overflow-x-auto">
              <table className="w-full text-sm border border-border rounded-lg overflow-hidden">
                <thead>
                  <tr className="bg-muted/50 border-b border-border">
                    <th className="text-left px-4 py-2 font-medium text-foreground">Standard</th>
                    <th className="text-left px-4 py-2 font-medium text-foreground">Covers</th>
                    <th className="text-left px-4 py-2 font-medium text-foreground">ARDS Relationship</th>
                  </tr>
                </thead>
                <tbody className="text-muted-foreground">
                  {[
                    ["AGENTS.md (AAIF)", "Single root context", "Maps to ARDS Root Context"],
                    ["Agent Skills", "Cross-platform skills", "Maps to ARDS Skill Configs"],
                    ["MCP", "Agent tool access", "Orthogonal: MCP = tools, ARDS = knowledge"],
                    ["PLANS.md", "Problem-solving context", "Maps to ARDS Plan Docs"],
                    ["llms.txt", "LLM-readable site summary", "Orthogonal: site-level, not repo-level"],
                  ].map(([standard, covers, rel], i, arr) => (
                    <tr key={standard} className={i < arr.length - 1 ? "border-b border-border" : ""}>
                      <td className="px-4 py-2 font-medium text-foreground">{standard}</td>
                      <td className="px-4 py-2">{covers}</td>
                      <td className="px-4 py-2">{rel}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          {/* Quality Scoring */}
          <section id="quality-scoring" className="mb-16">
            <h2 className="text-2xl font-bold text-foreground mb-4 pb-2 border-b border-border">
              Quality Scoring
            </h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              Each dimension scores 0-3 (0 = missing, 1 = minimal, 2 = partial, 3 = fully compliant).
              Total: up to 99 points for a command center with all optional features.
            </p>
            <div className="space-y-6">
              {[
                { category: "CONTEXT.md", max: 27, items: ["Exists at repo root", "Under line limit", "Key Files table", "Architecture section", "Stack section", "Development section", "Active Work section", "Cross-Repo section", "Agents section"] },
                { category: "Agent Coverage", max: 21, items: ["Count appropriate", "YAML frontmatter complete", "Descriptions action-oriented", "No overlapping scope", "Tools appropriate", "Output locations specified", "Model selection justified"] },
                { category: "Knowledge Docs", max: 15, items: ["Directory exists", "Standard docs present", "All docs have dates", "No doc exceeds 400 lines", "Content is evergreen"] },
                { category: "Guides (v3)", max: 12, items: ["Directory exists", "Guides have confidence levels", "Guides have table of contents", "Gotcha callouts use standard format"] },
                { category: "Plans", max: 12, items: ["YYYY-MM-DD naming", "Header metadata", "Category subdirectories", "Active plans in CONTEXT.md"] },
              ].map((s) => (
                <div key={s.category} className="rounded-lg border border-border bg-card p-4">
                  <div className="flex items-center justify-between mb-2">
                    <p className="font-semibold text-foreground">{s.category}</p>
                    <span className="text-xs font-mono text-muted-foreground">max {s.max}</span>
                  </div>
                  <ul className="space-y-1">
                    {s.items.map((item) => (
                      <li key={item} className="text-sm text-muted-foreground flex items-center gap-2">
                        <span className="w-1 h-1 rounded-full bg-muted-foreground shrink-0" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
            <div className="mt-4 overflow-x-auto">
              <table className="w-full text-sm border border-border rounded-lg overflow-hidden">
                <thead>
                  <tr className="bg-muted/50 border-b border-border">
                    <th className="text-left px-4 py-2 font-medium text-foreground">Range</th>
                    <th className="text-left px-4 py-2 font-medium text-foreground">Rating</th>
                  </tr>
                </thead>
                <tbody className="text-muted-foreground">
                  <tr className="border-b border-border"><td className="px-4 py-2 font-mono text-xs">85-99</td><td className="px-4 py-2 text-green-500 font-medium">Excellent</td></tr>
                  <tr className="border-b border-border"><td className="px-4 py-2 font-mono text-xs">65-84</td><td className="px-4 py-2 text-blue-500 font-medium">Good</td></tr>
                  <tr className="border-b border-border"><td className="px-4 py-2 font-mono text-xs">45-64</td><td className="px-4 py-2 text-yellow-500 font-medium">Fair</td></tr>
                  <tr className="border-b border-border"><td className="px-4 py-2 font-mono text-xs">25-44</td><td className="px-4 py-2 text-orange-500 font-medium">Poor</td></tr>
                  <tr><td className="px-4 py-2 font-mono text-xs">0-24</td><td className="px-4 py-2 text-red-500 font-medium">Non-compliant</td></tr>
                </tbody>
              </table>
            </div>
          </section>

          {/* Freshness Monitoring */}
          <section id="freshness" className="mb-16">
            <h2 className="text-2xl font-bold text-foreground mb-4 pb-2 border-b border-border">
              Freshness Monitoring
            </h2>
            <div className="overflow-x-auto">
              <table className="w-full text-sm border border-border rounded-lg overflow-hidden">
                <thead>
                  <tr className="bg-muted/50 border-b border-border">
                    <th className="text-left px-4 py-2 font-medium text-foreground">Document Type</th>
                    <th className="text-left px-4 py-2 font-medium text-foreground">Threshold</th>
                    <th className="text-left px-4 py-2 font-medium text-foreground">Action</th>
                  </tr>
                </thead>
                <tbody className="text-muted-foreground">
                  {[
                    ["CONTEXT.md", "7 days", "Review Active Work; prune completed items"],
                    ["Agent Config", "30 days", "Verify scope, tools, model still match"],
                    ["Knowledge Doc", "30 days", "Update or add [STALE] warning"],
                    ["Guide", "30 days", "Review confidence; flag for re-validation"],
                    ["Plan Doc", "N/A", "Mark as Superseded when replaced"],
                    ["Checkpoint", "N/A", "Time-stamped by design"],
                    ["Research Doc", "60 days", "Flag for author review"],
                  ].map(([type, threshold, action], i, arr) => (
                    <tr key={type} className={i < arr.length - 1 ? "border-b border-border" : ""}>
                      <td className="px-4 py-2 font-medium text-foreground">{type}</td>
                      <td className="px-4 py-2 font-mono text-xs">{threshold}</td>
                      <td className="px-4 py-2">{action}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          {/* Migration Guide */}
          <section id="migration" className="mb-16">
            <h2 className="text-2xl font-bold text-foreground mb-4 pb-2 border-b border-border">
              Migration Guide
            </h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              All v3 additions are optional. A valid v2 project is already a
              valid v3 project.
            </p>
            <h3 className="text-lg font-semibold text-foreground mt-8 mb-3">v2.0 to v3.0</h3>
            <ol className="list-decimal list-inside space-y-3 text-muted-foreground">
              <li><strong className="text-foreground">Update surfcontext.json</strong> -- bump <code className="font-mono text-accent-foreground bg-accent/10 px-1 rounded text-xs">version</code> to <code className="font-mono text-accent-foreground bg-accent/10 px-1 rounded text-xs">&quot;3.0&quot;</code>, add new fields (<code className="font-mono text-accent-foreground bg-accent/10 px-1 rounded text-xs">guidesDir</code>, <code className="font-mono text-accent-foreground bg-accent/10 px-1 rounded text-xs">checkpointsDir</code>, <code className="font-mono text-accent-foreground bg-accent/10 px-1 rounded text-xs">discoveryOrder</code>, <code className="font-mono text-accent-foreground bg-accent/10 px-1 rounded text-xs">ipSafety</code>, <code className="font-mono text-accent-foreground bg-accent/10 px-1 rounded text-xs">mcp</code>)</li>
              <li><strong className="text-foreground">Create .context/guides/</strong> -- move or create living how-to documents with confidence levels and gotcha callouts</li>
              <li><strong className="text-foreground">Create checkpoint directory</strong> -- start writing session checkpoints to plans/sessions/</li>
              <li><strong className="text-foreground">Add claim tags</strong> -- tag claims in strategic documents with [verified], [unverified], [assumption], [internal estimate]</li>
              <li><strong className="text-foreground">Add discovery order</strong> -- document your project&apos;s discovery order in surfcontext.json</li>
              <li><strong className="text-foreground">Configure IP safety</strong> -- add ipSafety block to surfcontext.json if relevant</li>
              <li><strong className="text-foreground">Add agent contracts</strong> -- include Format column in Cross-Agent Coordination tables</li>
            </ol>

            <h3 className="text-lg font-semibold text-foreground mt-8 mb-3">From platform-specific to ARDS</h3>
            <ol className="list-decimal list-inside space-y-2 text-muted-foreground">
              <li>Create <code className="font-mono text-accent-foreground bg-accent/10 px-1 rounded text-xs">.context/</code> with <code className="font-mono text-accent-foreground bg-accent/10 px-1 rounded text-xs">agents/</code> and <code className="font-mono text-accent-foreground bg-accent/10 px-1 rounded text-xs">docs/</code></li>
              <li>Write <code className="font-mono text-accent-foreground bg-accent/10 px-1 rounded text-xs">CONTEXT.md</code> from existing root context</li>
              <li>Move agent/doc files to <code className="font-mono text-accent-foreground bg-accent/10 px-1 rounded text-xs">.context/</code></li>
              <li>Create <code className="font-mono text-accent-foreground bg-accent/10 px-1 rounded text-xs">surfcontext.json</code></li>
              <li>Set up generation (symlinks or sync script)</li>
              <li>Test platform-specific tool still works</li>
            </ol>
          </section>

          {/* Versioning footer */}
          <section className="rounded-lg border border-border bg-muted/30 p-6">
            <h2 className="text-lg font-bold text-foreground mb-3">Versioning</h2>
            <p className="text-sm text-muted-foreground leading-relaxed mb-3">
              The SurfContext specification follows{" "}
              <a href="https://semver.org" target="_blank" rel="noopener noreferrer" className="text-accent-foreground hover:underline">
                Semantic Versioning
              </a>
              . The current version is <strong className="text-foreground">3.0</strong>.
            </p>
            <ul className="list-disc list-inside space-y-2 text-sm text-muted-foreground">
              <li><strong className="text-foreground">v3.0</strong> (2026-02-10) -- 9 new sections: guides, checkpoints, evidence, discovery order, multi-agent, cross-repo, IP safety, MCP, context budget</li>
              <li><strong className="text-foreground">v2.0</strong> (2026-01-31) -- Skills, research docs, expanded taxonomy, scoring rubric, freshness monitoring</li>
              <li><strong className="text-foreground">v1.0</strong> (2026-01-15) -- Initial specification: CONTEXT.md, agents, docs, plans</li>
            </ul>
          </section>
        </article>
      </div>
    </div>
  );
}
