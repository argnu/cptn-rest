const config = require('../../../../config.private');
const connector = require('../../../../connector');
const sql = require('sql');
sql.setDialect('postgres');
const model = require('../../../../model');
const sqlserver = require('../../sqlserver');

const consulta = `select M.ID, M.CODUNIVERSIDAD, 
  M.FECHATITULO_DATE, M.TITULO, U.CODIGO
  from MAT_TIT M
  LEFT JOIN T_UNIVERSIDAD U 
  ON (M.CODUNIVERSIDAD = U.CODIGO)
  where TITULO > 0 AND ID between @offset and @limit`;

function makeJob(i, total, page_size) {
    if (i < total) {
        let offset = i + page_size;
        return sqlserver.query(consulta, i, offset)
            .then(formaciones => {
                if (formaciones) {
                   nuevasFormaciones = formaciones.map(formacion => createFormacion(formacion));
                   return Promise.all(nuevasFormaciones).then(res =>
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

function getTitulo(idMigracion) {
  let table = model.Titulo.table;
  let query = table.select(
                table.id
              )
              .from(table)
              .where(
                table.tipo.equals(1).and(table.idMigracion.equals(idMigracion))
              )
              .toQuery();

  return connector.execQuery(query)
         .then(r => r.rows[0] );
}

function createFormacion(formacion) {
  return Promise.all([
    model.Matricula.getMigracion(formacion['ID']),
    getTitulo(formacion['TITULO'])
  ])
  .then(([matricula, titulo]) => {
    if (matricula && titulo) {
      let nuevaFormacion = {};
      nuevaFormacion.profesional = matricula.entidad;
      nuevaFormacion.fecha = formacion['FECHATITULO_DATE'];
      nuevaFormacion.titulo = titulo.id;
      nuevaFormacion.institucion = formacion['CODIGO'];
      return model.Formacion.addFormacion(nuevaFormacion);
    }
    else return Promise.resolve();
  });
}


module.exports.migrar = function () {
    console.log('Migrando titulos de matrículas...');
    let limites = 'select MIN(ID) as min, MAX(ID) as max from MAT_TIT';
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
