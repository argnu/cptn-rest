 /*    SENTENCIAS DE CREACION DE TABLAS   */

CREATE TABLE "entidad_condicion_afip" ("id" serial PRIMARY KEY, "entidad" int NOT NULL, "condicion_afip" int NOT NULL, "descripcion" text, FOREIGN KEY ( "entidad" ) REFERENCES "entidad" ( "id" ), FOREIGN KEY ( "condicion_afip" ) REFERENCES "t_condicionafip" ( "id" ));

 /*    SENTENCIAS DE ALTERACION DE TABLAS: ELIMINACION DE COLUMNAS   */

ALTER TABLE "entidad" DROP COLUMN "condafip";
ALTER TABLE "profesional" DROP COLUMN "jubilado";

INSERT INTO t_estadomatricula (valor) VALUES ('Jubilado');