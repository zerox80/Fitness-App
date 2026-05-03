# Phase 1: Planen (welche Abhängigkeiten brauchen wir?)
FROM lukemathwalker/cargo-chef:latest-rust-slim-bookworm AS planner
WORKDIR /app
COPY . .
RUN cargo chef prepare --recipe-path recipe.json

# Phase 2: Cachen (Abhängigkeiten bauen)
FROM lukemathwalker/cargo-chef:latest-rust-slim-bookworm AS cacher
WORKDIR /app
RUN apt-get update && apt-get install -y pkg-config libssl-dev && rm -rf /var/lib/apt/lists/*
COPY --from=planner /app/recipe.json recipe.json
RUN cargo chef cook --release --recipe-path recipe.json

# Phase 3: Bauen (Nur den eigentlichen Code bauen)
FROM rust:slim-bookworm AS builder
WORKDIR /app
RUN apt-get update && apt-get install -y pkg-config libssl-dev && rm -rf /var/lib/apt/lists/*
COPY . .
# Kopiere die bereits gebauten Abhängigkeiten aus der Cacher-Phase
COPY --from=cacher /app/target /app/target
COPY --from=cacher /usr/local/cargo /usr/local/cargo
RUN cargo build --release

# Phase 4: Runtime (Kleines Final-Image)
FROM debian:bookworm-slim
RUN apt-get update && apt-get install -y ca-certificates libssl-dev && rm -rf /var/lib/apt/lists/*
WORKDIR /app
COPY --from=builder /app/target/release/fitpulse-backend /app/fitpulse-backend
COPY --from=builder /app/migrations /app/migrations
EXPOSE 3000
CMD ["./fitpulse-backend"]
