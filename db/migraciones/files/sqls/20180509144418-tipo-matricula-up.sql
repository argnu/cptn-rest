CREATE TABLE "t_matricula" ("id" serial PRIMARY KEY, "valor" varchar(255) NOT NULL, "jerarquia_titulo" int NOT NULL);

INSERT INTO t_matricula (id, valor, jerarquia_titulo) VALUES (1, 'TECA', 1);
INSERT INTO t_matricula (id, valor, jerarquia_titulo) VALUES (2, 'TEC-', 2);
INSERT INTO t_matricula (id, valor, jerarquia_titulo) VALUES (3, 'IDO', 3);

UPDATE institucion_titulo SET tipo_matricula='1' WHERE tipo_matricula='TECA';
UPDATE institucion_titulo SET tipo_matricula='2' WHERE tipo_matricula='TEC-';
UPDATE institucion_titulo SET tipo_matricula='3' WHERE tipo_matricula='IDO';
ALTER TABLE "institucion_titulo" ALTER COLUMN "tipo_matricula" TYPE integer USING "tipo_matricula"::integer;
ALTER TABLE "institucion_titulo" ALTER COLUMN "tipo_matricula" DROP NOT NULL;

ALTER TABLE "institucion_titulo" ADD FOREIGN KEY("tipo_matricula") REFERENCES t_matricula("id");
ALTER TABLE titulo_incumbencia DROP CONSTRAINT "titulo_incumbencia_titulo_fkey";
ALTER TABLE titulo_incumbencia ADD FOREIGN KEY ("titulo") REFERENCES institucion_titulo("id") ON DELETE CASCADE ;
ALTER TABLE matricula_historial DROP CONSTRAINT "matricula_historial_matricula_fkey";
ALTER TABLE matricula_historial ADD FOREIGN KEY ("matricula") REFERENCES matricula("id") ON DELETE CASCADE ;
ALTER TABLE matricula_movimiento DROP CONSTRAINT "matricula_movimiento_matricula_fkey";
ALTER TABLE matricula_movimiento ADD FOREIGN KEY ("matricula") REFERENCES matricula("id") ON DELETE CASCADE ;

ALTER TABLE "profesional_titulo" ADD COLUMN "principal" boolean;
ALTER TABLE "volante_pago" ADD COLUMN "vencido" boolean DEFAULT 'false';
