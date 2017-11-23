const connector = require('../../../connector');

Promise.all([
 connector.execRawQuery('SELECT MAX(id) FROM institucion'),
 connector.execRawQuery('SELECT MAX(id) FROM delegacion'),
 connector.execRawQuery('SELECT MAX(id) FROM pais'),
 connector.execRawQuery('SELECT MAX(id) FROM provincia'),
 connector.execRawQuery('SELECT MAX(id) FROM departamento'),
 connector.execRawQuery('SELECT MAX(id) FROM localidad'),
 connector.execRawQuery('SELECT MAX(id) FROM tarea_categoria')
])
.then(([
    maxInstituciones,
    maxDelegaciones,
    maxPaises,
    maxProvincias,
    maxDepartamentos,
    maxLocalidades,
    maxCategorias
]) => {
    return connector.execRawQuery(`
    CREATE SEQUENCE institucion_id_seq OWNED BY institucion.id START WITH ${maxInstituciones.rows[0].max+1};
    ALTER TABLE institucion ALTER COLUMN id SET DEFAULT nextval('institucion_id_seq');
    CREATE SEQUENCE delegacion_id_seq OWNED BY delegacion.id START WITH ${maxDelegaciones.rows[0].max+1};
    ALTER TABLE delegacion ALTER COLUMN id SET DEFAULT nextval('delegacion_id_seq');
    CREATE SEQUENCE pais_id_seq OWNED BY pais.id START WITH ${maxPaises.rows[0].max+1};
    ALTER TABLE pais ALTER COLUMN id SET DEFAULT nextval('pais_id_seq');
    CREATE SEQUENCE provincia_id_seq OWNED BY provincia.id START WITH ${maxProvincias.rows[0].max+1};
    ALTER TABLE provincia ALTER COLUMN id SET DEFAULT nextval('provincia_id_seq');
    CREATE SEQUENCE departamento_id_seq OWNED BY departamento.id START WITH ${maxDepartamentos.rows[0].max+1};
    ALTER TABLE departamento ALTER COLUMN id SET DEFAULT nextval('departamento_id_seq');
    CREATE SEQUENCE localidad_id_seq OWNED BY localidad.id START WITH ${maxLocalidades.rows[0].max+1};
    ALTER TABLE localidad ALTER COLUMN id SET DEFAULT nextval('localidad_id_seq');
    CREATE SEQUENCE tarea_categoria_id_seq OWNED BY tarea_categoria.id START WITH ${maxCategorias.rows[0].max+1};
    ALTER TABLE tarea_categoria ALTER COLUMN id SET DEFAULT nextval('tarea_categoria_id_seq');
    `)
})
.then(r => {
    console.log('Autoincrementales reestablecidos');
    process.exit();
})
.catch(e => console.error(e));
