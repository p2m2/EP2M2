# SPDX-FileCopyrightText: 2024 Marcellino Palerme <marcellino.palerme@inrae.fr>
#
# SPDX-License-Identifier: MIT
FROM quay.io/fedora/nodejs-22:latest
WORKDIR /EP2M2
COPY . .
RUN npm i
RUN npm run build
EXPOSE 3000
ENV EP2M2_DIR_SHARE=/shareFile
ENV EP2M2_DIR_RESULT=/results
ENV PGHOST=db
CMD ["node", "./.output/server/index.mjs"]