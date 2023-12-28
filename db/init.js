const pg = require("pg");
const client = new pg.Client({
    database: "ep2m2db",
    user: "ep2m2",
    password: "ep2m2",
});

client.connect()
    .then(() => {
        client.query(`

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
  f_type VARCHAR(15),
  f_size INT,
  content oid NOT NULL,
  id_project SERIAL REFERENCES project (id)
);

CREATE TRIGGER t_content BEFORE UPDATE OR DELETE ON file
    FOR EACH ROW EXECUTE FUNCTION lo_manage(content);

CREATE TABLE compound
(
  id SERIAL PRIMARY KEY,
  name VARCHAR(255),
  url VARCHAR(255),
  description TEXT
);

INSERT INTO users (name, email, hash, team)
VALUES ('root_ep2m2', 'admin@ep2m2.bzh', '$2b$10$M1yCnD1pGQ6LXDh0IeR94uRcFOlikhs2uFKvqdWaJ3wbmnFPERquy', 'other'),
('poire', 'poire@mail.it', '$2b$10$O0YmpmJkTPWoRI8KBYWQLOy6/LcCwM/gd/zoD1PpWl2oYLHRm3M9y', 'IFPC'),
('rang', 'rang@mail.it', '$2b$10$hFQTt27G0NRDFpjEBWanzezG379TaFbY4XCEx51cQPREFSOvcAvLK', 'P2M2'),
('huile', 'huile_i@mail.it', '$2b$10$t6wa72bsTJYM/CUENcMEluCv9ucDu4xd/5SvGQMfVQOfvfUb4nL4u', 'IFPC'),
('huile', 'huile_p@mail.it', '$2b$10$t6wa72bsTJYM/CUENcMEluCv9ucDu4xd/5SvGQMfVQOfvfUb4nL4u', 'P2M2'),
('huile', 'huile_o@mail.it', '$2b$10$t6wa72bsTJYM/CUENcMEluCv9ucDu4xd/5SvGQMfVQOfvfUb4nL4u', 'other'),
('alors', 'alors@mail.it', '$2b$10$lykg9yaKuuuEAybe4bSimebtuxQS6zkIpBlO8dG47pIbVzjbrNzIO', 'P2M2');


        `)
            .then(res => {
                client.end();
            });
    })
    .catch(err => {
        console.log(err);
        client.end();
    });

