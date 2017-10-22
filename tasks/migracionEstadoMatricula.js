const {
    Pool
} = require('pg');
const config = require('../config.private');
const pool = new Pool(config.db);
const connectSql = require('./connectSql');

function makeJobEstadoMatricula(i, total, page_size, consulta) {
    if (i < total) {
        let offset = i + page_size;
        return connectSql.consultaSql(consulta, i, offset)
            .then(estados => {
                let nuevosEstados = [];
                if (estados) {
                    estados.forEach(estado => {
                        let nuevoEstado = {};
                        nuevoEstado['id'] = estado['CODIGO'];
                        nuevoEstado['nombre'] = estado['DESCRIPCION'];
                        nuevosEstados.push(addEstadoMatricula(pool, nuevoEstado));
                    });
                   return Promise.all(nuevoEstado).then(res =>
                    makeJobEstadoMatricula(offset + 1, total, page_size, consulta)
                  );
                }
                else return makeJobEstadoMatricula(offset + 1, total, page_size, consulta);
            })
            .catch(error => {
                console.log('ERROR', error);
            })
    }

}

function addEstadoMatricula(client, nuevo) {
    let query = `
         INSERT INTO t_estadomatricula (
            id, nombre)
          VALUES($1, $2)
        `;
    let values = [
        nuevo.id, nuevo.nombre
    ];
    return client.query(query, values);
}

module.exports.migrarEstadoMatricula = function () {
    let consulta = 'select * from T_ESTADO_MAT WHERE CODIGO BETWEEN @offset AND @limit';
    let countEstados = 'select COUNT(*) as cantEstados from T_ESTADO_MAT';
    return connectSql.countSql(countEstados)
        .then(res => {
            console.log(res);
            if (res && res !== []) {
                let cantEstados = res['cantEstados'];  
                makeJobEstadoMatricula(0, cantEstados, 100, consulta);
            }
        })
        .catch(err => console.log('No se pudo importar los estados de las matriculas', err))
}