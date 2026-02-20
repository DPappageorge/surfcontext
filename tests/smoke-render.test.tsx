import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";
import { ThemeProvider } from "@/components/theme-provider";

function wrap(ui: React.ReactElement) {
  return render(<ThemeProvider>{ui}</ThemeProvider>);
}

describe("smoke render — every page renders without throwing", () => {
  it("home page renders", async () => {
    const { default: Home } = await import("@/app/page");
    const { container } = wrap(<Home />);
    expect(container.querySelector("section")).not.toBeNull();
  });

  it("spec page renders", async () => {
    const { default: SpecPage } = await import("@/app/spec/page");
    const { container } = wrap(<SpecPage />);
    expect(container.querySelector("article")).not.toBeNull();
  });

  it("whats-new page renders", async () => {
    const { default: WhatsNewPage } = await import("@/app/whats-new/page");
    const { container } = wrap(<WhatsNewPage />);
    expect(container.querySelector("section")).not.toBeNull();
  });

  it("getting-started page renders", async () => {
    const { default: GettingStartedPage } = await import(
      "@/app/getting-started/page"
    );
    const { container } = wrap(<GettingStartedPage />);
    expect(container.querySelector("section")).not.toBeNull();
  });

  it("tools page renders", async () => {
    const { default: ToolsPage } = await import("@/app/tools/page");
    const { container } = wrap(<ToolsPage />);
    expect(container.querySelector("section")).not.toBeNull();
  });
});

describe("smoke render — shared components render in isolation", () => {
  it("Nav renders", async () => {
    const { Nav } = await import("@/components/nav");
    const { container } = wrap(<Nav />);
    expect(container.querySelector("nav")).not.toBeNull();
  });

  it("Footer renders", async () => {
    const { Footer } = await import("@/components/footer");
    const { container } = wrap(<Footer />);
    expect(container.querySelector("footer")).not.toBeNull();
  });

  it("SpecSidebar renders", async () => {
    const { SpecSidebar } = await import("@/components/spec-sidebar");
    const { container } = wrap(<SpecSidebar />);
    expect(container.querySelector("nav")).not.toBeNull();
  });

  it("CodeBlock renders", async () => {
    const { CodeBlock } = await import("@/components/code-block");
    const { container } = wrap(
      <CodeBlock code="console.log('test')" language="js" filename="test.js" />
    );
    expect(container.querySelector("pre")).not.toBeNull();
    expect(container.querySelector("code")).not.toBeNull();
  });
});
