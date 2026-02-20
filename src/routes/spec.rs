use axum::{Router, response::Html, routing::get};

use crate::html;

async fn spec_page() -> Html<String> {
    Html(html::page(
        "Specification — SurfContext ARDS v3.0",
        "The complete ARDS v3.0 specification for AI-readable project documentation",
        r#"<link rel="stylesheet" href="/static/css/spec.css">"#,
        include_str!("../../content/spec.html"),
    ))
}

pub fn router() -> Router {
    Router::new().route("/spec", get(spec_page))
}
