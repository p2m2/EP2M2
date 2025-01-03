-- © 2024 INRAE
-- SPDX-FileContributor: Marcellino Palerme <marcellino.palerme@inrae.fr>
--
-- SPDX-License-Identifier: MIT

-- CREATE USER ep2m2 WITH PASSWORD 'ep2m2';
-- CREATE DATABASE ep2m2db;
-- GRANT ALL PRIVILEGES ON DATABASE ep2m2db TO ep2m2;

-- \c ep2m2db ep2m2

CREATE TABLE verification_token
(
  identifier TEXT NOT NULL,
  expires TIMESTAMPTZ NOT NULL,
  token TEXT NOT NULL,

  PRIMARY KEY (identifier, token)
);

-- Kill all idle connections
CREATE OR REPLACE FUNCTION kill_idle_connections()
RETURNS trigger AS $$
DECLARE
    r RECORD;
BEGIN
    FOR r IN
        SELECT pid, state
        FROM pg_stat_activity
        WHERE state = 'idle' AND pid <> pg_backend_pid()
    LOOP
        EXECUTE 'SELECT pg_terminate_backend(' || r.pid || ');';
    END LOOP;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Create a trigger to kill idle connections when add a new verification token
CREATE OR REPLACE TRIGGER kill_idle_connections_trigger
AFTER INSERT ON verification_token
FOR EACH STATEMENT
EXECUTE FUNCTION kill_idle_connections();



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

-- Molecule
-- Molecule is a table to store information of molecules
CREATE TABLE molecule
(
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) UNIQUE,
  formula VARCHAR(255),
  mass FLOAT
);
-- Equivalents is a table to store information of equivalents
CREATE TABLE equivalent
(
  id SERIAL PRIMARY KEY,
  id_mol_0 SERIAL REFERENCES molecule (id) ON DELETE CASCADE,
  id_mol_1 SERIAL REFERENCES molecule (id) ON DELETE CASCADE,
  -- indicate if equivalent from relation
  id_relation INT
);

-- create transitivty of equivalent when A=B and B=C then A=C
CREATE OR REPLACE FUNCTION maintain_equivalence_transitivity()
RETURNS TRIGGER AS $$
DECLARE
    related_mol RECORD;
BEGIN
    -- Ajouter des équivalences transitives pour NEW.id_mol_0
    FOR related_mol IN
        SELECT id_mol_1 AS id_mol, id
        FROM equivalent WHERE id_mol_0 = NEW.id_mol_1
        UNION
        SELECT id_mol_0 AS id_mol, id
        FROM equivalent WHERE id_mol_1 = NEW.id_mol_1
    LOOP
        -- Vérifier si l'équivalence existe déjà entre NEW.id_mol_0 et related_mol.id_mol
        IF NOT EXISTS (
            SELECT 1 FROM equivalent
            WHERE (id_mol_0 = NEW.id_mol_0 AND id_mol_1 = related_mol.id_mol)
               OR (id_mol_0 = related_mol.id_mol AND id_mol_1 = NEW.id_mol_0)
        ) THEN
            -- Insérer la nouvelle équivalence
            INSERT INTO equivalent (id_mol_0, id_mol_1, id_relation)
            VALUES (NEW.id_mol_0, related_mol.id_mol, related_mol.id);
        END IF;
    END LOOP;

    -- Ajouter des équivalences transitives pour NEW.id_mol_1
    FOR related_mol IN
        SELECT id_mol_1 AS id_mol, id
        FROM equivalent WHERE id_mol_0 = NEW.id_mol_0
        UNION
        SELECT id_mol_0 AS id_mol, id
        FROM equivalent WHERE id_mol_1 = NEW.id_mol_0
    LOOP
        IF NOT EXISTS (
            SELECT 1 FROM equivalent
            WHERE (id_mol_0 = NEW.id_mol_1 AND id_mol_1 = related_mol.id_mol)
               OR (id_mol_0 = related_mol.id_mol AND id_mol_1 = NEW.id_mol_1)
        ) THEN
            INSERT INTO equivalent (id_mol_0, id_mol_1, id_relation)
            VALUES (NEW.id_mol_1, related_mol.id_mol, related_mol.id);
        END IF;
    END LOOP;

    -- Delete equilvalence between same molecule
    DELETE FROM equivalent
    WHERE id_mol_0 = id_mol_1;


    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- launch equivalent transitivity when add equivalent
CREATE TRIGGER trigger_maintain_equivalence_transitivity
AFTER INSERT ON equivalent
FOR EACH ROW
EXECUTE FUNCTION maintain_equivalence_transitivity();
-- Synonyms is a table to store information of synonyms
-- user is a boolean to know if the synonym is added by a user
CREATE TABLE synonym
(
  id_mol SERIAL REFERENCES molecule (id) ON DELETE CASCADE,
  name VARCHAR(255),
  is_user BOOLEAN DEFAULT FALSE,
  PRIMARY KEY (id_mol, name)
);

