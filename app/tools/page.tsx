import type { Metadata } from "next";
import Link from "next/link";
import { CodeBlock } from "@/components/code-block";

export const metadata: Metadata = {
  title: "Tools - SurfContext",
  description:
    "Tools for creating and managing SurfContext projects: TaskSurf export, CLI, and manual setup.",
};

const cliInitExample = `# Initialize a new SurfContext project
npx surfcontext init

# Generate platform files from CONTEXT.md
npx surfcontext generate

# Validate your SurfContext structure
npx surfcontext validate`;

const manualSteps = `# 1. Create the root context
touch CONTEXT.md

# 2. Create the context directory structure
mkdir -p .context/agents .context/docs .context/skills

# 3. Create the manifest
touch surfcontext.json

# 4. (Optional) Generate platform files
cp CONTEXT.md CLAUDE.md
cp CONTEXT.md AGENTS.md`;

export default function ToolsPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 sm:px-6 py-12 sm:py-16">
      {/* Header */}
      <div className="mb-12">
        <h1 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
          Tools
        </h1>
        <p className="text-lg text-muted-foreground">
          Create and manage SurfContext projects with these tools, or set
          everything up by hand.
        </p>
      </div>

      {/* TaskSurf */}
      <section className="mb-12">
        <div className="rounded-lg border border-border overflow-hidden">
          <div className="bg-muted/50 border-b border-border px-6 py-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-foreground">TaskSurf</h2>
                <p className="text-sm text-muted-foreground mt-1">
                  Export your workspace as a SurfContext package
                </p>
              </div>
              <span className="inline-flex items-center gap-1.5 rounded-full border border-green-500/30 bg-green-500/10 px-2.5 py-1 text-xs font-medium text-green-500">
                <span className="inline-block w-1.5 h-1.5 rounded-full bg-green-500" />
                Available
              </span>
            </div>
          </div>
          <div className="px-6 py-5">
            <p className="text-sm text-muted-foreground leading-relaxed mb-4">
              TaskSurf is an AI-native task management platform that can export
              your entire workspace -- tasks, team context, agent configurations
              -- as a SurfContext-conformant package. The exported{" "}
              <code className="font-mono text-accent-foreground bg-accent/10 px-1 rounded text-xs">
                CONTEXT.md
              </code>{" "}
              and{" "}
              <code className="font-mono text-accent-foreground bg-accent/10 px-1 rounded text-xs">
                .context/
              </code>{" "}
              directory can be dropped directly into any code repository.
            </p>
            <ul className="list-disc list-inside space-y-1.5 text-sm text-muted-foreground mb-4">
              <li>Generates ARDS v3.0 conformant output</li>
              <li>Includes version ledger for change tracking</li>
              <li>Exports agent definitions with proper frontmatter</li>
              <li>Maps team knowledge to .context/docs/ format</li>
            </ul>
            <a
              href="https://tasksurf.com"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center rounded-lg bg-primary text-primary-foreground px-4 py-2 text-sm font-medium hover:bg-primary/90 transition-colors"
            >
              Visit tasksurf.com
            </a>
          </div>
        </div>
      </section>

      {/* CLI */}
      <section className="mb-12">
        <div className="rounded-lg border border-border overflow-hidden">
          <div className="bg-muted/50 border-b border-border px-6 py-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-foreground">
                  SurfContext CLI
                </h2>
                <p className="text-sm text-muted-foreground mt-1">
                  Command-line tool for initializing and managing projects
                </p>
              </div>
              <span className="inline-flex items-center gap-1.5 rounded-full border border-yellow-500/30 bg-yellow-500/10 px-2.5 py-1 text-xs font-medium text-yellow-500">
                <span className="inline-block w-1.5 h-1.5 rounded-full bg-yellow-500" />
                Coming April 2026
              </span>
            </div>
          </div>
          <div className="px-6 py-5">
            <p className="text-sm text-muted-foreground leading-relaxed mb-4">
              The SurfContext CLI will provide quick project scaffolding,
              platform file generation, and structure validation from the
              command line.
            </p>
            <CodeBlock code={cliInitExample} language="bash" filename="Terminal" />
            <p className="text-sm text-muted-foreground mt-4">
              Planned features:
            </p>
            <ul className="list-disc list-inside space-y-1.5 text-sm text-muted-foreground mt-2">
              <li>
                <code className="font-mono text-accent-foreground bg-accent/10 px-1 rounded text-xs">
                  init
                </code>{" "}
                -- Scaffold a new SurfContext project with interactive prompts
              </li>
              <li>
                <code className="font-mono text-accent-foreground bg-accent/10 px-1 rounded text-xs">
                  generate
                </code>{" "}
                -- Generate platform files from CONTEXT.md using surfcontext.json config
              </li>
              <li>
                <code className="font-mono text-accent-foreground bg-accent/10 px-1 rounded text-xs">
                  validate
                </code>{" "}
                -- Check project structure against ARDS v3.0 requirements
              </li>
              <li>
                <code className="font-mono text-accent-foreground bg-accent/10 px-1 rounded text-xs">
                  sync
                </code>{" "}
                -- Detect drift between canonical and generated files
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* MCP Server */}
      <section className="mb-12">
        <div className="rounded-lg border border-border overflow-hidden">
          <div className="bg-muted/50 border-b border-border px-6 py-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-foreground">
                  MCP Server
                </h2>
                <p className="text-sm text-muted-foreground mt-1">
                  Expose .context/ content as MCP tools for any AI agent
                </p>
              </div>
              <span className="inline-flex items-center gap-1.5 rounded-full border border-yellow-500/30 bg-yellow-500/10 px-2.5 py-1 text-xs font-medium text-yellow-500">
                <span className="inline-block w-1.5 h-1.5 rounded-full bg-yellow-500" />
                Coming Q2 2026
              </span>
            </div>
          </div>
          <div className="px-6 py-5">
            <p className="text-sm text-muted-foreground leading-relaxed mb-4">
              The SurfContext MCP server bridges ARDS documentation into any
              MCP-compatible AI agent. It exposes your project context,
              agents, docs, guides, and plans as standardized tools.
            </p>
            <p className="text-sm text-muted-foreground mb-2">
              <strong className="text-foreground">Standard tool names (ARDS v3.0):</strong>
            </p>
            <div className="overflow-x-auto mb-4">
              <table className="w-full text-sm border border-border rounded-lg overflow-hidden">
                <thead>
                  <tr className="bg-muted/50 border-b border-border">
                    <th className="text-left px-4 py-2 font-medium text-foreground">Tool</th>
                    <th className="text-left px-4 py-2 font-medium text-foreground">Description</th>
                  </tr>
                </thead>
                <tbody className="text-muted-foreground">
                  <tr className="border-b border-border">
                    <td className="px-4 py-2 font-mono text-xs text-accent-foreground">surfcontext_read_context</td>
                    <td className="px-4 py-2">Read the root context file</td>
                  </tr>
                  <tr className="border-b border-border">
                    <td className="px-4 py-2 font-mono text-xs text-accent-foreground">surfcontext_list_agents</td>
                    <td className="px-4 py-2">List available agent definitions</td>
                  </tr>
                  <tr className="border-b border-border">
                    <td className="px-4 py-2 font-mono text-xs text-accent-foreground">surfcontext_list_docs</td>
                    <td className="px-4 py-2">List knowledge docs with last-updated dates</td>
                  </tr>
                  <tr className="border-b border-border">
                    <td className="px-4 py-2 font-mono text-xs text-accent-foreground">surfcontext_list_guides</td>
                    <td className="px-4 py-2">List guides with confidence levels</td>
                  </tr>
                  <tr className="border-b border-border">
                    <td className="px-4 py-2 font-mono text-xs text-accent-foreground">surfcontext_list_plans</td>
                    <td className="px-4 py-2">List plans by category</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-2 font-mono text-xs text-accent-foreground">surfcontext_search</td>
                    <td className="px-4 py-2">Search across all ARDS content</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <p className="text-sm text-muted-foreground">
              Configure in{" "}
              <code className="font-mono text-accent-foreground bg-accent/10 px-1 rounded text-xs">
                surfcontext.json
              </code>{" "}
              under the{" "}
              <code className="font-mono text-accent-foreground bg-accent/10 px-1 rounded text-xs">
                mcp
              </code>{" "}
              field. See the{" "}
              <Link
                href="/spec#mcp-integration"
                className="text-accent-foreground hover:underline"
              >
                MCP Integration spec
              </Link>
              .
            </p>
          </div>
        </div>
      </section>

      {/* Manual */}
      <section className="mb-12">
        <div className="rounded-lg border border-border overflow-hidden">
          <div className="bg-muted/50 border-b border-border px-6 py-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-foreground">Manual Setup</h2>
                <p className="text-sm text-muted-foreground mt-1">
                  Create files by hand following the specification
                </p>
              </div>
              <span className="inline-flex items-center gap-1.5 rounded-full border border-green-500/30 bg-green-500/10 px-2.5 py-1 text-xs font-medium text-green-500">
                <span className="inline-block w-1.5 h-1.5 rounded-full bg-green-500" />
                Available
              </span>
            </div>
          </div>
          <div className="px-6 py-5">
            <p className="text-sm text-muted-foreground leading-relaxed mb-4">
              SurfContext requires no dependencies or tooling. You can set up a
              conforming project with just a text editor and a terminal.
            </p>
            <CodeBlock code={manualSteps} language="bash" filename="Terminal" />
            <p className="text-sm text-muted-foreground mt-4">
              See the{" "}
              <Link
                href="/getting-started"
                className="text-accent-foreground hover:underline"
              >
                Getting Started guide
              </Link>{" "}
              for complete file content examples, or the{" "}
              <Link
                href="/spec"
                className="text-accent-foreground hover:underline"
              >
                specification
              </Link>{" "}
              for the full format reference.
            </p>
          </div>
        </div>
      </section>

      {/* Integrations note */}
      <section className="rounded-lg border border-border bg-muted/30 p-6">
        <h2 className="text-lg font-bold text-foreground mb-3">
          Building a tool?
        </h2>
        <p className="text-sm text-muted-foreground leading-relaxed">
          SurfContext is an open standard. If you are building a developer tool
          or AI coding agent, you can add SurfContext support by reading{" "}
          <code className="font-mono text-accent-foreground bg-accent/10 px-1 rounded text-xs">
            CONTEXT.md
          </code>{" "}
          and{" "}
          <code className="font-mono text-accent-foreground bg-accent/10 px-1 rounded text-xs">
            surfcontext.json
          </code>{" "}
          from the project root. The format is{" "}
          <a
            href="https://creativecommons.org/licenses/by-sa/4.0/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-accent-foreground hover:underline"
          >
            CC-BY-SA 4.0
          </a>{" "}
          licensed -- free to implement and distribute.
        </p>
      </section>
    </div>
  );
}
