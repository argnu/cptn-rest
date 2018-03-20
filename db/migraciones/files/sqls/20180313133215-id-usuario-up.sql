
ALTER TABLE "usuario" ADD COLUMN "activo" boolean DEFAULT true;
ALTER TABLE "usuario" ADD COLUMN "username" varchar(45);
UPDATE "usuario" SET "username"="id";

ALTER TABLE solicitud DROP CONSTRAINT "solicitud_created_by_fkey";
ALTER TABLE solicitud ADD FOREIGN KEY ("created_by") REFERENCES usuario("id") ON UPDATE CASCADE ;
ALTER TABLE solicitud DROP CONSTRAINT "solicitud_updated_by_fkey";
ALTER TABLE solicitud ADD FOREIGN KEY ("updated_by") REFERENCES usuario("id") ON UPDATE CASCADE ;
ALTER TABLE matricula DROP CONSTRAINT "matricula_created_by_fkey";
ALTER TABLE matricula ADD FOREIGN KEY ("created_by") REFERENCES usuario("id") ON UPDATE CASCADE ;
ALTER TABLE matricula DROP CONSTRAINT "matricula_updated_by_fkey";
ALTER TABLE matricula ADD FOREIGN KEY ("updated_by") REFERENCES usuario("id") ON UPDATE CASCADE ;
ALTER TABLE legajo DROP CONSTRAINT "legajo_created_by_fkey";
ALTER TABLE legajo ADD FOREIGN KEY ("created_by") REFERENCES usuario("id") ON UPDATE CASCADE ;
ALTER TABLE legajo DROP CONSTRAINT "legajo_updated_by_fkey";
ALTER TABLE legajo ADD FOREIGN KEY ("updated_by") REFERENCES usuario("id") ON UPDATE CASCADE ;
ALTER TABLE comprobante DROP CONSTRAINT "comprobante_created_by_fkey";
ALTER TABLE comprobante ADD FOREIGN KEY ("created_by") REFERENCES usuario("id") ON UPDATE CASCADE ;
ALTER TABLE comprobante DROP CONSTRAINT "comprobante_updated_by_fkey";
ALTER TABLE comprobante ADD FOREIGN KEY ("updated_by") REFERENCES usuario("id") ON UPDATE CASCADE ;
ALTER TABLE volante_pago DROP CONSTRAINT "volante_pago_created_by_fkey";
ALTER TABLE volante_pago ADD FOREIGN KEY ("created_by") REFERENCES usuario("id") ON UPDATE CASCADE ;
ALTER TABLE volante_pago DROP CONSTRAINT "volante_pago_updated_by_fkey";
ALTER TABLE volante_pago ADD FOREIGN KEY ("updated_by") REFERENCES usuario("id") ON UPDATE CASCADE ;
ALTER TABLE usuario_delegacion DROP CONSTRAINT "usuario_delegacion_usuario_fkey";
ALTER TABLE usuario_delegacion ADD FOREIGN KEY ("usuario") REFERENCES usuario("id") ON UPDATE CASCADE ;
ALTER TABLE matricula_historial DROP CONSTRAINT "matricula_historial_usuario_fkey";
ALTER TABLE matricula_historial ADD FOREIGN KEY ("usuario") REFERENCES usuario("id") ON UPDATE CASCADE ;

UPDATE "usuario" SET "id"='1' WHERE "id"='invitado';
UPDATE "usuario" SET "id"='2' WHERE "id"='BUSCHARAF';
UPDATE "usuario" SET "id"='3' WHERE "id"='CABRERAM';
UPDATE "usuario" SET "id"='4' WHERE "id"='GASPARROL';
UPDATE "usuario" SET "id"='5' WHERE "id"='GENTILED';
UPDATE "usuario" SET "id"='6' WHERE "id"='GONZALESGA';
UPDATE "usuario" SET "id"='7' WHERE "id"='HERNANDEZN';
UPDATE "usuario" SET "id"='8' WHERE "id"='BILBAOD';
UPDATE "usuario" SET "id"='9' WHERE "id"='LASTRAD';
UPDATE "usuario" SET "id"='10' WHERE "id"='MARQUEZM';
UPDATE "usuario" SET "id"='11' WHERE "id"='VALDEZA';
UPDATE "usuario" SET "id"='12' WHERE "id"='FEDELEF';
UPDATE "usuario" SET "id"='13' WHERE "id"='BARBAGELATAL';
UPDATE "usuario" SET "id"='14', "admin"=true WHERE "id"='BRAVOL';
UPDATE "usuario" SET "id"='15', "admin"=true WHERE "id"='HUENCHUMANN';
UPDATE "usuario" SET "id"='16', "admin"=true WHERE "id"='WEINGARTM';
UPDATE "usuario" SET "id"='17', "admin"=true WHERE "id"='AMPRINOV';


