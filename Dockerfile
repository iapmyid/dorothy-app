# Builder
FROM node:18 as builder
ENV NODE_ENV=development
USER node
WORKDIR /home/node/app

ARG VITE_APP_NAME
ENV VITE_APP_NAME $VITE_APP_NAME
ARG VITE_FONTAWESOME_ICON_BASEURL
ENV VITE_FONTAWESOME_ICON_BASEURL $VITE_FONTAWESOME_ICON_BASEURL
ARG VITE_API_BASE_URL
ENV VITE_API_BASE_URL $VITE_API_BASE_URL
ARG VITE_API_TIMEOUT
ENV VITE_API_TIMEOUT $VITE_API_TIMEOUT

COPY --chown=node:node package.json ./
RUN npm install
COPY --chown=node:node . .
RUN npm run build-only

# Runner
FROM node:18 as runner
ENV NODE_ENV=production
USER node
WORKDIR /home/node/app
COPY --chown=node:node package.json ./
RUN npm install --omit=dev
COPY --chown=node:node --from=builder /home/node/app .
EXPOSE 5173
CMD [ "npm", "run", "preview", "--", "--host", "--port=5173" ]