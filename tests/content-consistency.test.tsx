import { describe, it, expect, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import { ThemeProvider } from "@/components/theme-provider";

// --- Helpers ---

afterEach(cleanup);

function wrap(ui: React.ReactElement) {
  return render(<ThemeProvider>{ui}</ThemeProvider>);
}

// ============================================================
// 1. Version "3.0" appears on every page that references it
// ============================================================

describe("version consistency", () => {
  it('home page references "v3.0"', async () => {
    const { default: Home } = await import("@/app/page");
    wrap(<Home />);
    const matches = screen.getAllByText(/v3\.0/);
    expect(matches.length).toBeGreaterThan(0);
  });

  it('spec page references "v3.0" in header and versioning section', async () => {
    const { default: SpecPage } = await import("@/app/spec/page");
    const { container } = wrap(<SpecPage />);
    // Multiple v3.0 references expected (badge, overview, versioning footer)
    const matches = screen.getAllByText(/v3\.0/);
    expect(matches.length).toBeGreaterThanOrEqual(3);
    // Versioning section references current version
    expect(container.textContent).toContain("current version is");
  });

  it('whats-new page references "v3.0"', async () => {
    const { default: WhatsNewPage } = await import("@/app/whats-new/page");
    wrap(<WhatsNewPage />);
    const matches = screen.getAllByText(/v3\.0/);
    expect(matches.length).toBeGreaterThan(0);
  });

  it('getting-started page references v3 via surfcontext.json example', async () => {
    const { default: GettingStartedPage } = await import(
      "@/app/getting-started/page"
    );
    const { container } = wrap(<GettingStartedPage />);
    // The surfcontext.json code block contains "version": "3.0"
    expect(container.textContent).toContain('"version": "3.0"');
  });

  it("tools page references ARDS v3.0", async () => {
    const { default: ToolsPage } = await import("@/app/tools/page");
    wrap(<ToolsPage />);
    const matches = screen.getAllByText(/ARDS v3\.0/);
    expect(matches.length).toBeGreaterThan(0);
  });
});

// ============================================================
// 2. All 9 v3 contributions are listed on the whats-new page
// ============================================================

const EXPECTED_V3_CONTRIBUTIONS = [
  "Living Guides",
  "Session Checkpoints",
  "Evidence Epistemology",
  "IP Safety",
  "Context Budget Management",
  "Multi-Agent Coordination",
  "Cross-Repo References",
  "Discovery Order",
  "MCP Integration",
];

describe("v3 contributions completeness", () => {
  it("whats-new page lists all 9 contributions by name", async () => {
    const { default: WhatsNewPage } = await import("@/app/whats-new/page");
    const { container } = wrap(<WhatsNewPage />);

    const missing: string[] = [];
    for (const name of EXPECTED_V3_CONTRIBUTIONS) {
      if (!container.textContent?.includes(name)) {
        missing.push(name);
      }
    }
    expect(missing).toEqual([]);
  });

  it("whats-new page shows exactly 9 contribution cards", async () => {
    const { default: WhatsNewPage } = await import("@/app/whats-new/page");
    wrap(<WhatsNewPage />);
    // The section heading says "9 new capabilities"
    expect(screen.getByText("9 new capabilities")).toBeInTheDocument();
  });

  it("spec page has a v3 section for each contribution", async () => {
    const { default: SpecPage } = await import("@/app/spec/page");
    const { container } = wrap(<SpecPage />);

    // Each v3 contribution maps to a section in the spec
    const v3SectionIds = [
      "guides",
      "session-checkpoints",
      "discovery-order",
      "evidence-epistemology",
      "multi-agent",
      "cross-repo",
      "ip-safety",
      "mcp-integration",
      "context-budget",
    ];

    const missing: string[] = [];
    for (const id of v3SectionIds) {
      if (!container.querySelector(`[id="${id}"]`)) {
        missing.push(id);
      }
    }
    expect(missing).toEqual([]);
  });

  it("spec page has exactly 9 v3 badges", async () => {
    const { default: SpecPage } = await import("@/app/spec/page");
    wrap(<SpecPage />);
    const v3Badges = screen.getAllByText("v3");
    expect(v3Badges.length).toBe(9);
  });
});

// ============================================================
// 3. Spec sidebar TOC IDs match actual section IDs on the page
// ============================================================

// Sidebar TOC IDs (from spec-sidebar.tsx tocItems array)
const SIDEBAR_TOC_IDS = [
  "overview",
  "design-principles",
  "file-hierarchy",
  "root-context",
  "context-md-structure",
  "context-md-requirements",
  "surfcontext-json",
  "surfcontext-schema",
  "surfcontext-fields",
  "agent-configs",
  "agent-format",
  "agent-fields",
  "skill-configs",
  "knowledge-docs",
  "guides",
  "plan-docs",
  "research-docs",
  "session-checkpoints",
  "discovery-order",
  "evidence-epistemology",
  "multi-agent",
  "cross-repo",
  "ip-safety",
  "mcp-integration",
  "context-budget",
  "token-budget",
  "platform-compatibility",
  "ards-superset",
  "quality-scoring",
  "freshness",
  "migration",
];

describe("spec sidebar TOC / section ID alignment", () => {
  it("every sidebar TOC ID has a matching element in the spec page", async () => {
    const { default: SpecPage } = await import("@/app/spec/page");
    const { container } = wrap(<SpecPage />);

    const missing: string[] = [];
    for (const id of SIDEBAR_TOC_IDS) {
      if (!container.querySelector(`[id="${id}"]`)) {
        missing.push(id);
      }
    }
    expect(missing).toEqual([]);
  });

  it("every section/heading ID in the spec page has a sidebar TOC link", async () => {
    // Get sidebar link targets
    const { SpecSidebar } = await import("@/components/spec-sidebar");
    const { container: sidebarContainer } = wrap(<SpecSidebar />);
    const sidebarLinks = sidebarContainer.querySelectorAll("a[href^='#']");
    const sidebarIds = new Set(
      Array.from(sidebarLinks).map((a) =>
        a.getAttribute("href")!.replace("#", "")
      )
    );

    // Get all element IDs from the spec page
    const { default: SpecPage } = await import("@/app/spec/page");
    const { container: specContainer } = wrap(<SpecPage />);
    const elementsWithIds = specContainer.querySelectorAll("[id]");
    const pageIds = Array.from(elementsWithIds).map((el) => el.id);

    const missingFromSidebar: string[] = [];
    for (const id of pageIds) {
      if (!sidebarIds.has(id)) {
        missingFromSidebar.push(id);
      }
    }
    expect(missingFromSidebar).toEqual([]);
  });
});
