const config = require('../../config.private');
const connector = require('../../connector');
const sql = require('sql');
sql.setDialect('postgres');
const model = require('../../model');
const sqlserver = require('../sqlserver');

function makeJobInstitucion(i, total, page_size, consulta) {
    if (i < total) {
        let offset = i + page_size;
        return sqlserver.query(consulta, i, offset)
            .then(instituciones => {
                let nuevasInstituciones = [];
                if (instituciones) {
                    instituciones.forEach(universidad => {
                        let nuevaUniversidad = {};
                        nuevaUniversidad['id'] = universidad['CODIGO'];
                        nuevaUniversidad['nombre'] = universidad['DESCRIPCION'];
                        nuevasInstituciones.push(addInstitucion(nuevaUniversidad));
                    });
                   return Promise.all(nuevasInstituciones).then(res =>
                    makeJobInstitucion(offset + 1, total, page_size, consulta)
                  );
                }
                else return makeJobInstitucion(offset + 1, total, page_size, consulta);
            })
            .catch(error => {
                console.log('ERROR', error);
            })
    }

}

function addInstitucion(nueva_institucion) {
    let table = model.Institucion.table;
    let query = table.insert(
                  table.id.value(nueva_institucion.id),
                  table.nombre.value(nueva_institucion.nombre)
                ).toQuery();

    return connector.execQuery(query);
}

module.exports.migrar = function () {
    console.log('Migrando instituciones...');
    let consultaInstitucion = 'select * from T_Universidad WHERE CODIGO BETWEEN @offset AND @limit';
    let countInstituciones = 'select COUNT(*) as cantUniversidades from T_Universidad';
    return sqlserver.query(countInstituciones)
        .then(resultado => {
            if (resultado[0]) {
                let cantInstitucion = resultado[0]['cantUniversidades'];
                return makeJobInstitucion(0, cantInstitucion, 100, consultaInstitucion);
            }
            else return;
        })
}
