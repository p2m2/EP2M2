-- SPDX-FileCopyrightText: 2024 Marcellino Palerme <marcellino.palerme@inrae.fr>
--
-- SPDX-License-Identifier: MIT

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
  f_type VARCHAR(15),
  f_size INT,
  content oid NOT NULL
);

CREATE TABLE proj_file
(
  id_project SERIAL REFERENCES project (id) ON DELETE CASCADE,
  id_file SERIAL REFERENCES file (id) ON DELETE CASCADE,
  PRIMARY KEY (id_project, id_file)
);

CREATE VIEW view_proj_file AS
SELECT file.id AS id, file.name AS name, file.date_create AS date_create, 
       file.f_type AS f_type, file.f_size AS f_size, file.content AS content,
       proj_file.id_project AS id_project
FROM file, proj_file
WHERE file.id = proj_file.id_file;

CREATE TRIGGER t_content BEFORE UPDATE OR DELETE ON file
    FOR EACH ROW EXECUTE FUNCTION lo_manage(content);

CREATE TYPE m_type AS ENUM ('UV', 'FID', 'MZ');

CREATE TABLE machine
(
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) UNIQUE,
  m_type m_type,
  description TEXT,
  date_achieve TIMESTAMPTZ
);

CREATE VIEW view_usable_machine AS
SELECT *
FROM machine
WHERE date_achieve IS NULL;

CREATE TABLE calib_curves
(
  id SERIAL PRIMARY KEY,
  name VARCHAR(255),
  date_create TIMESTAMPTZ NOT NULL,
  date_achieve TIMESTAMPTZ,
  used INTEGER,
  id_machine SERIAL REFERENCES machine (id)
);

CREATE TABLE daughter
(
  id_calib_curves SERIAL REFERENCES calib_curves (id) ON DELETE CASCADE,
  id_file SERIAL REFERENCES file (id) ON DELETE CASCADE,
  id_mol VARCHAR(52),
  area FLOAT NOT NULL,
  concentration FLOAT NOT NULL,
  PRIMARY KEY (id_calib_curves, id_file, id_mol)
);

CREATE TABLE ratio
(
  id_mol VARCHAR(52),
  id_calib_curves SERIAL REFERENCES calib_curves (id) ON DELETE CASCADE,
  ratio FLOAT,
  PRIMARY KEY (id_mol, id_calib_curves)
);

CREATE OR REPLACE FUNCTION delete_ratio_if_unused()
RETURNS TRIGGER AS $$
BEGIN
    -- Check if the order_id from the deleted row in orders is used in order_details
    IF NOT EXISTS (
        SELECT 1
        FROM daughter
        WHERE id_calib_curves = OLD.id_calib_curves
        AND id_mol = OLD.id_mol
    ) THEN
        -- Delete the row from order_details if it's not used elsewhere
        DELETE FROM ratio
        WHERE id_calib_curves = OLD.id_calib_curves
        AND id_mol = OLD.id_mol;
    END IF;

    RETURN OLD;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_delete_ratio
AFTER DELETE ON daughter
FOR EACH ROW
EXECUTE FUNCTION delete_ratio_if_unused();


CREATE VIEW view_calib_curve AS
SELECT calib_curves.id AS id, calib_curves.name, array_agg(ratio.id_mol) AS metabolite,     
       calib_curves.date_create, calib_curves.date_achieve
FROM calib_curves, ratio
WHERE calib_curves.id = ratio.id_calib_curves
AND calib_curves.date_achieve IS NULL
GROUP BY calib_curves.id;

CREATE VIEW view_show_calib_curve AS
SELECT calib_curves.id AS id, calib_curves.name, array_agg(ratio.id_mol) AS metabolite,     
       calib_curves.date_create, calib_curves.date_achieve
FROM calib_curves
LEFT JOIN ratio ON calib_curves.id = ratio.id_calib_curves
GROUP BY calib_curves.id;

CREATE VIEW view_daughter_file AS
SELECT file.id AS id,  file.name AS name,
       daughter.id_mol AS mol, area, concentration, id_calib_curves 
FROM daughter, file
WHERE daughter.id_file = file.id;


CREATE TABLE proj_calib_curves
(
  id_project SERIAL REFERENCES project (id) ON DELETE CASCADE,
  id_calib_curves SERIAL REFERENCES calib_curves (id) ON DELETE CASCADE,
  PRIMARY KEY (id_project, id_calib_curves)
);

INSERT INTO users (name, email, hash, team)
VALUES 
('root_ep2m2', 'admin@ep2m2.bzh', 
 '$2b$10$M1yCnD1pGQ6LXDh0IeR94uRcFOlikhs2uFKvqdWaJ3wbmnFPERquy', 'other'),
('poire', 'poire@mail.it',
 '$2b$10$O0YmpmJkTPWoRI8KBYWQLOy6/LcCwM/gd/zoD1PpWl2oYLHRm3M9y', 'IFPC'),
('rang', 'rang@mail.it', 
 '$2b$10$hFQTt27G0NRDFpjEBWanzezG379TaFbY4XCEx51cQPREFSOvcAvLK', 'P2M2'),
('huile', 'huile_i@mail.it',
 '$2b$10$t6wa72bsTJYM/CUENcMEluCv9ucDu4xd/5SvGQMfVQOfvfUb4nL4u', 'IFPC'),
('huile', 'huile_p@mail.it',
 '$2b$10$t6wa72bsTJYM/CUENcMEluCv9ucDu4xd/5SvGQMfVQOfvfUb4nL4u', 'P2M2'),
('huile', 'huile_o@mail.it',
 '$2b$10$t6wa72bsTJYM/CUENcMEluCv9ucDu4xd/5SvGQMfVQOfvfUb4nL4u', 'other'),
('alors', 'alors@mail.it',
 '$2b$10$lykg9yaKuuuEAybe4bSimebtuxQS6zkIpBlO8dG47pIbVzjbrNzIO', 'P2M2'),
('art', 'art@mail.it',
 '$2b$10$bHdSEKlQ.emIxs.EoWRSHOo2Kv7ah1iNuVq.j0rn09nDefDkZS.my', 'P2M2'),
('tshirt', 'tshirt@mail.it',
 '$2b$10$bHUWHvZA4jUWg9.MNAae3uMHR2kpk0c6nErgs/Fce1ZTCLUUqD/sO', 'P2M2');


INSERT INTO machine (name, m_type, id) VALUES ('unexist', 'UV', -1);