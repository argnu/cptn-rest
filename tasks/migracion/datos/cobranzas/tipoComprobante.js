const connector = require('../../../../connector');
const sql = require('sql');
sql.setDialect('postgres');
const model = require('../../../../model');
const utils = require('../../utils');


function addTipoComprobante(tipo) {
  let table = model.TipoComprobante.table;
  let query = table.insert(
                table.abreviatura.value(tipo['Tipo_doc']),
                table.descripcion.value(tipo['DESCRIPCION']),
                table.cuentaAcreedora.value(tipo['CUENTAACREEDORA']),
                table.cuentaDeudora.value(tipo['CUENTADEUDORA']),
                table.cuentaADevengar.value(tipo['CUENTAADEVENGAR'])
              ).toQuery();

  return connector.execQuery(query);
}


module.exports.migrar = function() {
    console.log('Migrando tipos de comprobantes...');
    let q_objetos ='select * from T_TIPOASTO WHERE Tipo_doc';
    let q_limites = 'select 0 as min, COUNT(Tipo_doc) as max, from T_TIPOASTO';

    return utils.migrar(q_objetos, q_limites, 100, addTipoComprobante);
}
