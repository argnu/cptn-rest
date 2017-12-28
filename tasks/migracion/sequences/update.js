const connector = require('../../../connector');

Promise.all([
 connector.execRawQuery('SELECT MAX(id) FROM institucion'),
 connector.execRawQuery('SELECT MAX(id) FROM delegacion'),
 connector.execRawQuery('SELECT MAX(id) FROM pais'),
 connector.execRawQuery('SELECT MAX(id) FROM provincia'),
 connector.execRawQuery('SELECT MAX(id) FROM departamento'),
 connector.execRawQuery('SELECT MAX(id) FROM localidad'),
 connector.execRawQuery('SELECT MAX(id) FROM tarea_categoria'),
 connector.execRawQuery('SELECT MAX(id) FROM tarea_subcategoria'),
 connector.execRawQuery('SELECT MAX(id) FROM tarea_item'),
 connector.execRawQuery('SELECT MAX(id) FROM t_estadoboleta')
])
.then(([
    maxInstituciones,
    maxDelegaciones,
    maxPaises,
    maxProvincias,
    maxDepartamentos,
    maxLocalidades,
    maxCategorias,
    maxSubcategorias,
    maxItems,
    maxEstadosBoleta
]) => {
    return connector.execRawQuery(`
    ALTER SEQUENCE institucion_id_seq RESTART WITH ${maxInstituciones.rows[0].max+1};
    ALTER SEQUENCE institucion_id_seq RESTART WITH ${maxDelegaciones.rows[0].max+1};
    ALTER SEQUENCE institucion_id_seq RESTART WITH ${maxPaises.rows[0].max+1};
    ALTER SEQUENCE institucion_id_seq RESTART WITH ${maxProvincias.rows[0].max+1};
    ALTER SEQUENCE institucion_id_seq RESTART WITH ${maxDepartamentos.rows[0].max+1};
    ALTER SEQUENCE institucion_id_seq RESTART WITH ${maxLocalidades.rows[0].max+1};
    ALTER SEQUENCE institucion_id_seq RESTART WITH ${maxCategorias.rows[0].max+1};
    ALTER SEQUENCE institucion_id_seq RESTART WITH ${maxSubcategorias.rows[0].max+1};
    ALTER SEQUENCE institucion_id_seq RESTART WITH ${maxItems.rows[0].max+1};
    ALTER SEQUENCE institucion_id_seq RESTART WITH ${maxEstadosBoleta.rows[0].max+1};
    `)
})
.then(r => {
    console.log('Autoincrementales actualizados');
    process.exit();
})
.catch(e => console.error(e));
