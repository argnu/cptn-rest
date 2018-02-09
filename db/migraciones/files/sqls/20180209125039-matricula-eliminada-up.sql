CREATE TABLE "t_estadosolicitud" ("id" serial PRIMARY KEY, "valor" varchar(255) NOT NULL);

ALTER TABLE "delegacion" ADD COLUMN "domicilio" int;
ALTER TABLE "t_estadomatricula" ADD COLUMN "eliminado" boolean;
ALTER TABLE "matricula" ADD COLUMN "eliminado" boolean;

/* AGREGAR ESTADO DE SOLICITUD */
INSERT INTO t_estadosolicitud (id, valor) VALUES (1, 'Pendiente');
INSERT INTO t_estadosolicitud (id, valor) VALUES (2, 'Aprobada');
INSERT INTO t_estadosolicitud (id, valor) VALUES (3, 'Rechazada');
UPDATE solicitud SET estado = '1' WHERE estado = 'pendiente';
UPDATE solicitud SET estado = '2' WHERE estado = 'aprobada';

/* MATRICULAS Y ESTADOS DE MATRICULA OBSOLETOS */
UPDATE matricula SET eliminado=false;
UPDATE t_estadomatricula SET eliminado=false;

UPDATE matricula SET eliminado=true WHERE "numeroMatricula" LIKE 'IN%';
UPDATE matricula SET eliminado=true WHERE "numeroMatricula" LIKE 'ARQ%';
UPDATE matricula SET eliminado=true WHERE "numeroMatricula" LIKE 'AGR%';
UPDATE matricula SET eliminado=true WHERE "numeroMatricula" LIKE 'GEO%';

UPDATE t_estadomatricula SET eliminado=true WHERE id=10;
UPDATE t_estadomatricula SET eliminado=true WHERE id=11;
UPDATE t_estadomatricula SET eliminado=true WHERE id=12;
UPDATE t_estadomatricula SET eliminado=true WHERE id=15;
UPDATE t_estadomatricula SET eliminado=true WHERE id=16;
UPDATE t_estadomatricula SET eliminado=true WHERE id=26;
UPDATE t_estadomatricula SET eliminado=true WHERE id=23;
UPDATE t_estadomatricula SET eliminado=true WHERE id=24;
UPDATE t_estadomatricula SET eliminado=true WHERE id=21;
UPDATE t_estadomatricula SET eliminado=true WHERE id=22;
UPDATE t_estadomatricula SET eliminado=true WHERE id=27;
UPDATE t_estadomatricula SET eliminado=true WHERE id=28;
UPDATE t_estadomatricula SET eliminado=true WHERE id=29;
UPDATE t_estadomatricula SET eliminado=true WHERE id=30;
UPDATE t_estadomatricula SET eliminado=true WHERE id=31;
UPDATE t_estadomatricula SET eliminado=true WHERE id=31;
UPDATE t_estadomatricula SET eliminado=true WHERE id=32;
UPDATE t_estadomatricula SET eliminado=true WHERE id=33;
UPDATE t_estadomatricula SET eliminado=true WHERE id=34;


ALTER TABLE "delegacion" ADD FOREIGN KEY("domicilio") REFERENCES domicilio("id");
ALTER TABLE "solicitud" ALTER COLUMN "estado" TYPE integer USING "estado"::integer;
ALTER TABLE "solicitud" DROP COLUMN "exencionArt10";
ALTER TABLE "solicitud" DROP COLUMN "exencionArt6";
ALTER TABLE "solicitud" ADD FOREIGN KEY("estado") REFERENCES t_estadosolicitud("id");