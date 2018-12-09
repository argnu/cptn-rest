ALTER TABLE "comprobante_exencion" ADD COLUMN "descripcion" varchar(255);
ALTER TABLE "comprobante_exencion" ALTER COLUMN "boleta" DROP NOT NULL;
ALTER TABLE "comprobante_exencion" ALTER COLUMN "importe" DROP NOT NULL;
