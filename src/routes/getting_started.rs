use axum::{Router, response::Html, routing::get};

use crate::html;

async fn getting_started_page() -> Html<String> {
    Html(html::page(
        "Getting Started - SurfContext",
        "Set up SurfContext in your project in under 5 minutes. No dependencies required.",
        "",
        include_str!("../../content/getting_started.html"),
    ))
}

pub fn router() -> Router {
    Router::new().route("/getting-started", get(getting_started_page))
}
