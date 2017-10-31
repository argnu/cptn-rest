const connector = require('../../../connector');
const sql = require('sql');
sql.setDialect('postgres');
const model = require('../../../../model');
const utils = require('../../utils');

const addEstadoBoleta = (estado) => {
    let table = model.TipoEstadoBoleta.table;
    let query = table.insert(
                  table.id.value(estado['CODIGO']),
                  table.valor.value(estado['DESCRIPCION'])
                ).toQuery();

    return connector.execQuery(query);
}


module.exports.migrar = function() {
    console.log('Migrando estado de boleta...');
    let q_objetos = 'select * from T_ESTADO_BOL WHERE CODIGO BETWEEN @offset AND @limit';
    let q_limites = 'select MIN(CODIGO) as min, MAX(CODIGO) as max from T_ESTADO_BOL';

    return utils.migrar(q_objetos, q_limites, 100, addEstadoBoleta);
}
