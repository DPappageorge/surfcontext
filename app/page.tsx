import Link from "next/link";
import { CodeBlock } from "@/components/code-block";

const directoryTree = `project-root/
  CONTEXT.md              # Canonical root context
  surfcontext.json        # Machine-readable config
  .context/
    agents/               # Agent definitions
    docs/                 # Knowledge documents
    skills/               # Skill definitions
    queue.md              # Task queue`;

const platforms = [
  { file: "CLAUDE.md", status: "Supported" },
  { file: "AGENTS.md", status: "Supported" },
  { file: ".cursorrules", status: "Supported" },
  { file: ".github/copilot-instructions.md", status: "Supported" },
  { file: ".windsurfrules", status: "Supported" },
];

const fragmentation = [
  { file: "CLAUDE.md" },
  { file: "AGENTS.md" },
  { file: ".cursorrules" },
  { file: ".github/copilot-instructions.md" },
  { file: ".windsurfrules" },
];

export default function Home() {
  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-accent/5 to-transparent pointer-events-none" />
        <div className="mx-auto max-w-6xl px-4 sm:px-6 pt-20 pb-16 sm:pt-28 sm:pb-24">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            {/* Left: Text */}
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-border bg-muted/50 px-3 py-1 text-xs font-mono text-muted-foreground mb-6">
                <span className="inline-block w-1.5 h-1.5 rounded-full bg-green-500" />
                ARDS v3.0 Specification
              </div>

              <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-foreground leading-[1.1] mb-6">
                The open standard for{" "}
                <span className="text-accent-foreground">agent-ready</span>{" "}
                project documentation
              </h1>

              <p className="text-lg text-muted-foreground leading-relaxed mb-8 max-w-lg">
                One format. Every AI coding agent. Define your project context
                once — all major AI coding agents understand it
                automatically.
              </p>

              <div className="flex flex-wrap gap-3 mt-2">
                <Link
                  href="/spec"
                  className="inline-flex items-center justify-center rounded-lg bg-primary text-primary-foreground px-5 py-2.5 text-sm font-medium hover:bg-primary/90 transition-colors"
                >
                  Read the Spec
                </Link>
                <Link
                  href="/getting-started"
                  className="inline-flex items-center justify-center rounded-lg border border-border text-foreground px-5 py-2.5 text-sm font-medium hover:bg-muted transition-colors"
                >
                  Quick Start
                </Link>
              </div>
            </div>

            {/* Right: Directory tree */}
            <div className="hidden lg:block">
              <CodeBlock code={directoryTree} filename="SurfContext Project Structure" />
            </div>
          </div>
        </div>
      </section>

      {/* Problem: Fragmentation */}
      <section className="border-t border-border bg-muted/20">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 py-16 sm:py-24">
          <div className="text-center mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-4">
              5 AI tools. 5 config formats. 0 standards.
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Every AI coding agent invented its own way to read project context.
              Your team maintains duplicate files that drift out of sync.
            </p>
          </div>

          {/* Fragmentation visual */}
          <div className="max-w-2xl mx-auto mb-12">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {fragmentation.map((item) => (
                <div
                  key={item.file}
                  className="flex items-center gap-3 rounded-lg border border-border bg-card p-3"
                >
                  <span className="inline-block w-2 h-2 rounded-full bg-red-500/80 shrink-0" />
                  <p className="text-sm font-mono text-muted-foreground">
                    {item.file}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div className="text-center">
            <div className="inline-flex items-center gap-2 mb-4">
              <div className="h-px w-8 bg-border" />
              <span className="text-xs font-mono text-muted-foreground uppercase tracking-wider">
                replaced by
              </span>
              <div className="h-px w-8 bg-border" />
            </div>
            <br />
            <div className="inline-flex items-center gap-3 rounded-lg border-2 border-accent/50 bg-accent/5 px-6 py-4">
              <span className="inline-block w-2.5 h-2.5 rounded-full bg-green-500" />
              <div className="text-left">
                <p className="text-sm font-bold text-foreground">SurfContext</p>
                <p className="text-xs font-mono text-muted-foreground">
                  CONTEXT.md + .context/ + surfcontext.json
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="border-t border-border">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 py-16 sm:py-24">
          <div className="text-center mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-4">
              How it works
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Three files. Universal compatibility. Zero lock-in.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Step 1 */}
            <div className="relative">
              <div className="flex items-center gap-3 mb-4">
                <span className="flex items-center justify-center w-8 h-8 rounded-full bg-accent/10 text-accent-foreground text-sm font-bold font-mono">
                  1
                </span>
                <h3 className="font-semibold text-foreground">
                  Write your context
                </h3>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed mb-4">
                Create{" "}
                <code className="font-mono text-accent-foreground bg-accent/10 px-1.5 py-0.5 rounded text-xs">
                  CONTEXT.md
                </code>{" "}
                and a{" "}
                <code className="font-mono text-accent-foreground bg-accent/10 px-1.5 py-0.5 rounded text-xs">
                  .context/
                </code>{" "}
                directory with your agent definitions and knowledge docs.
              </p>
            </div>

            {/* Step 2 */}
            <div className="relative">
              <div className="flex items-center gap-3 mb-4">
                <span className="flex items-center justify-center w-8 h-8 rounded-full bg-accent/10 text-accent-foreground text-sm font-bold font-mono">
                  2
                </span>
                <h3 className="font-semibold text-foreground">
                  Target platforms
                </h3>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed mb-4">
                Add{" "}
                <code className="font-mono text-accent-foreground bg-accent/10 px-1.5 py-0.5 rounded text-xs">
                  surfcontext.json
                </code>{" "}
                to declare which AI platforms to generate config files for.
              </p>
            </div>

            {/* Step 3 */}
            <div className="relative">
              <div className="flex items-center gap-3 mb-4">
                <span className="flex items-center justify-center w-8 h-8 rounded-full bg-accent/10 text-accent-foreground text-sm font-bold font-mono">
                  3
                </span>
                <h3 className="font-semibold text-foreground">
                  AI auto-discovers
                </h3>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed mb-4">
                Open your project in any supported AI tool. It reads your
                context automatically -- no copy-paste, no per-tool config.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Compatibility */}
      <section className="border-t border-border bg-muted/20">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 py-16 sm:py-24">
          <div className="text-center mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-4">
              Platform compatibility
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              SurfContext generates the right config file for each platform from
              a single source of truth.
            </p>
          </div>

          <div className="max-w-3xl mx-auto">
            <div className="rounded-lg border border-border overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border bg-muted/50">
                    <th className="text-left px-4 py-3 font-medium text-foreground">
                      Generated File
                    </th>
                    <th className="text-left px-4 py-3 font-medium text-foreground">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {platforms.map((p, i) => (
                    <tr
                      key={p.file}
                      className={
                        i < platforms.length - 1
                          ? "border-b border-border"
                          : ""
                      }
                    >
                      <td className="px-4 py-3 font-mono text-sm text-foreground">
                        {p.file}
                      </td>
                      <td className="px-4 py-3">
                        <span className="inline-flex items-center gap-1.5 text-xs font-medium text-green-500">
                          <span className="inline-block w-1.5 h-1.5 rounded-full bg-green-500" />
                          {p.status}
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

      {/* CTA */}
      <section className="border-t border-border">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 py-16 sm:py-24 text-center">
          <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-4">
            Ready to standardize your AI context?
          </h2>
          <p className="text-muted-foreground mb-8 max-w-lg mx-auto">
            Get started in under 5 minutes. No dependencies, no build step, no
            lock-in.
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
              Read the Full Spec
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
