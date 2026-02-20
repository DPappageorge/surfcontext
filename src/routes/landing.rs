use axum::{Router, response::Html, routing::get};

use crate::html;

async fn landing_page() -> Html<String> {
    Html(html::page(
        "SurfContext — One Spec. Every AI Coding Tool.",
        "One format. Every AI coding agent. Define your project context once — Claude Code, Cursor, Codex, and Copilot understand it automatically.",
        "",
        include_str!("../../content/landing.html"),
    ))
}

pub fn router() -> Router {
    Router::new().route("/", get(landing_page))
}
