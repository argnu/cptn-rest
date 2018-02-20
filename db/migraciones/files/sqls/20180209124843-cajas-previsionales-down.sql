DROP TABLE "caja_previsional";
DROP TABLE "profesional_caja_previsional";

ALTER TABLE "profesional" DROP COLUMN "jubilado";

ALTER TABLE "profesional" ADD COLUMN "poseeCajaPrevisional" BOOLEAN;
ALTER TABLE "profesional" ADD COLUMN "nombreCajaPrevisional" VARCHAR(45);
ALTER TABLE "profesional" ADD COLUMN "solicitaCajaPrevisional" BOOLEAN;

ALTER TABLE "comprobante_pago_tarjeta" DROP CONSTRAINT "comprobante_pago_tarjeta_comprobante_pago_fkey";

ALTER TABLE "solicitud" DROP COLUMN "numero";