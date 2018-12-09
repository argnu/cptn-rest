
ALTER TABLE "empresa_representante" ADD COLUMN "persona" int;
ALTER TABLE "empresa_representante" ADD FOREIGN KEY("persona") REFERENCES persona_fisica("id");
ALTER TABLE "empresa_representante" DROP COLUMN "matricula_externa";
DROP TABLE IF EXISTS "matricula_externa";
