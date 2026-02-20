use askama::Template;
use axum::{Router, response::Html, routing::get};

#[derive(Template)]
#[template(path = "spec.html")]
struct SpecTemplate;

async fn spec_page() -> Html<String> {
    Html(SpecTemplate.render().unwrap_or_default())
}

pub fn router() -> Router {
    Router::new().route("/spec", get(spec_page))
}
