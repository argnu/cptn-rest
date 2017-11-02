const connector = require('../../../../connector');
const sql = require('sql');
sql.setDialect('postgres');
const model = require('../../../../model');
const utils = require('../../utils');


function addComprobantes(comprobante) {
  let table = model.Comprobante.table;
  let query = table.insert(
                // table.numero.value(boleta['NUMBOLETA']),
                table.matricula.value(boleta['IDMATRICULADO'])
              ).toQuery();

  return connector.execQuery(query);
}


module.exports.migrar = function() {
    console.log('Migrando Comprobantes...');
    let q_objetos = `Select CodSucursal, NumRecibo,Fecha_DATE, FechaVto_TIME, 
    FechaVto_DATE, MatricEmp,IDMatriculado, CodOperador, 
    Subtotal, InteresTotal, BonificacionTotal,ImporteTotal, ImporteCancelado, Anulado,
    EnContable, Observaciones
    FROM RECMAT
    WHERE IDMatriculado is not null AND`;
    let q_limites = 'select MIN(NumRecibo) as min, MAX(NumRecibo) as max from RECMAT';

    return utils.migrar(q_objetos, q_limites, 100, addComprobantes);
}