# SPDX-FileCopyrightText: 2024 Marcellino Palerme <marcellino.palerme@inrae.fr>
#
# SPDX-License-Identifier: MIT
FROM node:latest
WORKDIR /EP2M2
COPY . .
RUN npm i
RUN npm run build
EXPOSE 3000
RUN mkdir /results
ENV EP2M2_DIR_SHARE=/shareFile
ENV EP2M2_DIR_RESULT=/results
ENV PGHOST=db
CMD ["node", "./.output/server/index.mjs"]