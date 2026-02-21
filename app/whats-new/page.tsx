"use client";

import Link from "next/link";
import {
  BookOpen,
  ArrowDown,
  ArrowRight,
  CheckCircle2,
  Circle,
  Clock,
  FileText,
  Shield,
  Layers,
  Users,
  GitBranch,
  Eye,
  Cpu,
  Plug,
  BookMarked,
} from "lucide-react";

// --- v3 Contributions ---
const v3Contributions = [
  { name: "Living Guides", icon: "book", color: "#22c55e", desc: "How-to docs with confidence levels and gotcha callouts that grow with each implementation.", location: ".context/guides/" },
  { name: "Session Checkpoints", icon: "clock", color: "#3b82f6", desc: "Structured handoff protocol for context boundary crossings -- conversation ends, agent swaps, machine switches.", location: "plans/sessions/" },
  { name: "Evidence Epistemology", icon: "eye", color: "#f59e0b", desc: "4-tier claim tagging, evidence hierarchy, bias ledger. Prevents strategy built on unverified claims.", location: "Inline tags" },
  { name: "IP Safety", icon: "shield", color: "#ef4444", desc: "Pre-write verification checks -- no misattribution, no AI co-author, no leaked secrets, no internal paths.", location: "surfcontext.json" },
  { name: "Context Budget Management", icon: "cpu", color: "#a855f7", desc: "Treats context window as finite computational resource. Budget allocation and progressive disclosure.", location: "Spec Section 19" },
  { name: "Multi-Agent Coordination", icon: "users", color: "#ec4899", desc: "Task queue format, agent contracts, cross-agent handoff, parallel execution rules.", location: ".context/queue.md" },
  { name: "Cross-Repo References", icon: "git", color: "#06b6d4", desc: "Hub-and-spoke model with repo registry, explicit relative paths, no-duplication rules.", location: "repo-registry.md" },
  { name: "Discovery Order", icon: "layers", color: "#8b5cf6", desc: "Formalized 10-step navigation sequence with token-aware loading strategy.", location: "surfcontext.json" },
  { name: "MCP Integration", icon: "plug", color: "#14b8a6", desc: "Standard tool names for exposing .context/ content as MCP tools. Bridges knowledge to capabilities.", location: "surfcontext.json" },
];

// --- Discovery Order ---
const discoverySteps = [
  { step: 1, path: "CONTEXT.md", loading: "Always", purpose: "Project identity, key files, architecture, active state", tokens: "~800/turn" },
  { step: 2, path: "surfcontext.json", loading: "Always", purpose: "Machine-readable config, platform targets, discovery hints", tokens: "~200" },
  { step: 3, path: ".context/docs/", loading: "On demand", purpose: "Evergreen knowledge -- architecture, conventions, schemas", tokens: "~600 each" },
  { step: 4, path: ".context/guides/", loading: "On demand", purpose: "Living how-to documents -- patterns, gotchas", tokens: "~800 each" },
  { step: 5, path: ".context/agents/", loading: "On dispatch", purpose: "Agent definitions -- only the dispatched agent", tokens: "~400" },
  { step: 6, path: ".context/skills/", loading: "On invoke", purpose: "Skill definitions -- progressive disclosure", tokens: "~400" },
  { step: 7, path: ".context/queue.md", loading: "On request", purpose: "Multi-agent task queue", tokens: "~300" },
  { step: 8, path: "plans/", loading: "On demand", purpose: "Time-stamped work -- glob for relevant files", tokens: "~800 each" },
  { step: 9, path: "research/", loading: "On demand", purpose: "Academic manuscripts", tokens: "~800 each" },
  { step: 10, path: "Source code", loading: "On demand", purpose: "Follow architecture guidelines from CONTEXT.md", tokens: "varies" },
];

