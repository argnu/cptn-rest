const config = require('../../../config.private');
const connector = require('../../../connector');
const sql = require('sql');
sql.setDialect('postgres');
const model = require('../../../model');
const sqlserver = require('../sqlserver');

const consulta = `select CODIGO, LIBRO, DESCRIPCION
  from T_TITULOS where CODIGO between @offset and @limit`;

function makeJob(i, total, page_size) {
    if (i < total) {
        let offset = i + page_size;
        return sqlserver.query(consulta, i, offset)
            .then(titulos => {
                if (titulos) {
                   nuevosTitulos = titulos.map(titulo => createTitulo(titulo));
                   return Promise.all(nuevosTitulos).then(res =>
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

function createTitulo(titulo) {
  let table = model.Titulo.table;
  let query = table.insert(
                table.idMigracion.value(titulo['CODIGO']),
                table.tipo.value(1),  // 1 es 'Grado'
                table.libro.value(titulo['LIBRO']),
                table.nombre.value(titulo['DESCRIPCION'])
              ).toQuery();

  return connector.execQuery(query);
}


module.exports.migrar = function () {
    let limites = 'select MIN(CODIGO) as min, MAX(CODIGO) as max from T_TITULOS';
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
