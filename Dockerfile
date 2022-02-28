FROM node:12-alpine as base

# Build
RUN npm run build

WORKDIR /home/node/app
RUN chown -R node:node /home/node/app
COPY --chown=node:node package.json package-lock*.json .npmrc dist/
RUN ls