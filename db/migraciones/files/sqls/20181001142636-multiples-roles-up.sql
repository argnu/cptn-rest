CREATE TABLE IF NOT EXISTS "usuario_rol" ("id" serial PRIMARY KEY, "usuario" int NOT NULL, "rol" varchar(100) NOT NULL, FOREIGN KEY ( "usuario" ) REFERENCES "usuario" ( "id" ) ON DELETE CASCADE);
INSERT INTO usuario_rol (usuario, rol) SELECT id, rol FROM usuario;
ALTER TABLE "usuario" DROP COLUMN "rol";
