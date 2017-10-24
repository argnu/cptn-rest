const config = require('../../../../config.private');
const connector = require('../../../../connector');
const sql = require('sql');
sql.setDialect('postgres');
const model = require('../../../../model');
const sqlserver = require('../../sqlserver');

const consulta = `select s.ID, s.APELLIDO,
        s.NOMBRE, s.PORCENTAJE, s.NUMDOCU
        from MAT_SUBSIDIO s inner join MATRICULAS m
        on s.ID=m.ID
        where s.ID between @offset and @limit`;

function makeJob(i, total, page_size) {
    if (i < total) {
        let offset = i + page_size;
        return sqlserver.query(consulta, i, offset)
            .then(subsidiarios => {
                if (subsidiarios) {
                   nuevosSubsidiarios = subsidiarios.map(subsidiario => createSubsidiario(subsidiario));
                   return Promise.all(nuevosSubsidiarios).then(res =>
                    makeJob(offset + 1, total, page_size)
                  );
                }
                else return makeJob(offset + 1, total, page_size);
            })
            .catch(error => {
                console.log('ERROR', error);
            })
    }
}

function createSubsidiario(subsidiario) {
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
