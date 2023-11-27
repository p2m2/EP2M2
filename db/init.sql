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

CREATE TYPE team AS ENUM ('IFPC', 'P2M2', 'other');

CREATE TABLE users
(
  id SERIAL,
  name VARCHAR(255),
  lastname VARCHAR(255),
  email VARCHAR(255),
  "emailVerified" TIMESTAMPTZ,
  hash VARCHAR(255),
  image TEXT,
  team team,

  PRIMARY KEY (id)
);

CREATE TABLE project
(
  id SERIAL PRIMARY KEY,
  name VARCHAR(80) UNIQUE,
  date_create TIMESTAMPTZ NOT NULL,
  team team
);

CREATE EXTENSION lo;

CREATE TABLE file
(
  id SERIAL PRIMARY KEY,
  name VARCHAR(255),
  date_create TIMESTAMPTZ NOT NULL,
  kind VARCHAR(15),
  -- size INTERGER,
  content lo NOT NULL,
  export JSONB,
  id_project SERIAL REFERENCES project (id)
);

CREATE TRIGGER t_content BEFORE UPDATE OR DELETE ON file
    FOR EACH ROW EXECUTE FUNCTION lo_manage(content);

INSERT INTO users (name, email, hash, team)
VALUES ('root_ep2m2', 'admin@ep2m2.bzh', '$2b$10$M1yCnD1pGQ6LXDh0IeR94uRcFOlikhs2uFKvqdWaJ3wbmnFPERquy', 'other');