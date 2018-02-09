ALTER TABLE "domicilio" ADD COLUMN "direccion" varchar(100);
ALTER TABLE "t_estadomatricula" ALTER COLUMN "eliminado" SET DEFAULT false;
ALTER TABLE "matricula" ALTER COLUMN "eliminado" SET DEFAULT false;

UPDATE domicilio SET direccion = calle || numero::text WHERE numero is not null AND numero != 0;
UPDATE domicilio SET direccion = calle WHERE numero is null OR numero = 0;

ALTER TABLE "domicilio" DROP COLUMN calle;
ALTER TABLE "domicilio" DROP COLUMN numero;

ALTER TABLE empresa_representante DROP CONSTRAINT "empresa_representante_empresa_fkey";
ALTER TABLE empresa_representante ADD FOREIGN KEY ("empresa") REFERENCES empresa("id") ON DELETE CASCADE 
ALTER TABLE empresa_representante DROP CONSTRAINT "empresa_representante_matricula_fkey";
ALTER TABLE empresa_representante ADD FOREIGN KEY ("matricula") REFERENCES matricula("id") ON DELETE CASCADE 
ALTER TABLE legajo DROP CONSTRAINT "legajo_matricula_fkey";
ALTER TABLE legajo ADD FOREIGN KEY ("matricula") REFERENCES matricula("id") ON DELETE CASCADE 
ALTER TABLE boleta DROP CONSTRAINT "boleta_matricula_fkey";
ALTER TABLE boleta ADD FOREIGN KEY ("matricula") REFERENCES matricula("id") ON DELETE CASCADE 
ALTER TABLE boleta_item DROP CONSTRAINT "boleta_item_boleta_fkey";
ALTER TABLE boleta_item ADD FOREIGN KEY ("boleta") REFERENCES boleta("id") ON DELETE CASCADE 
ALTER TABLE comprobante DROP CONSTRAINT "comprobante_matricula_fkey";
ALTER TABLE comprobante ADD FOREIGN KEY ("matricula") REFERENCES matricula("id") ON DELETE CASCADE 
ALTER TABLE comprobante_item DROP CONSTRAINT "comprobante_item_boleta_fkey";
ALTER TABLE comprobante_item ADD FOREIGN KEY ("boleta") REFERENCES boleta("id") ON DELETE SET NULL 
ALTER TABLE volante_pago DROP CONSTRAINT "volante_pago_matricula_fkey";
ALTER TABLE volante_pago ADD FOREIGN KEY ("matricula") REFERENCES matricula("id") ON DELETE CASCADE 
ALTER TABLE volante_pago_boleta DROP CONSTRAINT "volante_pago_boleta_boleta_fkey";
ALTER TABLE volante_pago_boleta ADD FOREIGN KEY ("boleta") REFERENCES boleta("id") ON DELETE SET NULL 


DO $$
DECLARE
  row_del RECORD;
  row_user RECORD;
BEGIN
    -- RECORRER USUARIO CON DELEGACION EN NEUQUEN (id=1)
    FOR row_user IN SELECT usuario from usuario_delegacion where delegacion=1 AND usuario != 'invitado' ORDER BY usuario
    LOOP
        -- SOLO RECORRO LAS DELEGACIONES DIFERENTES A NEUQUEN (id=1)
	    FOR row_del IN SELECT id FROM delegacion WHERE id != 1 ORDER BY id
	    LOOP
    		INSERT INTO usuario_delegacion (usuario, delegacion) VALUES (row_user.usuario, row_del.id);
	    END LOOP;    
    END LOOP;  
END$$;