CREATE TABLE IF NOT EXISTS "t_legajo" ("id" serial PRIMARY KEY, "valor" varchar(255) NOT NULL);
INSERT INTO "t_legajo" (id, valor) VALUES (1, 'Permiso de Construcción');
INSERT INTO "t_legajo" (id, valor) VALUES (2, 'Orden de Trabajo');
INSERT INTO "t_legajo" (id, valor) VALUES (3, 'Legajo Técnico');


UPDATE "legajo" SET tipo=NULL WHERE tipo=0;
ALTER TABLE "legajo" ADD FOREIGN KEY("tipo") REFERENCES t_legajo("id");

ALTER TABLE "t_comprobante" ALTER COLUMN "activo" SET DEFAULT 'true';
ALTER TABLE "t_formapago" ALTER COLUMN "activo" SET DEFAULT 'true';
ALTER TABLE "volante_pago" ALTER COLUMN "vencido" SET DEFAULT 'false';
ALTER TABLE "boleta" ADD COLUMN "legajo" int;
ALTER TABLE "boleta" ADD FOREIGN KEY("legajo") REFERENCES legajo("id") ON DELETE cascade;
ALTER TABLE "matricula_historial" ALTER COLUMN documento SET NOT NULL;

ALTER TABLE usuario_delegacion DROP CONSTRAINT "usuario_delegacion_usuario_fkey";
ALTER TABLE usuario_delegacion ADD FOREIGN KEY ("usuario") REFERENCES usuario("id") ON DELETE CASCADE ;
-- Elimino usuarios inservibles
DELETE FROM usuario where id in(9, 19, 21);
ALTER TABLE "usuario" ADD CONSTRAINT "usuario_username_key" UNIQUE ("username");

DO $$
DECLARE
  r_boleta RECORD;
  id_legajo INT;
BEGIN
    FOR r_boleta IN SELECT * FROM boleta WHERE tipo_comprobante=15
    LOOP
    	SELECT id INTO id_legajo FROM legajo WHERE numero_legajo=r_boleta.numero_solicitud;
        UPDATE boleta SET legajo=id_legajo WHERE id=r_boleta.id;
    END LOOP;
END$$;

ALTER TABLE "boleta" DROP COLUMN "numero_solicitud";

UPDATE "boleta" SET tipo_comprobante=20 WHERE tipo_comprobante=15 AND fecha>='2018-01-01';