use axum::{Router, response::IntoResponse, routing::post, http::header};
use serde::Deserialize;
use std::io::Write;

/// Markers the reference sync and the linter agree on. The generated harness
/// roots carry the Core *inline* between them — a root file that merely points
/// at the context is non-conformant (SPEC Section 36.1).
const ARDS_BEGIN: &str =
    "<!-- ards-core: begin (generated from CONTEXT.surf ## Core - edit THERE, never here) -->";
const ARDS_END: &str = "<!-- ards-core: end -->";

#[derive(Deserialize)]
struct DownloadForm {
    project_name: String,
    description: String,
    #[serde(default)]
    stack: String,
}

/// The starter kit's file set, built in memory.
///
/// Split out from the handler so the shape of the kit is testable without an
/// HTTP round trip: the kit is the product this page ships, and a silent
/// regression in it is invisible from the outside.
struct StarterKit {
    context_surf: String,
    harness_root: String,
    surfcontext_json: String,
    agent_surf: String,
}

impl StarterKit {
    fn build(project: &str, desc: &str, stack_line: &str) -> Self {
        let core = format!(
            "### Absolute rules\n\
             \n\
             1. **Verification** — verify every remembered fact against the live source \
             before acting on it. When memory and the source disagree, the source wins.\n\
             2. **Source of truth** — `CONTEXT.surf` and the tree named in \
             `surfcontext.json` are canonical. Never edit a generated file.\n\
             3. **Write path** — durable facts land in the tree before a session ends. \
             No fact may be recoverable only from agent-local memory.\n\
             \n\
             ### About {project}\n\
             \n\
             {desc}\n\
             \n\
             {stack_line}"
        );

        let context_surf = format!(
            "---\n\
             title: \"{project}\"\n\
             type: doc\n\
             version: 1\n\
             status: active\n\
             tags: [context, entry-point, ards]\n\
             ---\n\
             \n\
             <!-- SurfContext ARDS v5.2 — surfcontext.org -->\n\
             \n\
             # {project}\n\
             \n\
             {desc}\n\
             \n\
             This file is the canonical root context. The `## Core` section below is the \
             guaranteed-context head: the sync tool extracts it byte-for-byte and injects \
             a stamped copy into `CLAUDE.md` and `AGENTS.md`. Edit the rules here.\n\
             \n\
             ## Core\n\
             \n\
             {core}\n\
             ## Key Files\n\
             \n\
             | Path | Purpose |\n\
             |------|---------|\n\
             | `.context/docs/` | Deep context documents |\n\
             | `.context/agents/` | Specialized agent definitions |\n\
             | `.context/guides/` | Living how-to guides |\n\
             \n\
             ## Architecture\n\
             \n\
             Describe your project architecture here.\n\
             \n\
             ## Stack & Development\n\
             \n\
             Describe your development workflow here.\n\
             \n\
             ## Active Work\n\
             \n\
             - Run the SurfContext sync so `CLAUDE.md` and `AGENTS.md` carry a stamped \
             Core block. Until then the linter reports the missing stamp.\n"
        );

        // Section 36: the Core is inlined, not pointed at. The sha256 stamp line
        // is added by the sync tool on first run — this kit ships the body and
        // says so, rather than shipping a stamp it cannot compute.
        let harness_root = format!(
            "<!-- SurfContext ARDS v5.2 — surfcontext.org -->\n\
             <!-- GENERATED — edit CONTEXT.surf, then run the SurfContext sync -->\n\
             \n\
             {ARDS_BEGIN}\n\
             {core}\
             <!-- ards-core: stamp pending — run the SurfContext sync to add the sha256 line -->\n\
             {ARDS_END}\n\
             \n\
             Full rules and context: CONTEXT.surf (canonical - this file is generated).\n"
        );

        let surfcontext_json = format!(
            "{{\n  \
               \"version\": \"5.2\",\n  \
               \"format\": \".surf\",\n  \
               \"home\": \"local\",\n  \
               \"platforms\": [\"claude\", \"codex\"],\n  \
               \"project\": {{\n    \
                 \"name\": \"{project}\",\n    \
                 \"type\": \"product\"\n  \
               }},\n  \
               \"canonical\": {{\n    \
                 \"rootContext\": \"CONTEXT.surf\",\n    \
                 \"docsDir\": \".context/docs\",\n    \
                 \"agentsDir\": \".context/agents\",\n    \
                 \"guidesDir\": \".context/guides\"\n  \
               }},\n  \
               \"generation\": {{\n    \
                 \"claude\": {{\n      \
                   \"rootContext\": \"CLAUDE.md\",\n      \
                   \"method\": \"core-distillate\"\n    \
                 }},\n    \
                 \"codex\": {{\n      \
                   \"rootContext\": \"AGENTS.md\",\n      \
                   \"method\": \"core-distillate\"\n    \
                 }}\n  \
               }},\n  \
               \"coreInjection\": {{\n    \
                 \"budget\": 2000,\n    \
                 \"sourceSection\": \"## Core\",\n    \
                 \"stamp\": true\n  \
               }},\n  \
               \"discoveryOrder\": [\n    \
                 \"CONTEXT.surf\",\n    \
                 \"surfcontext.json\",\n    \
                 \".context/docs/\",\n    \
                 \".context/guides/\",\n    \
                 \".context/agents/\"\n  \
               ]\n\
             }}\n"
        );

        let agent_surf = "---\n\
             name: code-reviewer\n\
             description: \"Review code changes for quality, security, and consistency (80-150 chars)\"\n\
             tools: [Read, Grep, Glob]\n\
             ---\n\
             \n\
             # Code Reviewer\n\
             \n\
             Review code changes for:\n\
             - Security vulnerabilities\n\
             - Performance issues\n\
             - Code style consistency\n\
             - Test coverage gaps\n"
            .to_string();

        Self { context_surf, harness_root, surfcontext_json, agent_surf }
    }

