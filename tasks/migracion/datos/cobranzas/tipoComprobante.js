const connector = require('../../../../connector');
const sql = require('sql');
sql.setDialect('postgres');
const model = require('../../../../model');
const utils = require('../utils');


function addTipoComprobante(nuevo) {
  let nueva = {};
  nueva['abreviatura'] = tipo['Tipo_doc'];
  nueva['descripcion'] = tipo['DESCRIPCION'];
  nueva['cuentaAcreedora'] = tipo['CUENTAACREEDORA'];
  nueva['cuentaDeudora'] = tipo['CUENTADEUDORA'];
  nueva['cuentaADevengar'] = tipo['CUENTAADEVENGAR'];
    /*TODO: Ver la forma de implementar */
}


module.exports.migrar = function () {
    console.log('Migrando tipoAsto...');
    //let limites = 'select COUNT(*) as max from MAT_CAJA';
    return sqlserver.query(limites)
        .then(resultado => {
            if (resultado[0]) {
                // let max = resultado[0]['max'];
                return makeJob(consulta);
            } else return;
        })
}

module.exports.migrar = function() {
    console.log('Migrando tipos de comprobantes...');
    let q_objetos = `select * from T_TIPOASTO`;
    let q_limites = '';

    return utils.migrar(q_objetos, q_limites, 100, addTipoComprobante);
}
