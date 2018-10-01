UPDATE "empresa_representante" SET tipo='tecnico' WHERE tipo='primario';
UPDATE "empresa_representante" SET tipo='legal' WHERE tipo='secundario';

CREATE TABLE IF NOT EXISTS "empresa_incumbencia" ("id" serial PRIMARY KEY, "empresa" int NOT NULL, "incumbencia" int NOT NULL, FOREIGN KEY ( "empresa" ) REFERENCES "empresa" ( "id" ) ON DELETE CASCADE, FOREIGN KEY ( "incumbencia" ) REFERENCES "t_incumbencia" ( "id" ));

ALTER TABLE "t_condicionafip" ADD COLUMN "t_entidad" varchar(45);
UPDATE "t_condicionafip" SET t_entidad='todas';
UPDATE "t_condicionafip" SET t_entidad='profesional' WHERE id IN (7,8,9);
ALTER SEQUENCE "t_condicionafip_id_seq" RESTART WITH 10;
INSERT INTO "t_condicionafip" (valor, t_entidad) VALUES ('Consumidor Final','empresa');
INSERT INTO "t_condicionafip" (valor, t_entidad) VALUES ('Exento','empresa');

INSERT INTO "t_variable_global" (id, nombre, descripcion) VALUES (7, 'inscripcion_empresa_neuquen', 'Importe de Inscripción Empresas Neuquén');
INSERT INTO "t_variable_global" (id, nombre, descripcion) VALUES (8, 'inscripcion_empresa_limitrofe', 'Importe de Inscripción Empresas Limítrofes');
INSERT INTO "t_variable_global" (id, nombre, descripcion) VALUES (9, 'inscripcion_empresa_otras', 'Importe de Inscripción Empresas Otras Provincias');
INSERT INTO "valores_globales" (variable, fecha_inicio, fecha_fin, valor) VALUES (7, '2018-01-01', '2018-12-31', '5280');
INSERT INTO "valores_globales" (variable, fecha_inicio, fecha_fin, valor) VALUES (8, '2018-01-01', '2018-12-31', '7920');
INSERT INTO "valores_globales" (variable, fecha_inicio, fecha_fin, valor) VALUES (9, '2018-01-01', '2018-12-31', '9600');

INSERT INTO "t_variable_global" (id, nombre, descripcion) VALUES (10, 'derecho_anual_empresa_neuquen', 'Derecho de Inscripción Anual Empresas Neuquén');
INSERT INTO "t_variable_global" (id, nombre, descripcion) VALUES (11, 'derecho_anual_empresa_limitrofe', 'Derecho de Inscripción Anual Empresas Limítrofes');
INSERT INTO "t_variable_global" (id, nombre, descripcion) VALUES (12, 'derecho_anual_empresa_otras', 'Derecho de Inscripción Anual Empresas Otras Provincias');
INSERT INTO "valores_globales" (variable, fecha_inicio, fecha_fin, valor) VALUES (10, '2018-01-01', '2018-12-31', '5760');
INSERT INTO "valores_globales" (variable, fecha_inicio, fecha_fin, valor) VALUES (11, '2018-01-01', '2018-12-31', '8640');
INSERT INTO "valores_globales" (variable, fecha_inicio, fecha_fin, valor) VALUES (12, '2018-01-01', '2018-12-31', '11520');