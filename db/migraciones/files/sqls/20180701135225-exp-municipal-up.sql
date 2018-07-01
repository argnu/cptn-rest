ALTER TABLE "t_comprobante" ALTER COLUMN "activo" SET DEFAULT 'true';
ALTER TABLE "t_formapago" ALTER COLUMN "activo" SET DEFAULT 'true';
ALTER TABLE "volante_pago" ALTER COLUMN "vencido" SET DEFAULT 'false';

ALTER TABLE "legajo" ADD COLUMN "expediente_municipal" varchar(45);