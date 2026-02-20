use askama::Template;
use axum::{Router, response::Html, routing::get};

#[derive(Template)]
#[template(path = "getting_started.html")]
struct GettingStartedTemplate;

async fn getting_started_page() -> Html<String> {
    Html(GettingStartedTemplate.render().unwrap_or_default())
}

pub fn router() -> Router {
    Router::new().route("/getting-started", get(getting_started_page))
}