ALTER TABLE solicitud DROP CONSTRAINT "solicitud_created_by_fkey";
ALTER TABLE solicitud DROP CONSTRAINT "solicitud_updated_by_fkey";
ALTER TABLE matricula DROP CONSTRAINT "matricula_created_by_fkey";
ALTER TABLE matricula DROP CONSTRAINT "matricula_updated_by_fkey";
ALTER TABLE legajo DROP CONSTRAINT "legajo_created_by_fkey";
ALTER TABLE legajo DROP CONSTRAINT "legajo_updated_by_fkey";
ALTER TABLE comprobante DROP CONSTRAINT "comprobante_created_by_fkey";
ALTER TABLE comprobante DROP CONSTRAINT "comprobante_updated_by_fkey";
ALTER TABLE volante_pago DROP CONSTRAINT "volante_pago_created_by_fkey";
ALTER TABLE volante_pago DROP CONSTRAINT "volante_pago_updated_by_fkey";
ALTER TABLE usuario_delegacion DROP CONSTRAINT "usuario_delegacion_usuario_fkey";
ALTER TABLE matricula_historial DROP CONSTRAINT "matricula_historial_usuario_fkey";


ALTER TABLE "usuario" ALTER COLUMN "id" TYPE integer USING "id"::integer;

CREATE SEQUENCE IF NOT EXISTS "usuario_id_seq";
ALTER SEQUENCE "usuario_id_seq" OWNED BY usuario.id;
ALTER TABLE "usuario" ALTER COLUMN "id" SET DEFAULT nextval('usuario_id_seq'::regclass);
ALTER SEQUENCE "usuario_id_seq" RESTART WITH 18;

ALTER TABLE "solicitud" ALTER COLUMN "created_by" TYPE integer USING "created_by"::integer;
ALTER TABLE "solicitud" ALTER COLUMN "updated_by" TYPE integer USING "updated_by"::integer;
ALTER TABLE "matricula" ALTER COLUMN "created_by" TYPE integer USING "created_by"::integer;
ALTER TABLE "matricula" ALTER COLUMN "updated_by" TYPE integer USING "updated_by"::integer;
ALTER TABLE "legajo" ALTER COLUMN "created_by" TYPE integer USING "created_by"::integer;
ALTER TABLE "legajo" ALTER COLUMN "updated_by" TYPE integer USING "updated_by"::integer;
ALTER TABLE "comprobante" ALTER COLUMN "created_by" TYPE integer USING "created_by"::integer;
ALTER TABLE "comprobante" ALTER COLUMN "updated_by" TYPE integer USING "updated_by"::integer;
ALTER TABLE "volante_pago" ALTER COLUMN "created_by" TYPE integer USING "created_by"::integer;
ALTER TABLE "volante_pago" ALTER COLUMN "updated_by" TYPE integer USING "updated_by"::integer;
ALTER TABLE "usuario_delegacion" ALTER COLUMN "usuario" TYPE integer USING "usuario"::integer;
ALTER TABLE "matricula_historial" ALTER COLUMN "usuario" TYPE integer USING "usuario"::integer;


ALTER TABLE solicitud ADD FOREIGN KEY ("created_by") REFERENCES usuario("id")  ON UPDATE CASCADE ;
ALTER TABLE solicitud ADD FOREIGN KEY ("updated_by") REFERENCES usuario("id")  ON UPDATE CASCADE ;
ALTER TABLE matricula ADD FOREIGN KEY ("created_by") REFERENCES usuario("id")  ON UPDATE CASCADE ;
ALTER TABLE matricula ADD FOREIGN KEY ("updated_by") REFERENCES usuario("id") ON UPDATE CASCADE ;
ALTER TABLE legajo ADD FOREIGN KEY ("created_by") REFERENCES usuario("id") ON UPDATE CASCADE ;
ALTER TABLE legajo ADD FOREIGN KEY ("updated_by") REFERENCES usuario("id") ON UPDATE CASCADE ;
ALTER TABLE comprobante ADD FOREIGN KEY ("created_by") REFERENCES usuario("id") ON UPDATE CASCADE ;
ALTER TABLE comprobante ADD FOREIGN KEY ("updated_by") REFERENCES usuario("id") ON UPDATE CASCADE ;
ALTER TABLE volante_pago ADD FOREIGN KEY ("created_by") REFERENCES usuario("id") ON UPDATE CASCADE ;
ALTER TABLE volante_pago ADD FOREIGN KEY ("updated_by") REFERENCES usuario("id") ON UPDATE CASCADE ;
ALTER TABLE usuario_delegacion ADD FOREIGN KEY ("usuario") REFERENCES usuario("id") ON UPDATE CASCADE ;
ALTER TABLE matricula_historial ADD FOREIGN KEY ("usuario") REFERENCES usuario("id") ON UPDATE CASCADE ;