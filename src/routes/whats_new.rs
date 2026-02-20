use askama::Template;
use axum::{Router, response::Html, routing::get};

#[derive(Template)]
#[template(path = "whats_new.html")]
struct WhatsNewTemplate;

async fn whats_new_page() -> Html<String> {
    Html(WhatsNewTemplate.render().unwrap_or_default())
}

pub fn router() -> Router {
    Router::new().route("/whats-new", get(whats_new_page))
}
