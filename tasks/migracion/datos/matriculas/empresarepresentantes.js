const connector = require('../../../../connector');
const sql = require('sql');
sql.setDialect('postgres');
const model = require('../../../../model');
const utils = require('../../utils');


function addRepresentante(representante) {
    return model.Matricula.getMigracion(representante['IDEMP'])
        .then(empresa => {
            if (empresa) {
                return model.Matricula.getMigracion(representante['IDRep'])
                    .then(matricula => {
                        let table = model.EmpresaRepresentante.table;
                        let query = table.insert(
                            table.idEmpresa.value(empresa.id),
                            table.idMatricula.value(matricula.id),
                            table.fechaInicio.value(utils.getFecha(representante['InicVinc_DATE'])),
                            table.fechaFin.value(utils.getFecha(representante['SeceVinc_DATE']))
                        ).toQuery();

                        return connector.execQuery(query);
                    });
            }
        })
}


module.exports.migrar = function () {
    console.log('Migrando representantes de las empresas...');
    let q_objetos = `  SELECT *
                       FROM EMP_REPRES BETWEEN @offset AND @limit`;
    let q_limites = 'select MIN(IDEmp) as min, MAX(IDEmp) as max from EMP_REPRES';

    return utils.migrar(q_objetos, q_limites, 100, addRepresentante);
}
