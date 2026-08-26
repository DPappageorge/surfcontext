mod landing;
pub mod spec;
mod getting_started;
mod tools;
mod whats_new;
mod download;

use axum::Router;

pub fn router() -> Router {
    Router::new()
        .merge(landing::router())
        .merge(spec::router())
        .merge(getting_started::router())
        .merge(tools::router())
        .merge(whats_new::router())
        .merge(download::router())
}

#[cfg(test)]
mod content_parse_tests {
    use surf_parse::Severity;

    fn error_diagnostics(source: &str) -> Vec<String> {
        surf_parse::parse(source)
            .diagnostics
            .iter()
            .filter(|d| matches!(d.severity, Severity::Error))
            .map(|d| format!("{:?}", d))
            .collect()
    }

    /// Every `.surf` document this site serves must parse cleanly with
    /// `surf-parse`. The route tests assert the page *shell*, so a parse
    /// regression would ship a blank or mangled body without failing anything —
    /// this suite is what makes that visible.
    fn assert_parses(label: &str, source: &str) {
        let errors = error_diagnostics(source);
        assert!(
            errors.is_empty(),
            "{label}: surf-parse reported {} error diagnostic(s): {}",
            errors.len(),
            errors.join(" | ")
        );

        let html = surf_parse::parse(source).doc.to_html();
        assert!(!html.trim().is_empty(), "{label}: parsed to empty HTML");
    }

    #[test]
    fn landing_surf_parses() {
        assert_parses("content/landing.surf", include_str!("../../content/landing.surf"));
    }

    #[test]
    fn tools_surf_parses() {
        assert_parses("content/tools.surf", include_str!("../../content/tools.surf"));
    }

    #[test]
    fn whats_new_surf_parses() {
        assert_parses("content/whats_new.surf", include_str!("../../content/whats_new.surf"));
    }

    /// SPEC.surf carries `type: specification` in its frontmatter, which is not
    /// one of the ten document types surf-parse 0.5.1 accepts, so the parser
    /// rejects the frontmatter block (E002) while parsing the body normally.
    ///
    /// This test does NOT tolerate parse errors in SPEC.surf — it pins that one
    /// known defect exactly, by severity, code and subject, and fails on any
    /// additional error. Resolving it needs a decision that is out of this
    /// lane's scope (teach surf-parse the `specification` type, or change the
    /// canon document's declared type); tracked as D-SC-3.
    #[test]
    fn spec_surf_has_exactly_the_one_known_frontmatter_defect() {
        let errors = error_diagnostics(super::spec::SPEC_SOURCE);
        assert_eq!(
            errors.len(),
            1,
            "SPEC.surf error diagnostics changed — expected only the known \
             frontmatter `type` defect (D-SC-3), got: {}",
            errors.join(" | ")
        );
        let only = &errors[0];
        assert!(
            only.contains("E002") && only.contains("front matter"),
            "SPEC.surf's single error is no longer the known frontmatter defect: {only}"
        );
        assert!(
            only.contains("specification"),
            "SPEC.surf frontmatter error is not about the `specification` type: {only}"
        );
    }

    /// The spec is the largest SurfDoc the site renders — tables, fenced code,
    /// and 45 numbered sections. A silent truncation would still "parse", so
    /// assert the rendered body reaches the amendment and both end appendices.
    #[test]
    fn spec_surf_renders_end_to_end() {
        let html = surf_parse::parse(super::spec::SPEC_SOURCE).doc.to_html();
        assert!(!html.trim().is_empty(), "SPEC.surf rendered to empty HTML");
        for marker in [
            "Root Context",
            "SurfDoc-Native Context",
            "Appendix A",
            "Appendix D",
        ] {
            assert!(html.contains(marker), "SPEC.surf render is missing {marker:?}");
        }
    }
}