// --- Document Types ---
const docTypes = [
  { type: "Root Context", location: "CONTEXT.md", purpose: "Project identity and map", mutability: "Updated weekly", readFreq: "Every turn", color: "#3b82f6" },
  { type: "Agent Config", location: ".context/agents/*.md", purpose: "Specialist persona definitions", mutability: "Stable", readFreq: "On dispatch", color: "#a855f7" },
  { type: "Skill Config", location: ".context/skills/*/SKILL.md", purpose: "Reusable expertise", mutability: "Stable", readFreq: "On invocation", color: "#ec4899" },
  { type: "Knowledge Doc", location: ".context/docs/*.md", purpose: "Evergreen reference", mutability: "Updated on change", readFreq: "On demand", color: "#f59e0b" },
  { type: "Guide", location: ".context/guides/*.md", purpose: "Living how-to procedures", mutability: "Living (grows)", readFreq: "On demand", color: "#22c55e" },
  { type: "Plan Doc", location: "plans/**/*.md", purpose: "Time-stamped deliverables", mutability: "Immutable", readFreq: "On demand", color: "#06b6d4" },
  { type: "Research Doc", location: "research/**/*", purpose: "Academic manuscripts", mutability: "Versioned", readFreq: "On demand", color: "#8b5cf6" },
];

// --- Competitor Comparison ---
const comparison = [
  { feature: "Root context file", ards: true, agents_md: true, claude_md: true, cursor: false, copilot: true, gemini: true },
  { feature: "Agent definitions", ards: true, agents_md: false, claude_md: true, cursor: false, copilot: false, gemini: false },
  { feature: "Skill/rule definitions", ards: true, agents_md: false, claude_md: true, cursor: true, copilot: true, gemini: false },
  { feature: "Knowledge doc hierarchy", ards: true, agents_md: false, claude_md: false, cursor: false, copilot: false, gemini: false },
  { feature: "Living guides", ards: true, agents_md: false, claude_md: false, cursor: false, copilot: false, gemini: false },
  { feature: "Session checkpoints", ards: true, agents_md: false, claude_md: false, cursor: false, copilot: false, gemini: false },
  { feature: "Cross-repo references", ards: true, agents_md: false, claude_md: false, cursor: false, copilot: false, gemini: false },
  { feature: "Evidence epistemology", ards: true, agents_md: false, claude_md: false, cursor: false, copilot: false, gemini: false },
  { feature: "IP safety rules", ards: true, agents_md: false, claude_md: false, cursor: false, copilot: false, gemini: false },
  { feature: "Token budget guidance", ards: true, agents_md: false, claude_md: false, cursor: false, copilot: false, gemini: false },
  { feature: "Discovery order", ards: true, agents_md: false, claude_md: false, cursor: false, copilot: false, gemini: true },
  { feature: "Quality scoring rubric", ards: true, agents_md: false, claude_md: false, cursor: false, copilot: false, gemini: false },
  { feature: "Multi-platform generation", ards: true, agents_md: false, claude_md: false, cursor: false, copilot: false, gemini: false },
  { feature: "Machine-readable config", ards: true, agents_md: false, claude_md: false, cursor: true, copilot: false, gemini: true },
];

// --- Superset mapping ---
const supersetItems = [
  { label: "Root Context", maps: "AGENTS.md, CLAUDE.md, copilot-instructions.md", color: "#3b82f6", unique: false },
  { label: "Agents / Skills", maps: "Agent Skills (SKILL.md), .cursor/rules/*.mdc", color: "#a855f7", unique: false },
  { label: "Knowledge Docs", maps: "unique to ARDS", color: "#f59e0b", unique: true },
  { label: "Living Guides", maps: "unique to ARDS", color: "#22c55e", unique: true },
  { label: "Plan Docs", maps: "PLANS.md", color: "#06b6d4", unique: false },
  { label: "Research Docs", maps: "unique to ARDS", color: "#8b5cf6", unique: true },
  { label: "Session Checkpoints", maps: "unique to ARDS", color: "#3b82f6", unique: true },
  { label: "Cross-Repo Refs", maps: "unique to ARDS", color: "#06b6d4", unique: true },
  { label: "Evidence System", maps: "unique to ARDS", color: "#f59e0b", unique: true },
  { label: "IP Safety", maps: "unique to ARDS", color: "#ef4444", unique: true },
  { label: "MCP Integration", maps: "bridges ARDS content to MCP tools", color: "#14b8a6", unique: false },
];

function ContributionIcon({ icon, color }: { icon: string; color: string }) {
  const props = { size: 18, style: { color } };
  switch (icon) {
    case "book": return <BookMarked {...props} />;
    case "clock": return <Clock {...props} />;
    case "eye": return <Eye {...props} />;
    case "shield": return <Shield {...props} />;
    case "cpu": return <Cpu {...props} />;
    case "users": return <Users {...props} />;
    case "git": return <GitBranch {...props} />;
    case "layers": return <Layers {...props} />;
    case "plug": return <Plug {...props} />;
    default: return <FileText {...props} />;
  }
}

