ALTER TABLE comprobante ADD COLUMN created_by varchar(45) references usuario(id), 
                        ADD COLUMN updated_by varchar(45) references usuario(id);
ALTER TABLE volante_pago ADD COLUMN created_by varchar(45) references usuario(id), 
                        ADD COLUMN updated_by varchar(45) references usuario(id);
ALTER TABLE legajo ADD COLUMN created_by varchar(45) references usuario(id), 
                        ADD COLUMN updated_by varchar(45) references usuario(id);
ALTER TABLE matricula ADD COLUMN created_by varchar(45) references usuario(id), 
                        ADD COLUMN updated_by varchar(45) references usuario(id);
ALTER TABLE solicitud ADD COLUMN created_by varchar(45) references usuario(id), 
                        ADD COLUMN updated_by varchar(45) references usuario(id);


