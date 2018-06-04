ALTER TABLE "t_comprobante" ADD COLUMN "activo" boolean DEFAULT 'true' ;
ALTER TABLE "t_formapago" ADD COLUMN "activo" boolean DEFAULT 'true' ;

UPDATE "t_formapago" SET activo=false WHERE id not in (9,38,7,34,37);

ALTER TABLE "valores_globales" ADD COLUMN "fecha_inicio" date;
ALTER TABLE "valores_globales" ADD COLUMN "fecha_fin" date;
ALTER TABLE "valores_globales" DROP COLUMN "fecha";

UPDATE "valores_globales" SET "fecha_inicio"='2018-01-01', "fecha_fin"='2018-12-31';

INSERT INTO "t_variable_global" (id, nombre, descripcion) VALUES (5, 'derecho_anual', 'Derecho de Inscripción Anual');
INSERT INTO "valores_globales" (variable, fecha_inicio, fecha_fin, valor) VALUES (5, '2018-01-01', '2018-12-31', '4440');

ALTER TABLE entidad_domicilio DROP CONSTRAINT "entidad_domicilio_entidad_fkey";
ALTER TABLE entidad_domicilio ADD FOREIGN KEY ("entidad") REFERENCES entidad("id") ON DELETE CASCADE ;
ALTER TABLE entidad_condicion_afip DROP CONSTRAINT "entidad_condicion_afip_entidad_fkey";
ALTER TABLE entidad_condicion_afip ADD FOREIGN KEY ("entidad") REFERENCES entidad("id") ON DELETE CASCADE ;

ALTER TABLE volante_pago_boleta DROP CONSTRAINT "volante_pago_boleta_boleta_fkey";
ALTER TABLE volante_pago_boleta ADD FOREIGN KEY ("boleta") REFERENCES boleta("id") ON DELETE CASCADE ;
