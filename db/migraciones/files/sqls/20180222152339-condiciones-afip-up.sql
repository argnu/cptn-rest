 /*    SENTENCIAS DE CREACION DE TABLAS   */

CREATE TABLE "entidad_condicion_afip" ("id" serial PRIMARY KEY, "entidad" int NOT NULL, "condicion_afip" int NOT NULL, "descripcion" text, FOREIGN KEY ( "entidad" ) REFERENCES "entidad" ( "id" ), FOREIGN KEY ( "condicion_afip" ) REFERENCES "t_condicionafip" ( "id" ));


INSERT INTO t_condicionafip (id, valor) VALUES (7, 'Relación de Dependencia');
INSERT INTO t_condicionafip (id, valor) VALUES (8, 'Desempleado');
INSERT INTO t_condicionafip (id, valor) VALUES (9, 'Jubilado');
UPDATE t_condicionafip SET valor='Monotributo' WHERE id=6;
UPDATE t_condicionafip SET valor='IVA Responsable Inscripto' WHERE id=2;

INSERT INTO entidad_condicion_afip (entidad, condicion_afip)
select e.id as entidad,(Case WHEN (e.condafip=1) THEN (Case WHEN (p."relacionDependencia") THEN 7
                                                 WHEN (p."jubilado") THEN 9
                         WHEN (p."independiente") THEN 6
                                                 ELSE 8 END)
                  WHEN (e.condafip=2) THEN 2
             ELSE 6
       end) as condicion_afip
from profesional p 
INNER JOIN entidad e ON (e.id = p.id);


 /*    SENTENCIAS DE ALTERACION DE TABLAS: ELIMINACION DE COLUMNAS   */

ALTER TABLE "entidad" DROP COLUMN "condafip";
ALTER TABLE "profesional" DROP COLUMN "jubilado";

DELETE FROM t_condicionafip WHERE id=1;
DELETE FROM t_condicionafip WHERE id=3;
DELETE FROM t_condicionafip WHERE id=4;
DELETE FROM t_condicionafip WHERE id=5;