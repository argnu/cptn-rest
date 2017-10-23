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
                if (estados) {
                    nuevosEstados = estados.map(estado => {
                        let nuevoEstado = {};
                        nuevoEstado['id'] = estado['CODIGO'];
                        nuevoEstado['valor'] = estado['DESCRIPCION'];
                        return addEstadoMatricula(pool, nuevoEstado);
                    });
                   return Promise.all(nuevosEstados).then(res =>
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
            id, valor)
          VALUES($1, $2)
        `;
    let values = [
        nuevo.id, nuevo.valor
    ];
    return client.query(query, values);
}

module.exports.migrarEstadoMatricula = function () {
    console.log('Migrando estados de matrícula...');    
    let consulta = 'select * from T_ESTADO_MAT WHERE CODIGO BETWEEN @offset AND @limit';
    let countEstados = 'select COUNT(*) as cantEstados from T_ESTADO_MAT';
    return connectSql.countSql(countEstados)
        .then(res => {
            if (res && res !== []) {
                let cantEstados = res['cantEstados'];  
                return makeJobEstadoMatricula(0, cantEstados, 100, consulta);
            }
            else return;
        })
}