FROM node:latest
WORKDIR /EP2M2
COPY ./.output .
EXPOSE 3000
CMD [ "node", "./server/index.mjs" ]