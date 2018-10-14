ALTER TABLE "subsidiario" ADD COLUMN "persona" int;
ALTER TABLE "subsidiario" ADD FOREIGN KEY("persona") REFERENCES persona("id");

DO $$
DECLARE
  row_sub RECORD;
  last_id INT;
BEGIN
    FOR row_sub IN SELECT * from subsidiario
    LOOP
	    INSERT INTO persona(tipo, nombre) VALUES ('fisica', row_sub.nombre) RETURNING id INTO last_id;
        INSERT INTO persona_fisica(id, apellido, dni) VALUES (last_id, row_sub.apellido, row_sub.dni);
        UPDATE subsidiario SET persona=last_id WHERE id=row_sub.id;
    END LOOP;
END$$;

ALTER TABLE "subsidiario" DROP COLUMN "dni";
ALTER TABLE "subsidiario" DROP COLUMN "apellido";
ALTER TABLE "subsidiario" DROP COLUMN "nombre";

ALTER TABLE "persona_fisica" ADD COLUMN "fechaNacimiento" date;
ALTER TABLE "persona_fisica" ADD COLUMN "lugarNacimiento" varchar(100);
ALTER TABLE "persona_fisica" ADD COLUMN "sexo" int;
ALTER TABLE "persona_fisica" ADD COLUMN "nacionalidad" varchar(45);
ALTER TABLE "persona_fisica" ADD COLUMN "estadoCivil" int;
