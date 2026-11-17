# ターゲットは web (ページの配信) と test (lint 、型チェック、テスト) です。既定は最後の test です。
FROM node:26.13.1-bookworm-slim@sha256:5df79989ed685e09f0a98019db4cebfb22fb9df1a53c0161664a011f7ff6b0f1 AS deps

ENV npm_config_update_notifier=false \
    npm_config_fund=false

WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci

# src/*.ts から js/*.js を生成します。
FROM deps AS build
COPY . .
RUN npm run build

# GitHub Pages で公開するファイル (*.html 、 css/ 、 js/) だけを配信します。
FROM node:26.13.1-bookworm-slim@sha256:5df79989ed685e09f0a98019db4cebfb22fb9df1a53c0161664a011f7ff6b0f1 AS web

ENV HOST=0.0.0.0 \
    PORT=8080 \
    SITE_DIR=/app/site

WORKDIR /app
COPY scripts/serve.ts scripts/
COPY --from=build /app/*.html site/
COPY --from=build /app/css site/css/
COPY --from=build /app/js site/js/
USER node
EXPOSE 8080
HEALTHCHECK --interval=5s --timeout=3s --retries=5 \
    CMD ["node", "-e", "fetch('http://127.0.0.1:8080/').then((r) => process.exit(r.ok ? 0 : 1), () => process.exit(1))"]
CMD ["node", "scripts/serve.ts"]

# lint 、型チェック、単体テスト、ブラウザテストを実行します。
FROM deps AS test

ENV CI=1 \
    PLAYWRIGHT_BROWSERS_PATH=/ms-playwright

RUN npx playwright install --with-deps chromium \
    && chown -R node:node /app

COPY --chown=node:node . .
USER node

CMD ["sh", "-c", "npm run lint && npm run typecheck && npm test"]
