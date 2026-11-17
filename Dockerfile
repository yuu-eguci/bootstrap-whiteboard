# lint と単体テスト、ブラウザテストを実行するイメージです。
FROM node:26.13.1-bookworm-slim@sha256:5df79989ed685e09f0a98019db4cebfb22fb9df1a53c0161664a011f7ff6b0f1

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
