use askama::Template;
use axum::{Router, response::Html, routing::get};

#[derive(Template)]
#[template(path = "landing.html")]
struct LandingTemplate;

async fn landing_page() -> Html<String> {
    Html(LandingTemplate.render().unwrap_or_default())
}

pub fn router() -> Router {
    Router::new().route("/", get(landing_page))
}
