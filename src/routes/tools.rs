use axum::{Router, response::Html, routing::get};

use crate::html;

async fn tools_page() -> Html<String> {
    Html(html::page(
        "Tools - SurfContext",
        "Tools for creating and managing SurfContext projects: TaskSurf export, CLI, and manual setup.",
        r#"<link rel="stylesheet" href="/static/css/tools.css">"#,
        include_str!("../../content/tools.html"),
    ))
}

pub fn router() -> Router {
    Router::new().route("/tools", get(tools_page))
}
