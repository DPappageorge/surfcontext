use axum::{Router, response::Html, routing::get};

use crate::html;

async fn whats_new_page() -> Html<String> {
    let result = surf_parse::parse(include_str!("../../content/whats_new.surf"));
    let content = result.doc.to_html();
    Html(html::page(
        "What's New in ARDS v5.2 - SurfContext",
        "SurfDoc is now the native format of the standard. CONTEXT.surf is the canonical root context, Markdown stays a supported alias, and the v5 guarantee ladder carries forward unchanged.",
        "",
        &content,
    ))
}

pub fn router() -> Router {
    Router::new().route("/whats-new", get(whats_new_page))
}