-- view to show information of molecule in tab
CREATE VIEW view_tab_molecule AS
SELECT molecule.id AS id, molecule.name AS name, formula, mass,
       COUNT(equivalent.id_mol_0) AS equivalent
FROM molecule
LEFT JOIN equivalent ON molecule.id = equivalent.id_mol_0 
                      OR molecule.id = equivalent.id_mol_1
GROUP BY molecule.id;

-- Function to get id equivalent molecules
CREATE OR REPLACE FUNCTION func_equivalent_molecule(in_id_mol INTEGER)
RETURNS TABLE(id INTEGER) AS $$
BEGIN
    RETURN QUERY
    SELECT  molecule.id AS id
    FROM molecule
    WHERE molecule.id IN 
      (SELECT id_mol_0 FROM equivalent WHERE id_mol_1 = in_id_mol
       UNION
       SELECT id_mol_1 FROM equivalent WHERE id_mol_0 = in_id_mol);
END;
$$ LANGUAGE plpgsql;

-- Function to get all synonyms and equivalents of a molecule
CREATE OR REPLACE FUNCTION func_synonym_equivalent_molecule(in_id_mol INTEGER)
RETURNS TABLE(synonym VARCHAR(255)[], equivalent INTEGER[]) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        array_agg(DISTINCT synonym.name) AS synonym, 
        array_agg(DISTINCT eq_id) AS equivalent
    FROM molecule
    LEFT JOIN synonym ON molecule.id = synonym.id_mol
    LEFT JOIN (
        SELECT id_mol_0 AS eq_id FROM equivalent WHERE id_mol_1 = in_id_mol
        UNION
        SELECT id_mol_1 AS eq_id FROM equivalent WHERE id_mol_0 = in_id_mol
    ) AS equivalents ON true
    WHERE molecule.id = in_id_mol;
END;
$$ LANGUAGE plpgsql;

CREATE TABLE calib_curves
(
  id SERIAL PRIMARY KEY,
  name VARCHAR(255),
  date_create TIMESTAMPTZ NOT NULL,
  date_achieve TIMESTAMPTZ,
  used INTEGER DEFAULT 0,
  id_machine SERIAL REFERENCES machine (id)
);

CREATE TABLE daughter
(
  id_calib_curves SERIAL REFERENCES calib_curves (id) ON DELETE CASCADE,
  id_file SERIAL REFERENCES file (id) ON DELETE CASCADE,
  id_mol VARCHAR(52),
  area FLOAT NOT NULL,
  concentration FLOAT NOT NULL,
  PRIMARY KEY (id_calib_curves, id_file, id_mol, area)
);

CREATE VIEW view_calib_curve AS
SELECT calib_curves.id AS id, calib_curves.name,
       array_agg(DISTINCT daughter.id_mol) AS metabolite,     
       calib_curves.date_create, calib_curves.date_achieve
FROM calib_curves, daughter
WHERE calib_curves.id = daughter.id_calib_curves
AND calib_curves.date_achieve IS NULL
GROUP BY calib_curves.id;

CREATE VIEW view_show_calib_curve AS
SELECT calib_curves.id AS id, calib_curves.name,
       array_agg(DISTINCT daughter.id_mol) AS metabolite,     
       calib_curves.date_create, calib_curves.date_achieve,
       calib_curves.used as used
FROM calib_curves
LEFT JOIN daughter ON calib_curves.id = daughter.id_calib_curves
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

-- Increase the used number of calib_curves when a project use it
CREATE OR REPLACE FUNCTION increase_used_calib_curves()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE calib_curves
    SET used = used + 1
    WHERE calib_curves.id = NEW.id_calib_curves;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER increase_used_calib_curves_trigger
AFTER INSERT ON proj_calib_curves
FOR EACH ROW
EXECUTE FUNCTION increase_used_calib_curves();

-- Decrease the used number of calib_curves when dissociate a project from it
CREATE OR REPLACE FUNCTION decrease_used_calib_curves()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE calib_curves
    SET used = used - 1
    WHERE calib_curves.id = OLD.id_calib_curves;
    RETURN OLD;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER decrease_used_calib_curves_trigger
AFTER DELETE ON proj_calib_curves
FOR EACH ROW
EXECUTE FUNCTION decrease_used_calib_curves();


-- Ratio table is used to store coefficient and order to calculate concentration
-- of metabolites from the area 
CREATE TABLE ratio
(
  id_mol VARCHAR(52),
  id_project SERIAL REFERENCES project (id) ON DELETE CASCADE,
  coef FLOAT,
  ord FLOAT,
  PRIMARY KEY (id_mol, id_project)
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