 /*    SENTENCIAS DE ALTERACION DE TABLAS: NUEVAS COLUMNAS   */

ALTER TABLE "solicitud" DROP COLUMN "created_at";
ALTER TABLE "solicitud" DROP COLUMN "updated_at";
ALTER TABLE "matricula" DROP COLUMN "created_at";
ALTER TABLE "matricula" DROP COLUMN "updated_at";
ALTER TABLE "legajo" DROP COLUMN "created_at";
ALTER TABLE "legajo" DROP COLUMN "updated_at";
ALTER TABLE "comprobante" DROP COLUMN "created_at";
ALTER TABLE "comprobante" DROP COLUMN "updated_at";
ALTER TABLE "volante_pago" DROP COLUMN "created_at";
ALTER TABLE "volante_pago" DROP COLUMN "updated_at";