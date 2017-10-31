const connector = require('../../../../connector');
const sql = require('sql');
sql.setDialect('postgres');
const model = require('../../../../model');

const addSubsidiario = (subsidiario) => {
  return model.Matricula.getMigracion(subsidiario['ID'])
  .then(matricula => {
    let nuevoSubsidiario = {};
    nuevoSubsidiario.profesional = matricula.entidad;
    nuevoSubsidiario.nombre = subsidiario['NOMBRE'];
    nuevoSubsidiario.apellido = subsidiario['APELLIDO'];
    nuevoSubsidiario.dni = subsidiario['NUMDOCU'];
    nuevoSubsidiario.porcentaje = subsidiario['PORCENTAJE'];
    return model.Subsidiario.addSubsidiario(nuevoSubsidiario);
  });
}


module.exports.migrar = function () {
    console.log('Migrando subsidiarios de caja...');
    let limites = 'select MIN(ID) as min, MAX(ID) as max from MAT_SUBSIDIO';
    return sqlserver.query(limites)
        .then(resultado => {
            if (resultado[0]) {
                let min = resultado[0]['min'];
                let max = resultado[0]['max'];
                return makeJob(min, max, 100);
            }
            else return;
        })
}


module.exports.migrar = function() {
    console.log('Migrando subsidiarios de caja...');
    let q_objetos = `select s.ID, s.APELLIDO,
            s.NOMBRE, s.PORCENTAJE, s.NUMDOCU
            from MAT_SUBSIDIO s inner join MATRICULAS m
            on s.ID=m.ID
            where s.ID between @offset and @limit`;
    let q_limites = 'select MIN(ID) as min, MAX(ID) as max from MAT_SUBSIDIO';

    return utils.migrar(q_objetos, q_limites, 100, addSubsidiario);
}
