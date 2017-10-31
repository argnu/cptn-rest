const connector = require('../../../../connector');
const sql = require('sql');
sql.setDialect('postgres');
const model = require('../../../../model');
const utils = require('../utils');


function addTipoPago(tipo) {
  let table = Model.TipoPago.table;
  let query = table.insert(
                table.id.value(tipo['CODTIPOPAGO']),
                table.descripcion.value(tipo['DESCRIPCION']),
                table.cuentaContable.value(tipo['CUENTACONTABLE']),
                table.habilitado.value(tipo['HABILITADO'])
              ).toQuery();

  return connector.execQuery(query);
}


module.exports.migrar = function() {
    console.log('Migrando tipo de pago...');
    let q_objetos = 'select * from T_TIPOPAGO WHERE CODTIPOPAGO BETWEEN @offset AND @limit';
    let q_limites = 'select MIN(CODTIPOPAGO) as min, MAX(CODTIPOPAGO) as max from T_TIPOPAGO';

    return utils.migrar(q_objetos, q_limites, 100, addTipoPago);
}
