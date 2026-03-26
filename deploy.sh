#!/bin/bash
set -e

REPO="https://github.com/melnikdavid/fitness.git"
APP_DIR="/opt/fitness"

echo "🚀 FitTrack Deploy Script"
echo "========================="

# Install Docker if not present
if ! command -v docker &>/dev/null; then
  echo "📦 Installing Docker..."
  curl -fsSL https://get.docker.com | sh
  systemctl enable docker
  systemctl start docker
fi

# Clone or update repo
if [ -d "$APP_DIR/.git" ]; then
  echo "📥 Pulling latest code..."
  git -C "$APP_DIR" pull
else
  echo "📥 Cloning repository..."
  git clone "$REPO" "$APP_DIR"
fi

cd "$APP_DIR"

# Create .env if missing
if [ ! -f ".env" ]; then
  echo "🔑 Generating .env with random JWT secret..."
  echo "JWT_SECRET=$(openssl rand -hex 32)" > .env
  echo "✅ .env created — you can edit it at $APP_DIR/.env"
fi

# Build and (re)start containers
echo "🐳 Building and starting containers..."
docker compose up -d --build

echo ""
echo "✅ Done! FitTrack is running at http://fitness.pagesharper.com"
echo ""
echo "Useful commands:"
echo "  View logs:    docker compose -f $APP_DIR/docker-compose.yml logs -f"
echo "  Stop app:     docker compose -f $APP_DIR/docker-compose.yml down"
echo "  Restart app:  docker compose -f $APP_DIR/docker-compose.yml restart"
