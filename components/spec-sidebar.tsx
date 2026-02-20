"use client";

import { useEffect, useState } from "react";

interface TocItem {
  id: string;
  label: string;
  level: number;
}

const tocItems: TocItem[] = [
  { id: "overview", label: "Overview", level: 1 },
  { id: "design-principles", label: "Design Principles", level: 1 },
  { id: "file-hierarchy", label: "File Hierarchy", level: 1 },
  { id: "root-context", label: "Root Context (CONTEXT.md)", level: 1 },
  { id: "context-md-structure", label: "Structure", level: 2 },
  { id: "context-md-requirements", label: "Requirements", level: 2 },
  { id: "surfcontext-json", label: "surfcontext.json", level: 1 },
  { id: "surfcontext-schema", label: "Schema", level: 2 },
  { id: "surfcontext-fields", label: "Field Reference", level: 2 },
  { id: "agent-configs", label: "Agent Configurations", level: 1 },
  { id: "agent-format", label: "File Format", level: 2 },
  { id: "agent-fields", label: "Frontmatter Fields", level: 2 },
  { id: "skill-configs", label: "Skill Definitions", level: 1 },
  { id: "knowledge-docs", label: "Knowledge Documents", level: 1 },
  { id: "guides", label: "Guides", level: 1 },
  { id: "plan-docs", label: "Plan Documents", level: 1 },
  { id: "research-docs", label: "Research Documents", level: 1 },
  { id: "session-checkpoints", label: "Session Checkpoints", level: 1 },
  { id: "discovery-order", label: "Discovery Order", level: 1 },
  { id: "evidence-epistemology", label: "Evidence Epistemology", level: 1 },
  { id: "multi-agent", label: "Multi-Agent Coordination", level: 1 },
  { id: "cross-repo", label: "Cross-Repository References", level: 1 },
  { id: "ip-safety", label: "IP Safety", level: 1 },
  { id: "mcp-integration", label: "MCP Integration", level: 1 },
  { id: "context-budget", label: "Context Budget Management", level: 1 },
  { id: "token-budget", label: "Token Budget Guidance", level: 1 },
  { id: "platform-compatibility", label: "Platform Compatibility", level: 1 },
  { id: "ards-superset", label: "ARDS as Superset", level: 1 },
  { id: "quality-scoring", label: "Quality Scoring", level: 1 },
  { id: "freshness", label: "Freshness Monitoring", level: 1 },
  { id: "migration", label: "Migration Guide", level: 1 },
];

export function SpecSidebar() {
  const [activeId, setActiveId] = useState("");

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id);
          }
        }
      },
      { rootMargin: "-80px 0px -70% 0px", threshold: 0 }
    );

    for (const item of tocItems) {
      const el = document.getElementById(item.id);
      if (el) observer.observe(el);
    }

    return () => observer.disconnect();
  }, []);

  return (
    <nav className="hidden lg:block sticky top-20 w-56 shrink-0 max-h-[calc(100vh-6rem)] overflow-y-auto pr-4">
      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
        On this page
      </p>
      <ul className="space-y-1 text-sm border-l border-border">
        {tocItems.map((item) => (
          <li key={item.id}>
            <a
              href={`#${item.id}`}
              className={`block py-1 transition-colors border-l -ml-px ${
                item.level === 2 ? "pl-6" : "pl-3"
              } ${
                activeId === item.id
                  ? "border-accent-foreground text-accent-foreground font-medium"
                  : "border-transparent text-muted-foreground hover:text-foreground hover:border-border"
              }`}
            >
              {item.label}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
