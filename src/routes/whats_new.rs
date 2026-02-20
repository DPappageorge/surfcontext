use axum::{Router, response::Html, routing::get};

use crate::html;

async fn whats_new_page() -> Html<String> {
    Html(html::page(
        "What's New in ARDS v3.0 - SurfContext",
        "Nine new capabilities for structuring AI-agent-ready repositories. Living guides, session checkpoints, evidence epistemology, IP safety, context budget management, and more.",
        "",
        include_str!("../../content/whats_new.html"),
    ))
}

pub fn router() -> Router {
    Router::new().route("/whats-new", get(whats_new_page))
}
