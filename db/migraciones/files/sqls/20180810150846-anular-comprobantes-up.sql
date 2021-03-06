INSERT INTO t_estadoboleta VALUES (11, 'Anulada');
INSERT INTO t_variable_global VALUES (6, 'vencimiento_dias', 'Cantidad de Días para Vencimiento de Boletas');
INSERT INTO valores_globales (valor, variable, fecha_inicio, fecha_fin) VALUES (120, 6, '2018-01-01', '2018-12-31');

ALTER TABLE "t_comprobante" ALTER COLUMN "activo" SET DEFAULT true;
ALTER TABLE "t_formapago" ALTER COLUMN "activo" SET DEFAULT true;
ALTER TABLE "volante_pago" ALTER COLUMN "vencido" SET DEFAULT false;


 /*    SENTENCIAS DE ALTERACION DE TABLAS: NUEVAS COLUMNAS   */

ALTER TABLE "boleta" ADD COLUMN "created_by" int;
ALTER TABLE "boleta" ADD COLUMN "updated_by" int;
ALTER TABLE "boleta" ADD COLUMN "created_at" timestamptz DEFAULT CURRENT_DATE;
ALTER TABLE "boleta" ADD COLUMN "updated_at" timestamptz DEFAULT CURRENT_DATE;
ALTER TABLE "volante_pago" ADD COLUMN "estado" int;

UPDATE volante_pago SET estado=2 WHERE pagado=true;
UPDATE volante_pago SET estado=1 WHERE pagado=false;
ALTER TABLE "volante_pago" DROP COLUMN "pagado";


 /*    SENTENCIAS DE ALTERACION DE TABLAS: FOREIGN KEYS   */

ALTER TABLE "boleta" ADD FOREIGN KEY("created_by") REFERENCES usuario("id") ON UPDATE CASCADE ;
ALTER TABLE "boleta" ADD FOREIGN KEY("updated_by") REFERENCES usuario("id") ON UPDATE CASCADE ;
ALTER TABLE "volante_pago" ADD FOREIGN KEY("estado") REFERENCES t_estadoboleta("id");