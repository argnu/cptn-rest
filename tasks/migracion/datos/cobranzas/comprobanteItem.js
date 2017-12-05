const connector = require('../../../../connector');
const sql = require('sql');
sql.setDialect('postgres');
const model = require('../../../../model');
const utils = require('../../utils');

function addComprobantesItems(comprobante_item) {
  return Promise.all([
      model.Comprobante.getByNumero(comprobante_item['NUMRECIBO']),
      model.BoletaItem.getByNumeroBoleta(comprobante_item['NUMCMPTE'], comprobante_item['ITEMCMPTE'])
    ])
    .then(([comprobante, item]) => {
      if (comprobante){
        let table = model.ComprobanteItem.table;
        let query = table.insert(
          table.comprobante.value(comprobante.id),
          table.item.value(comprobante_item['ITEM']),
          table.boleta_item.value(item ? item.id : null),
          //table.tipo_comprobante.value(comprobante_item['TIPO_COMPROBANTE']),
          table.descripcion.value(comprobante_item['DESCRIPCION']),
          table.cuenta_contable.value(comprobante_item['CUENTACONTABLE']),
          table.importe.value(comprobante_item['IMPORTE']),
          table.delegacion.value(comprobante_item['CODDELEGACIONCMPTE'])
        ).toQuery();
        return connector.execQuery(query);
      } else {
        return Promise.resolve();
      }
    });
}

module.exports.migrar = function () {
  console.log('Migrando Comprobantes...');
  let q_objetos = `SELECT RC.NUMRECIBO, RC.ITEM,
    RC.CUENTACONTABLE, CODDELEGACIONCMPTE,
    RC.NUMCMPTE, RC.ITEMCMPTE, RC.DESCRIPCION, RC.IMPORTE as IMPORTE,
    BI.CODTIPOASTO as TIPO_COMPROBANTE
    from RECMAT1 RC LEFT JOIN BOL_ITEMS BI
    ON (RC.NUMCMPTE = BI.NUMBOLETA AND RC.ITEMCMPTE= BI.ITEM)
    WHERE RC.NUMRECIBO BETWEEN @offset AND @limit`;
  let q_limites = 'select MIN(NUMRECIBO) as min, MAX(NUMRECIBO) as max from RECMAT1';

  return utils.migrar(q_objetos, q_limites, 100, addComprobantesItems);
}