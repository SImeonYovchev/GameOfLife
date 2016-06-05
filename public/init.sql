CREATE DATABASE gameoflife
	WITH OWNER = syovchev
		ENCODING = 'UTF8'
		TABLESPACE = pg_default
		LC_COLLATE = 'en_US.UTF-8'
		LC_CTYPE = 'en_US.UTF-8'
		CONNECTION LIMIT = -1;
GRANT ALL ON DATABASE gameoflife TO syovchev;


CREATE EXTENSION "uuid-ossp";


CREATE TABLE seed
(
  id uuid NOT NULL,
  name text,
  width integer,
  height integer,
  CONSTRAINT seed_pkey PRIMARY KEY (id),
  CONSTRAINT seed_name_key UNIQUE (name)
);
ALTER TABLE seed
  OWNER TO syovchev;


CREATE TABLE seed_alive_cell
(
	id uuid NOT NULL,
	seed_id uuid NOT NULL,
	x integer,
	y integer,
	CONSTRAINT seed_alive_cell_pkey PRIMARY KEY (id),
	CONSTRAINT fk_seed_alive_cell FOREIGN KEY (seed_id)
		REFERENCES public.seed (id) MATCH SIMPLE
		ON UPDATE NO ACTION ON DELETE NO ACTION
)
ALTER TABLE seed_alive_cell
  OWNER TO syovchev;