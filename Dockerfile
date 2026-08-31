FROM rust:1.88-bookworm AS builder
WORKDIR /app
COPY Cargo.toml Cargo.lock ./
RUN mkdir src && echo "fn main() {}" > src/main.rs && cargo build --release && rm -rf src
COPY src/ src/
COPY content/ content/
# SPEC.surf is include_str!'d by src/routes/spec.rs (ARDS 5.2 renders /spec from the
# repo-root spec); the builder stage must carry it or `cargo build` fails to read it.
COPY SPEC.surf ./
RUN touch src/main.rs && cargo build --release

FROM debian:bookworm-slim
RUN apt-get update && apt-get install -y ca-certificates && rm -rf /var/lib/apt/lists/*
WORKDIR /app
COPY --from=builder /app/target/release/surfcontext-website /usr/local/bin/surfcontext-website
COPY static/ /app/static/
COPY assets/ /app/assets/


ENV HOST=0.0.0.0
ENV PORT=3000
EXPOSE 3000

CMD ["surfcontext-website"]
