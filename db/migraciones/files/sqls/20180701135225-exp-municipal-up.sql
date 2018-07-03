ALTER TABLE "t_comprobante" ALTER COLUMN "activo" SET DEFAULT 'true';
ALTER TABLE "t_formapago" ALTER COLUMN "activo" SET DEFAULT 'true';
ALTER TABLE "volante_pago" ALTER COLUMN "vencido" SET DEFAULT 'false';

ALTER TABLE "legajo" ADD COLUMN "expediente_municipal" varchar(45);

ALTER TABLE persona_fisica DROP CONSTRAINT "persona_fisica_id_fkey";
ALTER TABLE persona_fisica ADD FOREIGN KEY ("id") REFERENCES persona("id") ON DELETE CASCADE ;
ALTER TABLE persona_juridica DROP CONSTRAINT "persona_juridica_id_fkey";
ALTER TABLE persona_juridica ADD FOREIGN KEY ("id") REFERENCES persona("id") ON DELETE CASCADE ;
ALTER TABLE legajo_comitente DROP CONSTRAINT "legajo_comitente_persona_fkey";
ALTER TABLE legajo_comitente ADD FOREIGN KEY ("persona") REFERENCES persona("id") ON DELETE CASCADE ;

