# lint と単体テスト、ブラウザテストを実行するイメージです。
FROM node:24.22.1-bookworm-slim@sha256:55fb5f5a527ea2c5c4a95f963e48ef90aa38c7b346054fdc8ee9957a2b55d205

ENV CI=1 \
    PLAYWRIGHT_BROWSERS_PATH=/ms-playwright \
    npm_config_update_notifier=false \
    npm_config_fund=false

WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci \
    && npx playwright install --with-deps chromium \
    && chown -R node:node /app

COPY --chown=node:node . .
USER node

CMD ["sh", "-c", "npm run lint && npm test"]
