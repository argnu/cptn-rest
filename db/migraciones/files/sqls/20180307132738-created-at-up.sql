 /*    SENTENCIAS DE ALTERACION DE TABLAS: NUEVAS COLUMNAS   */

ALTER TABLE "solicitud" ADD COLUMN "created_at" timestamptz DEFAULT 'now' ;
ALTER TABLE "solicitud" ADD COLUMN "updated_at" timestamptz DEFAULT 'now' ;
ALTER TABLE "matricula" ADD COLUMN "created_at" timestamptz DEFAULT 'now' ;
ALTER TABLE "matricula" ADD COLUMN "updated_at" timestamptz DEFAULT 'now' ;
ALTER TABLE "legajo" ADD COLUMN "created_at" timestamptz DEFAULT 'now' ;
ALTER TABLE "legajo" ADD COLUMN "updated_at" timestamptz DEFAULT 'now' ;
ALTER TABLE "comprobante" ADD COLUMN "created_at" timestamptz DEFAULT 'now' ;
ALTER TABLE "comprobante" ADD COLUMN "updated_at" timestamptz DEFAULT 'now' ;
ALTER TABLE "volante_pago" ADD COLUMN "created_at" timestamptz DEFAULT 'now' ;
ALTER TABLE "volante_pago" ADD COLUMN "updated_at" timestamptz DEFAULT 'now' ;