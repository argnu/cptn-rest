const config = require('../../config.private');
const connector = require('../../connector');
const sql = require('sql');
sql.setDialect('postgres');
const model = require('../../model');
const sqlserver = require('../sqlserver');

function makeJobDelegacion(i, total, page_size, consulta) {
    if (i < total) {
        let offset = i + page_size;
        return sqlserver.query(consulta, i, offset)
            .then(delegaciones => {
                let nuevasDelegaciones = [];
                if (delegaciones) {
                    delegaciones.forEach(delegacion => {
                        let nueva = {};
                        nueva['id'] = delegacion['CODIGO'];
                        nueva['nombre'] = delegacion['DESCRIPCION'];
                        nuevasDelegaciones.push(addDelegacion(pool, nueva));
                    });
                   return Promise.all(nuevasDelegaciones).then(res =>
                    makeJobDelegacion(offset + 1, total, page_size, consulta)
                  );
                }
                else return makeJobDelegacion(offset + 1, total, page_size, consulta);
            })
            .catch(error => {
                console.log('ERROR', error);
            })
    }

}

function addDelegacion(client, nueva_delegacion) {
    let table = model.Delegacion.table;
    let query = table.insert(
                  table.id.value(nueva_delegacion.id),
                  table.nombre.value(nueva_delegacion.nombre)
                ).toQuery();

    return connector.execQuery(query);
}

module.exports.migrar = function () {
    console.log('Migrando delegaciones...');
    let consulta = 'select * from T_SUCURSAL WHERE CODIGO BETWEEN @offset AND @limit';
    let countDelegaciones = 'select COUNT(*) as cant from T_SUCURSAL';
    return sqlserver.query(countDelegaciones)
        .then(resultado => {
            if (resultado[0]) {
                let cantDelegaciones = resultado[0]['cant'];
                return makeJobDelegacion(0, cantDelegaciones, 100, consulta);
            }
            else {
                sql.close();
                return;
            }
        });
}
