import Link from "next/link";

export function Footer() {
  return (
    <footer className="border-t border-border bg-muted/30">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Brand */}
          <div>
            <p className="font-mono font-bold text-foreground mb-2">
              <span className="text-accent-foreground">&gt;_</span> SurfContext
            </p>
            <p className="text-sm text-muted-foreground leading-relaxed">
              The open standard for agent-ready project documentation.
            </p>
          </div>

          {/* Links */}
          <div>
            <p className="text-sm font-semibold text-foreground mb-3">Resources</p>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/whats-new" className="text-muted-foreground hover:text-foreground transition-colors">
                  What&apos;s New in v3
                </Link>
              </li>
              <li>
                <Link href="/spec" className="text-muted-foreground hover:text-foreground transition-colors">
                  Specification
                </Link>
              </li>
              <li>
                <Link href="/getting-started" className="text-muted-foreground hover:text-foreground transition-colors">
                  Getting Started
                </Link>
              </li>
              <li>
                <Link href="/tools" className="text-muted-foreground hover:text-foreground transition-colors">
                  Tools
                </Link>
              </li>
              <li>
                <a
                  href="https://github.com/cloudsurf-software/surfcontext"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  GitHub
                </a>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <p className="text-sm font-semibold text-foreground mb-3">Legal</p>
            <p className="text-sm text-muted-foreground leading-relaxed">
              SurfContext is an open format by{" "}
              <a
                href="https://cloudsurf.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-accent-foreground hover:underline"
              >
                CloudSurf
              </a>
              .
            </p>
            <p className="text-sm text-muted-foreground leading-relaxed mt-2">
              Licensed under{" "}
              <a
                href="https://creativecommons.org/licenses/by-sa/4.0/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-accent-foreground hover:underline"
              >
                CC-BY-SA 4.0
              </a>
              .
            </p>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-border text-center text-xs text-muted-foreground">
          &copy; {new Date().getFullYear()} CloudSurf Software LLC. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
