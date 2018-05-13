CREATE TABLE IF NOT EXISTS "t_variable_global" ("id" serial PRIMARY KEY, "nombre" varchar(45), "descripcion" varchar(255));
CREATE TABLE IF NOT EXISTS "t_movimiento_matricula" ("id" serial PRIMARY KEY, "valor" varchar(255) NOT NULL);
CREATE TABLE IF NOT EXISTS "matricula_movimiento" ("id" serial PRIMARY KEY, "matricula" int NOT NULL, "movimiento" int NOT NULL, "documento" int, "created_at" date NOT NULL, "created_by" int, FOREIGN KEY ( "matricula" ) REFERENCES "matricula" ( "id" ) ON DELETE CASCADE, FOREIGN KEY ( "movimiento" ) REFERENCES "t_movimiento_matricula" ( "id" ), FOREIGN KEY ( "documento" ) REFERENCES "documento" ( "id" ), FOREIGN KEY ( "created_by" ) REFERENCES "usuario" ( "id" ) ON UPDATE CASCADE);

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


ALTER TABLE "institucion" ADD COLUMN "valida" boolean DEFAULT 'true' ;
ALTER TABLE "profesional" ADD COLUMN "jubilado" boolean;

ALTER TABLE institucion_titulo DROP CONSTRAINT "institucion_titulo_institucion_fkey";
ALTER TABLE institucion_titulo ADD FOREIGN KEY ("institucion") REFERENCES institucion("id") ON DELETE CASCADE ;
ALTER TABLE matricula_historial DROP CONSTRAINT "matricula_historial_matricula_fkey";
ALTER TABLE matricula_historial ADD FOREIGN KEY ("matricula") REFERENCES matricula("id") ON DELETE CASCADE ;
ALTER TABLE profesional_caja_previsional DROP CONSTRAINT "profesional_caja_previsional_profesional_fkey";
ALTER TABLE profesional_caja_previsional ADD FOREIGN KEY ("profesional") REFERENCES profesional("id") ON DELETE CASCADE ;
ALTER TABLE profesional_titulo DROP CONSTRAINT "profesional_titulo_profesional_fkey";
ALTER TABLE profesional_titulo ADD FOREIGN KEY ("profesional") REFERENCES profesional("id") ON DELETE CASCADE ;
ALTER TABLE subsidiario DROP CONSTRAINT "subsidiario_profesional_fkey";
ALTER TABLE subsidiario ADD FOREIGN KEY ("profesional") REFERENCES profesional("id") ON DELETE CASCADE ;
ALTER TABLE legajo_item DROP CONSTRAINT "legajo_item_legajo_fkey";
ALTER TABLE legajo_item ADD FOREIGN KEY ("legajo") REFERENCES legajo("id") ON DELETE CASCADE ;
ALTER TABLE legajo_comitente DROP CONSTRAINT "legajo_comitente_legajo_fkey";
ALTER TABLE legajo_comitente ADD FOREIGN KEY ("legajo") REFERENCES legajo("id") ON DELETE CASCADE ;
ALTER TABLE comprobante_item DROP CONSTRAINT "comprobante_item_comprobante_fkey";
ALTER TABLE comprobante_item ADD FOREIGN KEY ("comprobante") REFERENCES comprobante("id") ON DELETE CASCADE ;
ALTER TABLE comprobante_pago DROP CONSTRAINT "comprobante_pago_comprobante_fkey";
ALTER TABLE comprobante_pago ADD FOREIGN KEY ("comprobante") REFERENCES comprobante("id") ON DELETE CASCADE ;
ALTER TABLE comprobante_pago_cheque DROP CONSTRAINT "comprobante_pago_cheque_id_fkey";
ALTER TABLE comprobante_pago_cheque ADD FOREIGN KEY ("id") REFERENCES comprobante_pago("id") ON DELETE CASCADE ;
ALTER TABLE comprobante_pago_tarjeta DROP CONSTRAINT "comprobante_pago_tarjeta_id_fkey";
ALTER TABLE comprobante_pago_tarjeta ADD FOREIGN KEY ("id") REFERENCES comprobante_pago("id") ON DELETE CASCADE ;
ALTER TABLE volante_pago_boleta DROP CONSTRAINT "volante_pago_boleta_volante_fkey";
ALTER TABLE volante_pago_boleta ADD FOREIGN KEY ("volante") REFERENCES volante_pago("id") ON DELETE CASCADE ;
ALTER TABLE "valores_globales" ADD FOREIGN KEY("variable") REFERENCES t_variable_global("id");

ALTER TABLE titulo_incumbencia DROP CONSTRAINT "titulo_incumbencia_titulo_fkey";
ALTER TABLE titulo_incumbencia ADD FOREIGN KEY ("titulo") REFERENCES institucion_titulo("id") ON DELETE CASCADE ;

DROP TABLE "beneficiariocaja";
DROP TABLE "empresa_incumbencia";
