ALTER TABLE "documento" ALTER COLUMN "numero" TYPE integer USING "numero"::integer;

 /*    SENTENCIAS DE ALTERACION DE TABLAS: NUEVAS COLUMNAS   */
ALTER TABLE "documento" ADD COLUMN "archivo" varchar(100);
ALTER TABLE "documento" ADD COLUMN "created_by" int;
ALTER TABLE "documento" ADD COLUMN "updated_by" int;
ALTER TABLE "documento" ADD COLUMN "created_at" timestamptz DEFAULT current_date ;
ALTER TABLE "documento" ADD COLUMN "updated_at" timestamptz DEFAULT current_date ;


 /*    SENTENCIAS DE ALTERACION DE TABLAS: FOREIGN KEYS   */
ALTER TABLE "documento" ADD FOREIGN KEY("created_by") REFERENCES usuario("id");
ALTER TABLE "documento" ADD FOREIGN KEY("updated_by") REFERENCES usuario("id");
