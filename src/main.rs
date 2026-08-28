// SurfContext specification website — surfcontext.org
// CloudSurf Software LLC
mod html;
mod routes;

use axum::http::{StatusCode, header};
use axum::response::{IntoResponse, Response};
use axum::{Router, routing::get};
use tower_http::services::ServeDir;
use tracing_subscriber::EnvFilter;

/// Serve the unified SurfDoc stylesheet with the right Content-Type and cache
/// headers.
///
/// surf-parse carried this handler in an optional `serve` module behind an
/// `axum` feature through 0.5.x; from 0.19 the crate exposes the stylesheet as
/// the plain `SURFDOC_CSS` constant and leaves transport to the consumer, so
/// the four lines of framework glue live here. Headers are unchanged from the
/// module this replaces.
async fn surfdoc_css() -> Response {
    (
        StatusCode::OK,
        [
            (header::CONTENT_TYPE, "text/css; charset=utf-8"),
            (header::CACHE_CONTROL, "public, max-age=86400"),
        ],
        surf_parse::SURFDOC_CSS,
    )
        .into_response()
}

#[tokio::main]
async fn main() {
    tracing_subscriber::fmt()
        .with_env_filter(EnvFilter::from_default_env())
        .init();

    let app = Router::new()
        .merge(routes::router())
        .route("/static/css/surf-ui.css", get(surfdoc_css))
        .nest_service("/static", ServeDir::new("static"))
        .nest_service("/assets", ServeDir::new("assets"));

    let port = std::env::var("PORT").unwrap_or_else(|_| "3000".to_string());
    let addr = format!("0.0.0.0:{port}");
    tracing::info!("surfcontext.org listening on {addr}");

    let listener = tokio::net::TcpListener::bind(&addr).await.unwrap();
    axum::serve(listener, app).await.unwrap();
}
