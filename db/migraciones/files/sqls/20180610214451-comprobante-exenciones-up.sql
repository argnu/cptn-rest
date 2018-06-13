CREATE TABLE IF NOT EXISTS "comprobante_exencion" ("id" serial PRIMARY KEY, "tipo" int NOT NULL, "boleta" int NOT NULL, "importe" float NOT NULL, "documento" int, "matricula" int NOT NULL, "fecha" date NOT NULL, "delegacion" int, "created_by" int, "created_at" timestamptz DEFAULT 'now', FOREIGN KEY ( "tipo" ) REFERENCES "t_comprobante" ( "id" ), FOREIGN KEY ( "boleta" ) REFERENCES "boleta" ( "id" ), FOREIGN KEY ( "matricula" ) REFERENCES "matricula" ( "id" ) ON DELETE CASCADE, FOREIGN KEY ( "documento" ) REFERENCES "documento" ( "id" ), FOREIGN KEY ( "created_by" ) REFERENCES "usuario" ( "id" ));

ALTER TABLE "t_comprobante" ADD COLUMN "deudor" boolean;

UPDATE "t_comprobante" SET deudor=false;
UPDATE "t_comprobante" SET deudor=true WHERE id in (10,12,13,15,16,17,18,19);
UPDATE "t_comprobante" SET descripcion='Deuda Condonada' WHERE id=6;
INSERT INTO "t_comprobante" (id, abreviatura, descripcion,deudor) VALUES (21,'BON','Bonificación de Aportes',false);

ALTER TABLE "profesional" ADD COLUMN "updated_at" timestamptz;
ALTER TABLE "profesional" ADD COLUMN "updated_by" int;

ALTER TABLE "caja_previsional" ADD CONSTRAINT "caja_previsional_nombre_key" UNIQUE ("nombre");
ALTER TABLE "profesional" ADD FOREIGN KEY("updated_by") REFERENCES usuario("id");