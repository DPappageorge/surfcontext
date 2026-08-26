use axum::{Router, response::Html, routing::get};

use crate::html;

/// The canonical specification text, rendered straight from `SPEC.surf`.
///
/// This page used to serve a hand-written `content/spec.html` that had to be
/// re-authored by hand on every amendment, and had drifted to ARDS v3.0 while
/// the ratified spec moved on. Rendering `SPEC.surf` through `surf-parse` makes
/// drift structurally impossible: there is one spec document, and the site is a
/// view of it.
pub const SPEC_SOURCE: &str = include_str!("../../SPEC.surf");

async fn spec_page() -> Html<String> {
    let result = surf_parse::parse(SPEC_SOURCE);
    let content = result.doc.to_html();
    Html(html::page(
        "Specification — SurfContext ARDS v5.2",
        "The complete ARDS v5.2 specification for agent-ready project documentation",
        r#"<link rel="stylesheet" href="/static/css/spec.css">"#,
        &content,
    ))
}

pub fn router() -> Router {
    Router::new().route("/spec", get(spec_page))
}

#[cfg(test)]
mod tests {
    use super::*;

    #[tokio::test]
    async fn spec_page_renders_the_ratified_version() {
        let Html(body) = spec_page().await;
        assert!(
            body.contains("ARDS v5.2"),
            "spec page does not name the ratified version"
        );
        assert!(
            body.contains("SurfDoc-Native Context"),
            "spec page is missing Section 45 — the page is not rendering SPEC.surf"
        );
        assert!(!body.contains("ARDS version 3.0"), "stale v3.0 text is being served");
    }
}
