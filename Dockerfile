# 1) 의존성 + 테스트 + 빌드
FROM node:24-alpine AS build
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
# NAVER_MAP_CLIENT_ID는 next.config env로 빌드할 때 브라우저 코드에 박히므로 빌드 인자로 받는다.
ARG NAVER_MAP_CLIENT_ID
ENV NAVER_MAP_CLIENT_ID=$NAVER_MAP_CLIENT_ID
ENV NEXT_TELEMETRY_DISABLED=1
RUN npm test && npm run build

# 2) 실행: standalone 결과물만 담는다 (node_modules 통째로 안 넣음)
FROM node:24-alpine
WORKDIR /app
ENV NODE_ENV=production NEXT_TELEMETRY_DISABLED=1 PORT=3000 HOSTNAME=0.0.0.0
COPY --from=build --chown=node:node /app/.next/standalone ./
COPY --from=build --chown=node:node /app/.next/static ./.next/static
COPY --from=build --chown=node:node /app/public ./public
USER node
EXPOSE 3000
# 서버 전용 키(APPLY_HOME_API_KEY, NAVER_MAP_CLIENT_SECRET)는 docker run 할 때 환경변수로 넣는다.
CMD ["node", "server.js"]
