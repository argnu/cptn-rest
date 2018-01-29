const connector = require('../../../connector');

Promise.all([
    connector.execRawQuery('SELECT MAX(id) FROM institucion'),
    connector.execRawQuery('SELECT MAX(id) FROM delegacion'),
    connector.execRawQuery('SELECT MAX(id) FROM pais'),
    connector.execRawQuery('SELECT MAX(id) FROM provincia'),
    connector.execRawQuery('SELECT MAX(id) FROM departamento'),
    connector.execRawQuery('SELECT MAX(id) FROM localidad'),
    connector.execRawQuery('SELECT MAX(id) FROM banco'),
    connector.execRawQuery('SELECT MAX(id) FROM t_incumbencia'),
    connector.execRawQuery('SELECT MAX(id) FROM tarea_categoria'),
    connector.execRawQuery('SELECT MAX(id) FROM tarea_subcategoria'),
    connector.execRawQuery('SELECT MAX(id) FROM tarea_item'),
    connector.execRawQuery('SELECT MAX(id) FROM t_estadoboleta'),
    connector.execRawQuery('SELECT MAX(id) FROM t_estadomatricula'),
    connector.execRawQuery('SELECT MAX(id) FROM t_formapago'),
    connector.execRawQuery('SELECT MAX(id) FROM t_pago')
])
    .then(([
        maxInstituciones,
        maxDelegaciones,
        maxPaises,
        maxProvincias,
        maxDepartamentos,
        maxLocalidades,
        maxBancos,
        maxIncumbencias,
        maxCategorias,
        maxSubcategorias,
        maxItems,
        maxEstadosBoleta,
        maxEstadosMatricula,
        maxFormasPago,
        maxTiposPago
    ]) => {
        return connector.execRawQuery(`
    ALTER SEQUENCE institucion_id_seq RESTART WITH ${maxInstituciones.rows[0].max + 1};
    ALTER SEQUENCE delegacion_id_seq RESTART WITH ${maxDelegaciones.rows[0].max + 1};
    ALTER SEQUENCE pais_id_seq RESTART WITH ${maxPaises.rows[0].max + 1};
    ALTER SEQUENCE provincia_id_seq RESTART WITH ${maxProvincias.rows[0].max + 1};
    ALTER SEQUENCE departamento_id_seq RESTART WITH ${maxDepartamentos.rows[0].max + 1};
    ALTER SEQUENCE localidad_id_seq RESTART WITH ${maxLocalidades.rows[0].max + 1};
    ALTER SEQUENCE banco_id_seq RESTART WITH ${maxBancos.rows[0].max + 1};
    ALTER SEQUENCE t_incumbencia_id_seq RESTART WITH ${maxIncumbencias.rows[0].max + 1};
    ALTER SEQUENCE tarea_categoria_id_seq RESTART WITH ${maxCategorias.rows[0].max + 1};
    ALTER SEQUENCE tarea_subcategoria_id_seq RESTART WITH ${maxSubcategorias.rows[0].max + 1};
    ALTER SEQUENCE tarea_item_id_seq RESTART WITH ${maxItems.rows[0].max + 1};
    ALTER SEQUENCE t_estadoboleta_id_seq RESTART WITH ${maxEstadosBoleta.rows[0].max + 1};
    ALTER SEQUENCE t_estadomatricula_id_seq RESTART WITH ${maxEstadosMatricula.rows[0].max + 1};
    ALTER SEQUENCE t_formapago_id_seq RESTART WITH ${maxFormasPago.rows[0].max + 1};
    ALTER SEQUENCE t_pago_id_seq RESTART WITH ${maxTiposPago.rows[0].max + 1};
    `)
    })
    .then(r => {
        console.log('Autoincrementales actualizados');
        process.exit();
    })
    .catch(e => console.error(e));