function Check() {
  return <CheckCircle2 size={14} className="text-green-500 mx-auto" />;
}

function Dash() {
  return <span className="text-muted-foreground block text-center">&mdash;</span>;
}

export default function WhatsNewPage() {
  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-accent/5 to-transparent pointer-events-none" />
        <div className="mx-auto max-w-6xl px-4 sm:px-6 pt-20 pb-16 sm:pt-28 sm:pb-24">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-border bg-muted/50 px-3 py-1 text-xs font-mono text-muted-foreground mb-6">
              <span className="inline-block w-1.5 h-1.5 rounded-full bg-green-500" />
              ARDS v3.0 &mdash; February 2026
            </div>

            <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-foreground leading-[1.1] mb-6">
              What&apos;s new in{" "}
              <span className="text-accent-foreground">ARDS v3.0</span>
            </h1>

            <p className="text-lg text-muted-foreground leading-relaxed mb-4 max-w-2xl">
              Nine new capabilities for structuring AI-agent-ready repositories.
              Living guides, session checkpoints, evidence epistemology, IP safety,
              context budget management, and more.
            </p>

            <p className="text-sm text-muted-foreground mb-8">
              All v3 additions are <strong className="text-foreground">backward-compatible</strong>.
              A valid v2 project is already a valid v3 project.
            </p>

            <div className="flex flex-wrap gap-3">
              <Link
                href="/spec"
                className="inline-flex items-center justify-center rounded-lg bg-primary text-primary-foreground px-5 py-2.5 text-sm font-medium hover:bg-primary/90 transition-colors"
              >
                Read the Full Spec
              </Link>
              <Link
                href="/getting-started"
                className="inline-flex items-center justify-center rounded-lg border border-border text-foreground px-5 py-2.5 text-sm font-medium hover:bg-muted transition-colors"
              >
                Quick Start
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="border-t border-border bg-muted/20">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 py-12">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {[
              { label: "Spec Lines", value: "1,398", color: "#3b82f6" },
              { label: "Sections", value: "27", color: "#a855f7" },
              { label: "New in v3", value: "9", color: "#22c55e" },
              { label: "Doc Types", value: "7", color: "#f59e0b" },
              { label: "Platforms", value: "6+", color: "#ec4899" },
              { label: "OSS Files", value: "17", color: "#06b6d4" },
            ].map((s) => (
              <div
                key={s.label}
                className="rounded-lg border border-border bg-card p-3 text-center"
              >
                <div className="text-2xl font-bold" style={{ color: s.color }}>{s.value}</div>
                <div className="text-xs text-muted-foreground uppercase tracking-wide mt-1">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 9 Contributions */}
      <section className="border-t border-border">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 py-16 sm:py-24">
          <div className="text-center mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-4">
              9 new capabilities
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Each addresses a real problem discovered in 3+ months of daily production use
              across 15 repositories with 54 AI agents.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {v3Contributions.map((c) => (
              <div
                key={c.name}
                className="rounded-xl border bg-card p-5 transition-colors hover:border-accent/30"
                style={{ borderColor: `${c.color}30` }}
              >
                <div className="flex items-center gap-3 mb-3">
                  <div
                    className="flex items-center justify-center w-9 h-9 rounded-lg"
                    style={{ background: `${c.color}15` }}
                  >
                    <ContributionIcon icon={c.icon} color={c.color} />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-foreground">{c.name}</h3>
                    <span className="text-[10px] font-mono text-muted-foreground">{c.location}</span>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed">{c.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Document Types */}
      <section className="border-t border-border bg-muted/20">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 py-16 sm:py-24">
          <div className="text-center mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-4">
              7 document types
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Each type has a distinct purpose, mutability pattern, and read frequency.
              Agents load them at different times to optimize context window usage.
            </p>
          </div>

          <div className="max-w-4xl mx-auto">
            <div className="rounded-lg border border-border overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border bg-muted/50">
                    <th className="text-left px-4 py-3 font-medium text-foreground">Type</th>
                    <th className="text-left px-4 py-3 font-medium text-foreground">Location</th>
                    <th className="text-left px-4 py-3 font-medium text-foreground hidden sm:table-cell">Mutability</th>
                    <th className="text-left px-4 py-3 font-medium text-foreground">Read Frequency</th>
                  </tr>
                </thead>
                <tbody>
                  {docTypes.map((d, i) => (
                    <tr key={d.type} className={i < docTypes.length - 1 ? "border-b border-border" : ""}>
                      <td className="px-4 py-3">
                        <span className="flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full shrink-0" style={{ background: d.color }} />
                          <span className="font-medium text-foreground text-sm">{d.type}</span>
                        </span>
                      </td>
                      <td className="px-4 py-3 font-mono text-xs text-muted-foreground">{d.location}</td>
                      <td className="px-4 py-3 text-sm text-muted-foreground hidden sm:table-cell">{d.mutability}</td>
                      <td className="px-4 py-3">
                        <span
                          className="inline-flex items-center text-xs font-medium px-2 py-0.5 rounded-full"
                          style={{
                            background: d.readFreq === "Every turn" ? "rgb(34 197 94 / 0.1)" : "rgb(107 114 128 / 0.1)",
                            color: d.readFreq === "Every turn" ? "#22c55e" : "var(--muted-foreground)",
                          }}
                        >
                          {d.readFreq}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </section>

      {/* Discovery Order */}
      <section className="border-t border-border">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 py-16 sm:py-24">
          <div className="text-center mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-4">
              Formalized discovery order
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              A 10-step sequence agents follow to navigate any ARDS-compliant repository.
              Token-aware loading minimizes context window waste.
            </p>
          </div>

          <div className="max-w-3xl mx-auto space-y-1.5">
            {discoverySteps.map((s, i) => (
              <div key={s.step}>
                <div className="flex items-center gap-3 rounded-lg border border-border bg-card px-4 py-3">
                  <span className="flex items-center justify-center w-7 h-7 rounded-full bg-accent/10 text-accent-foreground text-xs font-bold font-mono shrink-0">
                    {s.step}
                  </span>
                  <span className="text-sm font-mono font-semibold text-accent-foreground min-w-[160px]">{s.path}</span>
                  <span
                    className="text-xs font-medium px-2 py-0.5 rounded-full shrink-0"
                    style={{
                      background: s.loading === "Always" ? "rgb(34 197 94 / 0.1)" : s.loading === "On dispatch" || s.loading === "On invoke" ? "rgb(168 85 247 / 0.1)" : "rgb(107 114 128 / 0.1)",
                      color: s.loading === "Always" ? "#22c55e" : s.loading === "On dispatch" || s.loading === "On invoke" ? "#a855f7" : "var(--muted-foreground)",
                    }}
                  >
                    {s.loading}
                  </span>
                  <span className="text-sm text-muted-foreground flex-1 hidden md:block">{s.purpose}</span>
                  <span className="text-xs font-mono text-muted-foreground shrink-0 hidden sm:block">{s.tokens}</span>
                </div>
                {i < discoverySteps.length - 1 && (
                  <div className="flex justify-start pl-7 py-0.5">
                    <ArrowDown size={12} className="text-muted-foreground" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Comparison Matrix */}
      <section className="border-t border-border bg-muted/20">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 py-16 sm:py-24">
          <div className="text-center mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-4">
              Feature comparison
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              ARDS is the only format covering the full documentation architecture.
              It generates files for every other format.
            </p>
          </div>

          <div className="max-w-5xl mx-auto overflow-x-auto">
            <div className="rounded-lg border border-border overflow-hidden min-w-[640px]">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border bg-muted/50">
                    <th className="text-left px-3 py-3 font-medium text-foreground min-w-[180px]">Feature</th>
                    <th className="text-center px-2 py-3 font-bold text-accent-foreground">ARDS</th>
                    <th className="text-center px-2 py-3 font-medium text-muted-foreground text-xs">AGENTS.md</th>
                    <th className="text-center px-2 py-3 font-medium text-muted-foreground text-xs">CLAUDE.md</th>
                    <th className="text-center px-2 py-3 font-medium text-muted-foreground text-xs">.cursorrules</th>
                    <th className="text-center px-2 py-3 font-medium text-muted-foreground text-xs">copilot-inst.</th>
                    <th className="text-center px-2 py-3 font-medium text-muted-foreground text-xs">.gemini</th>
                  </tr>
                </thead>
                <tbody>
                  {comparison.map((row, i) => (
                    <tr key={row.feature} className={i < comparison.length - 1 ? "border-b border-border" : ""}>
                      <td className="px-3 py-2 text-sm text-muted-foreground">{row.feature}</td>
                      <td className="px-2 py-2">{row.ards ? <Check /> : <Dash />}</td>
                      <td className="px-2 py-2">{row.agents_md ? <Check /> : <Dash />}</td>
                      <td className="px-2 py-2">{row.claude_md ? <Check /> : <Dash />}</td>
                      <td className="px-2 py-2">{row.cursor ? <Check /> : <Dash />}</td>
                      <td className="px-2 py-2">{row.copilot ? <Check /> : <Dash />}</td>
                      <td className="px-2 py-2">{row.gemini ? <Check /> : <Dash />}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </section>

      {/* ARDS as Superset */}
      <section className="border-t border-border">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 py-16 sm:py-24">
          <div className="text-center mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-4">
              ARDS as superset
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Not competing with existing formats. ARDS defines the full documentation
              architecture and generates platform-specific files from a single source.
            </p>
          </div>

          <div className="max-w-3xl mx-auto space-y-2">
            {supersetItems.map((item) => (
              <div
                key={item.label}
                className="flex items-center gap-3 rounded-lg px-4 py-3 border"
                style={{ background: `${item.color}05`, borderColor: `${item.color}20` }}
              >
                <span className="text-sm font-semibold min-w-[160px]" style={{ color: item.color }}>{item.label}</span>
                <ArrowRight size={14} className="text-muted-foreground shrink-0" />
                <span className="text-sm text-muted-foreground flex-1">{item.maps}</span>
                {item.unique && (
                  <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-green-500/10 text-green-500 shrink-0">
                    unique
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Backward Compatibility */}
      <section className="border-t border-border bg-muted/20">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 py-16 sm:py-24">
          <div className="text-center mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-4">
              Fully backward-compatible
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              All v3 additions are optional. A valid v2 project is already a valid v3 project.
              Adopt features incrementally.
            </p>
          </div>

          <div className="max-w-2xl mx-auto">
            <div className="space-y-3">
              {[
                { step: "1", title: "Bump version", desc: "Change version in surfcontext.json from \"2.0\" to \"3.0\"", time: "30 seconds" },
                { step: "2", title: "Add guides directory", desc: "Create .context/guides/ and add guidesDir to surfcontext.json", time: "2 minutes" },
                { step: "3", title: "Add discovery order", desc: "Document your project's navigation sequence in surfcontext.json", time: "1 minute" },
                { step: "4", title: "Start checkpointing", desc: "Write session checkpoints to plans/sessions/ when context gets long", time: "Ongoing" },
                { step: "5", title: "Tag evidence", desc: "Add [verified], [unverified], [assumption] tags to claims", time: "Ongoing" },
                { step: "6", title: "Configure IP safety", desc: "Add ipSafety block to surfcontext.json if relevant", time: "1 minute" },
              ].map((s) => (
                <div key={s.step} className="flex items-start gap-4 rounded-lg border border-border bg-card p-4">
                  <span className="flex items-center justify-center w-7 h-7 rounded-full bg-accent/10 text-accent-foreground text-xs font-bold font-mono shrink-0 mt-0.5">
                    {s.step}
                  </span>
                  <div className="flex-1">
                    <div className="flex items-center justify-between gap-3 mb-1">
                      <h3 className="text-sm font-semibold text-foreground">{s.title}</h3>
                      <span className="text-xs text-muted-foreground shrink-0">{s.time}</span>
                    </div>
                    <p className="text-sm text-muted-foreground">{s.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="border-t border-border">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 py-16 sm:py-24 text-center">
          <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-4">
            Ready to upgrade to v3?
          </h2>
          <p className="text-muted-foreground mb-8 max-w-lg mx-auto">
            All new features are opt-in. Start with a version bump and adopt
            capabilities as you need them.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <Link
              href="/getting-started"
              className="inline-flex items-center justify-center rounded-lg bg-primary text-primary-foreground px-5 py-2.5 text-sm font-medium hover:bg-primary/90 transition-colors"
            >
              Get Started
            </Link>
            <Link
              href="/spec"
              className="inline-flex items-center justify-center rounded-lg border border-border text-foreground px-5 py-2.5 text-sm font-medium hover:bg-muted transition-colors"
            >
              Full Specification
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
