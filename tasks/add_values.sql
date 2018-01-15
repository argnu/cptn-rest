INSERT INTO valores_globales (fecha, nombre, descripcion, valor) VALUES (now(), 'inscripcion_matricula', 'Inscripción de Matrícula', 1000);
INSERT INTO t_estadoboleta(id, valor) VALUES (10, 'Volante de Pago Generado');
ALTER TABLE solicitud ADD COLUMN numero SERIAL;
ALTER SEQUENCE solitud_numero_seq RESTART WITH 115372;