const connector = require('../../../../connector');
const sql = require('sql');
sql.setDialect('postgres');
const model = require('../../../../model');
const utils = require('../../utils');


function addIncumbencia(item) {
    return model.Matricula.getMigracion(item['IDEMP'])
        .then(empresa => {
            if (empresa) {
                let table = model.EmpresaIncumbencia.table;
                let query = table.insert(
                    table.idEmpresa.value(empresa.id),
                    table.incumbencia.value(item['IDINC'])
                ).toQuery();
                return connector.execQuery(query);
            }
        })
}


module.exports.migrar = function () {
    console.log('Migrando incumbencias de empresas...');
    let q_objetos = ` SELECT *
                      FROM EMP_INCUMBENCIAS BETWEEN @offset AND @limit`;
    let q_limites = 'select MIN(IDEmp) as min, MAX(IDEmp) as max from EMP_INCUMBENCIAS';

    return utils.migrar(q_objetos, q_limites, 100, addIncumbencia);
}