    fn to_zip(&self) -> Vec<u8> {
        let cursor = std::io::Cursor::new(Vec::new());
        let mut zip_writer = zip::ZipWriter::new(cursor);
        let options = zip::write::SimpleFileOptions::default()
            .compression_method(zip::CompressionMethod::Deflated);

        for (name, body) in [
            ("CONTEXT.surf", self.context_surf.as_str()),
            ("CLAUDE.md", self.harness_root.as_str()),
            ("AGENTS.md", self.harness_root.as_str()),
            ("surfcontext.json", self.surfcontext_json.as_str()),
            (".context/agents/code-reviewer.surf", self.agent_surf.as_str()),
        ] {
            let _ = zip_writer.start_file(name, options);
            let _ = zip_writer.write_all(body.as_bytes());
        }

        for keep in [".context/docs/.gitkeep", ".context/guides/.gitkeep"] {
            let _ = zip_writer.start_file(keep, options);
            let _ = zip_writer.write_all(b"");
        }

        zip_writer.finish().unwrap().into_inner()
    }
}

fn kit_for(form: &DownloadForm) -> (String, Vec<u8>) {
    let project = if form.project_name.trim().is_empty() {
        "my-project".to_string()
    } else {
        form.project_name.trim().to_string()
    };

    let desc = if form.description.trim().is_empty() {
        "A project using SurfContext".to_string()
    } else {
        form.description.trim().to_string()
    };

    let stack_items: Vec<&str> = form
        .stack
        .split(',')
        .map(|s| s.trim())
        .filter(|s| !s.is_empty())
        .collect();

    let stack_line = if stack_items.is_empty() {
        String::new()
    } else {
        format!("**Stack**: {}\n", stack_items.join(", "))
    };

    let filename = format!("{}-surfcontext.zip", project.to_lowercase().replace(' ', "-"));
    (filename, StarterKit::build(&project, &desc, &stack_line).to_zip())
}

