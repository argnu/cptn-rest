 /*    SENTENCIAS DE CREACION DE TABLAS   */

DROP TABLE "entidad_condicion_afip";

 /*    SENTENCIAS DE ALTERACION DE TABLAS: ELIMINACION DE COLUMNAS   */

ALTER TABLE "entidad" ADD COLUMN "condafip" INT REFERENCES t_condicionafip("id") ON UPDATE CASCADE ON DELETE SET NULL;
ALTER TABLE "profesional" ADD COLUMN "jubilado" BOOLEAN;


DELETE FROM t_estadomatricula WHERE valor='Jubilado';