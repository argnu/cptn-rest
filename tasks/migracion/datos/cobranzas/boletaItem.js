const connector = require('../../../connector');
const sql = require('sql');
sql.setDialect('postgres');
const model = require('../../../../model');
const utils = require('../../utils');

function addBoletaItem(boletaItem) {
    let table = model.BoletaItem.table;
    let query = table.insert(
                  table.numero.value(boleta['NUMBOLETA']),
                  table.item.value(boleta['ITEM']),
                  table.descripcion.value(boleta['DESCRIPCION']),
                  table.importe.value(boleta['MONTO']),
                  table.tipo_comprobante.value(boleta['CODTIPOASTO']),
                ).toQuery();
  
    return connector.execQuery(query);
  }


module.exports.migrar = function() {
    console.log('Migrando items de boletas...');
    let q_objetos = 'select * from BOL_ITEMS WHERE NUMBOLETA BETWEEN @offset AND @limit';
    let q_limites = 'select MIN(NUMBOLETA) as min, MAX(NUMBOLETA) as max from BOL_ITEMS';

    return utils.migrar(q_objetos, q_limites, 100, addBoletaItem);
}