async fn download_starter_kit(axum::Form(form): axum::Form<DownloadForm>) -> impl IntoResponse {
    let (filename, bytes) = kit_for(&form);
    (
        [
            (header::CONTENT_TYPE, "application/zip".to_string()),
            (
                header::CONTENT_DISPOSITION,
                format!("attachment; filename=\"{filename}\""),
            ),
        ],
        bytes,
    )
}

pub fn router() -> Router {
    Router::new().route("/api/download", post(download_starter_kit))
}

#[cfg(test)]
mod tests {
    use super::*;
    use std::io::Read;

    fn kit() -> (String, Vec<u8>) {
        kit_for(&DownloadForm {
            project_name: "Demo Project".to_string(),
            description: "A demo".to_string(),
            stack: "Rust, Axum".to_string(),
        })
    }

    fn entries(bytes: &[u8]) -> Vec<String> {
        let mut archive = zip::ZipArchive::new(std::io::Cursor::new(bytes.to_vec()))
            .expect("starter kit is not a readable zip");
        (0..archive.len())
            .map(|i| archive.by_index(i).unwrap().name().to_string())
            .collect()
    }

    fn entry(bytes: &[u8], name: &str) -> String {
        let mut archive = zip::ZipArchive::new(std::io::Cursor::new(bytes.to_vec())).unwrap();
        let mut file = archive.by_name(name).unwrap_or_else(|_| panic!("no {name} in kit"));
        let mut out = String::new();
        file.read_to_string(&mut out).unwrap();
        out
    }

    #[test]
    fn kit_ships_a_surfdoc_root_not_a_markdown_one() {
        let (_, bytes) = kit();
        let names = entries(&bytes);
        assert!(names.contains(&"CONTEXT.surf".to_string()), "kit entries: {names:?}");
        assert!(
            !names.contains(&"CONTEXT.md".to_string()),
            "kit still ships the legacy Markdown root: {names:?}"
        );
        assert!(names.contains(&".context/agents/code-reviewer.surf".to_string()));
    }

    #[test]
    fn kit_declares_ards_v5_2() {
        let (_, bytes) = kit();
        assert!(entry(&bytes, "CONTEXT.surf").contains("ARDS v5.2"));
        assert!(entry(&bytes, "CLAUDE.md").contains("ARDS v5.2"));
        let manifest = entry(&bytes, "surfcontext.json");
        assert!(manifest.contains(r#""version": "5.2""#), "manifest: {manifest}");
        assert!(manifest.contains(r#""format": ".surf""#));
        assert!(manifest.contains(r#""rootContext": "CONTEXT.surf""#));
    }

    #[test]
    fn kit_manifest_is_valid_json_shaped() {
        let (_, bytes) = kit();
        let manifest = entry(&bytes, "surfcontext.json");
        assert_eq!(
            manifest.matches('{').count(),
            manifest.matches('}').count(),
            "unbalanced braces in generated manifest:\n{manifest}"
        );
        assert_eq!(manifest.matches('[').count(), manifest.matches(']').count());
    }

    #[test]
    fn context_surf_carries_a_core_section_and_the_harness_roots_inline_it() {
        let (_, bytes) = kit();
        let context = entry(&bytes, "CONTEXT.surf");
        assert!(context.contains("\n## Core\n"), "no exact '## Core' heading:\n{context}");

        // Section 36.1: a pointer-only harness root is non-conformant.
        for name in ["CLAUDE.md", "AGENTS.md"] {
            let root = entry(&bytes, name);
            assert!(root.contains(ARDS_BEGIN), "{name} has no ards-core block");
            assert!(root.contains(ARDS_END), "{name} has no ards-core end marker");
            assert!(
                root.contains("**Source of truth**"),
                "{name} points at the Core instead of inlining it"
            );
        }
    }

    #[test]
    fn kit_filename_is_slugified() {
        let (filename, _) = kit();
        assert_eq!(filename, "demo-project-surfcontext.zip");
    }
}
