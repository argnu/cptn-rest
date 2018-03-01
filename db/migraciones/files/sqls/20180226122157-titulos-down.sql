
 /*    SENTENCIAS DE CREACION DE TABLAS   */

DROP TABLE "institucion_titulo";
DROP TABLE "titulo_incumbencia";
DROP TABLE "t_nivel_titulo";
DROP TABLE "profesional_titulo";

 /*    SENTENCIAS DE ALTERACION DE TABLAS: NUEVAS COLUMNAS   */

ALTER TABLE "institucion" DROP COLUMN "cue";
ALTER TABLE "institucion" DROP COLUMN "domicilio";