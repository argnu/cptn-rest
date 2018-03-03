/*  AGREGAR ESTADO DE MATRICULA JUBILADO */

INSERT INTO t_estadomatricula (valor) VALUES ('Jubilado');


 /*    SENTENCIAS DE CREACION DE TABLAS   */

CREATE TABLE "t_documento" ("id" serial PRIMARY KEY, "valor" varchar(255) NOT NULL);
CREATE TABLE "documento" ("id" serial PRIMARY KEY, "tipo" int NOT NULL, "numero" varchar(10) NOT NULL, "fecha" date NOT NULL, FOREIGN KEY ( "tipo" ) REFERENCES "t_documento" ( "id" ));
CREATE TABLE "matricula_historial" ("id" serial PRIMARY KEY, "matricula" int NOT NULL, "estado" int NOT NULL, "documento" int NOT NULL, "fecha" date NOT NULL, "usuario" varchar(45) NOT NULL, FOREIGN KEY ( "matricula" ) REFERENCES "matricula" ( "id" ), FOREIGN KEY ( "estado" ) REFERENCES "t_estadomatricula" ( "id" ), FOREIGN KEY ( "documento" ) REFERENCES "documento" ( "id" ), FOREIGN KEY ( "usuario" ) REFERENCES "usuario" ( "id" ));

INSERT INTO "t_documento" ("valor") VALUES ('Resolución');
INSERT INTO "t_documento" ("valor") VALUES ('Acta');
INSERT INTO "t_documento" ("valor") VALUES ('Acta Especial');
INSERT INTO "t_documento" ("valor") VALUES ('Acta de Asamblea Ordinaria');