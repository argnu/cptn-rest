DROP "t_estadosolicitud";

ALTER TABLE "delegacion" DROP COLUMN "domicilio";
ALTER TABLE "t_estadomatricula" DROP COLUMN "eliminado";
ALTER TABLE "matricula" DROP COLUMN "eliminado";

ALTER TABLE "solicitud" ALTER COLUMN "estado" TYPE VARCHAR(45);
UPDATE solicitud SET estado = 'pendiente' WHERE estado = '1';
UPDATE solicitud SET estado = 'aprobada' WHERE estado = '2';

ALTER TABLE "solicitud" ADD COLUMN "exencionArt10" BOOLEAN;
ALTER TABLE "solicitud" ADD COLUMN "exencionArt6" BOOLEAN;
ALTER TABLE "solicitud" DROP CONSTRAINT solicitud_estado_fkey;