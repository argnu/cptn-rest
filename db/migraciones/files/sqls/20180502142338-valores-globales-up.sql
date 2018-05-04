CREATE TABLE "t_variable_global" ("id" serial PRIMARY KEY, "nombre" varchar(45), "descripcion" varchar(255));

INSERT INTO "t_variable_global" ("nombre", "descripcion") VALUES ('matriculacion_importe', 'Importe de Inscripción de Matrícula');
insert into t_variable_global (nombre, descripcion) values ('matriculacion_comprobante', 'Tipo de Comprobante de Matriculación');
insert into t_variable_global (nombre, descripcion) values ('interes_tasa', 'Tasa de Interés Activa');
insert into t_variable_global (nombre, descripcion) values ('interes_dias', 'Cantidad de Días para la Tasa de Interés Activa');

ALTER TABLE "valores_globales" ADD COLUMN "variable" int;
ALTER TABLE "valores_globales" ADD FOREIGN KEY("variable") REFERENCES t_variable_global("id");
ALTER TABLE "valores_globales" DROP COLUMN "nombre";
ALTER TABLE "valores_globales" DROP COLUMN "descripcion";
ALTER TABLE "valores_globales" ALTER COLUMN "fecha" TYPE timestamp USING "fecha"::timestamp;

UPDATE "valores_globales" SET variable=1;

insert into valores_globales (fecha, valor, variable) values (now(), 2.8, 3);
insert into valores_globales (fecha, valor, variable) values (now(), 30, 4);
insert into valores_globales (fecha, valor, variable) values (now(), 18, 2);
