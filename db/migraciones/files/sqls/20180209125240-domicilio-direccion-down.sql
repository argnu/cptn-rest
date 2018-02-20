ALTER TABLE "domicilio" ADD COLUMN calle VARCHAR(100);
ALTER TABLE "domicilio" DROP COLUMN numero VARCHAR(45);

UPDATE domicilio SET calle = direccion;

ALTER TABLE "domicilio" DROP COLUMN "direccion";

ALTER TABLE "t_estadomatricula" ALTER COLUMN "eliminado" DROP DEFAULT;
ALTER TABLE "matricula" ALTER COLUMN "eliminado" DROP DEFAULT;