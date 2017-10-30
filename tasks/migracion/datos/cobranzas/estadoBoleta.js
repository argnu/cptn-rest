const config = require('../../../config.private');
const connector = require('../../../connector');
const sql = require('sql');
sql.setDialect('postgres');
const model = require('../../../../model');
const sqlserver = require('../sqlserver');


const consulta = `select * from T_ESTADO_BOL`;


function makeJob(i, total, page_size, consulta) {
    if (i < total) {
        let offset = i + page_size;
        return sqlserver.query(consulta, i, offset)
            .then(estados => {
                let nuevosEstados = [];
                if (estados) {
                    estados.forEach(estado => {
                        let nueva = {};
                        nueva['id'] = estado['CODIGO'];
                        nueva['valor'] = estado['DESCRIPCION'];
                        nuevosEstados.push(addEstadoBoleta(nueva));
                    });
                   return Promise.all(nuevasEstados).then(res =>
                    makeJob(offset + 1, total, page_size, consulta)
                  );
                }
                else return makeJob(offset + 1, total, page_size, consulta);
            })
            .catch(error => {
                console.log('ERROR', error);
            })
    }

}

function addEstadoBoleta(nueva) {
    let table = model.TipoEstadoBoleta.table;
    let query = table.insert(
                  table.id.value(nueva.id),
                  table.valor.value(nueva.valor)
                ).toQuery();

    return connector.execQuery(query);
}

module.exports.migrar = function () {
    console.log('Migrando estados Boleta...');
    let consulta = 'select * from T_ESTADO_BOL WHERE CODIGO BETWEEN @offset AND @limit';
    let limites = 'select MIN(CODIGO) as min, MAX(CODIGO) as max from T_ESTADO_BOL';

    return sqlserver.query(limites)
        .then(resultado => {
            if (resultado[0]) {
                let min = resultado[0]['min'];
                let max = resultado[0]['max'];
                return makeJob(min, max, 100, consulta);
            }
            else {
                sql.close();
                return;
            }
        });
}
