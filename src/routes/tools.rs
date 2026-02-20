use askama::Template;
use axum::{Router, response::Html, routing::get};

#[derive(Template)]
#[template(path = "tools.html")]
struct ToolsTemplate;

async fn tools_page() -> Html<String> {
    Html(ToolsTemplate.render().unwrap_or_default())
}

pub fn router() -> Router {
    Router::new().route("/tools", get(tools_page))
}
