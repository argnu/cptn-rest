/* Replace with your SQL commands */

 /*    SENTENCIAS DE ALTERACION DE TABLAS: NUEVAS COLUMNAS   */

ALTER TABLE "formacion" ADD COLUMN "fechaEmision" date;
ALTER TABLE "formacion" ADD COLUMN "fechaEgreso" date;

UPDATE "formacion" SET "fechaEgreso"="fecha";

 /*    SENTENCIAS DE ALTERACION DE TABLAS: ELIMINACION DE COLUMNAS   */

ALTER TABLE "formacion" DROP COLUMN "fecha";