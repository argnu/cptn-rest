CREATE TABLE "caja_previsional" ("id" serial PRIMARY KEY, "nombre" varchar(100) NOT NULL);
CREATE TABLE "profesional_caja_previsional" ("id" serial PRIMARY KEY, "profesional" int NOT NULL, "caja" int NOT NULL, FOREIGN KEY ( "profesional" ) REFERENCES "profesional" ( "id" ), FOREIGN KEY ( "caja" ) REFERENCES "caja_previsional" ( "id" ));

ALTER TABLE "profesional" ADD COLUMN "jubilado" boolean;

ALTER TABLE "profesional" DROP COLUMN "poseeCajaPrevisional";
ALTER TABLE "profesional" DROP COLUMN "nombreCajaPrevisional";
ALTER TABLE "profesional" DROP COLUMN "solicitaCajaPrevisional";

ALTER TABLE "comprobante_pago_tarjeta" ADD FOREIGN KEY("id") REFERENCES comprobante_pago("id");

ALTER TABLE "solicitud" ADD COLUMN "numero" serial