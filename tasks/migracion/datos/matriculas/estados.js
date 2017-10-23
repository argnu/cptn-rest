const config = require('../../../../config.private');
const connector = require('../../../../connector');
const sql = require('sql');
sql.setDialect('postgres');
const model = require('../../../../model');
const sqlserver = require('../../sqlserver');

function makeJobEstadoMatricula(i, total, page_size, consulta) {
    if (i < total) {
        let offset = i + page_size;
        return sqlserver.query(consulta, i, offset)
            .then(estados => {
                if (estados) {
                    nuevosEstados = estados.map(estado => {
                        let nuevoEstado = {};
                        nuevoEstado['id'] = estado['CODIGO'];
                        nuevoEstado['valor'] = estado['DESCRIPCION'];
                        return addEstadoMatricula(nuevoEstado);
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

function addEstadoMatricula(nuevo) {
    let table = model.TipoEstadoMatricula.table;
    let query = table.insert(
                  table.id.value(nuevo.id),
                  table.valor.value(nuevo.valor)
                ).toQuery();

    return connector.execQuery(query);
}

module.exports.migrar = function () {
    console.log('Migrando estados de matrícula...');
    let consulta = 'select * from T_ESTADO_MAT WHERE CODIGO BETWEEN @offset AND @limit';
    let countEstados = 'select COUNT(*) as cantEstados from T_ESTADO_MAT';
    return sqlserver.query(countEstados)
        .then(resultado => {
            if (resultado[0]) {
                let cantEstados = resultado[0]['cantEstados'];
                return makeJobEstadoMatricula(0, cantEstados, 100, consulta);
            }
            else return;
        })
}
