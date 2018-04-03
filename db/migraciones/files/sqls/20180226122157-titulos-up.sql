
 /*    SENTENCIAS DE CREACION DE TABLAS   */

CREATE TABLE "t_nivel_titulo" ("id" serial PRIMARY KEY, "valor" varchar(255) NOT NULL);
CREATE TABLE "institucion_titulo" ("id" serial PRIMARY KEY, "nombre" varchar(255) NOT NULL, "nivel" int NOT NULL, "tipo_matricula" varchar(10) NOT NULL, "valido" boolean NOT NULL DEFAULT TRUE, "institucion" int NOT NULL, FOREIGN KEY ( "nivel" ) REFERENCES "t_nivel_titulo" ( "id" ), FOREIGN KEY ( "institucion" ) REFERENCES "institucion" ( "id" ));
CREATE TABLE "titulo_incumbencia" ("id" serial PRIMARY KEY, "titulo" int NOT NULL, "incumbencia" int NOT NULL, FOREIGN KEY ( "titulo" ) REFERENCES "institucion_titulo" ( "id" ), FOREIGN KEY ( "incumbencia" ) REFERENCES "t_incumbencia" ( "id" ));
CREATE TABLE "profesional_titulo" ("id" serial PRIMARY KEY, "fechaEmision" date, "fechaEgreso" date, "titulo" int NOT NULL REFERENCES "institucion_titulo" ( "id" ), "profesional" int NOT NULL REFERENCES "profesional" ( "id" ));

 /*    SENTENCIAS DE ALTERACION DE TABLAS: NUEVAS COLUMNAS   */

ALTER TABLE "institucion" ADD COLUMN "cue" varchar(45);
ALTER TABLE "institucion" ADD COLUMN "domicilio" int REFERENCES domicilio("id");

INSERT INTO t_nivel_titulo (valor) VALUES ('Nivel Secundario Técnico');
INSERT INTO t_nivel_titulo (valor) VALUES ('Nivel Superior Técnico');
INSERT INTO t_nivel_titulo (valor) VALUES ('Profesional Afín - Universitario');
INSERT INTO t_nivel_titulo (valor) VALUES ('Profesional Afín - Terciario');
INSERT INTO t_nivel_titulo (valor) VALUES ('Curso de Especialización de Postgrado');
INSERT INTO t_nivel_titulo (valor) VALUES ('Curso de Especialización');