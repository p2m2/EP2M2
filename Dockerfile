FROM node:latest
WORKDIR /EP2M2
COPY ./.output .
EXPOSE 3000
RUN mkdir /results
ENV EP2M2_DIR_SHARE=/shareFile
ENV EP2M2_DIR_RESULT=/results
ENV PGHOST=db
CMD ["node", "./server/index.mjs"]
