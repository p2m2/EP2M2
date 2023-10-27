-- CREATE USER ep2m2 WITH PASSWORD 'ep2m2';
CREATE DATABASE ep2m2db;
GRANT ALL PRIVILEGES ON DATABASE ep2m2db TO ep2m2;

\c ep2m2db ep2m2

CREATE TABLE verification_token
(
  identifier TEXT NOT NULL,
  expires TIMESTAMPTZ NOT NULL,
  token TEXT NOT NULL,

  PRIMARY KEY (identifier, token)
);

CREATE TABLE accounts
(
  id SERIAL,
  "userId" INTEGER NOT NULL,
  type VARCHAR(255) NOT NULL,
  provider VARCHAR(255) NOT NULL,
  "providerAccountId" VARCHAR(255) NOT NULL,
  refresh_token TEXT,
  access_token TEXT,
  expires_at BIGINT,
  id_token TEXT,
  scope TEXT,
  session_state TEXT,
  token_type TEXT,

  PRIMARY KEY (id)
);

CREATE TABLE sessions
(
  id SERIAL,
  "userId" INTEGER NOT NULL,
  expires TIMESTAMPTZ NOT NULL,
  "sessionToken" VARCHAR(255) NOT NULL,

  PRIMARY KEY (id)
);

CREATE TABLE users
(
  id SERIAL,
  name VARCHAR(255),
  lastname VARCHAR(255),
  email VARCHAR(255),
  "emailVerified" TIMESTAMPTZ,
  hash VARCHAR(255),
  image TEXT,

  PRIMARY KEY (id)
);


INSERT INTO users (name, email, hash)
VALUES ('root_ep2m2', 'admin@ep2m2.bzh', '$2b$20$lXPvW4QgYyULMiNNT5RNGumgAWp01cBOYh9lPRdv48lH4EW1Cezsy');