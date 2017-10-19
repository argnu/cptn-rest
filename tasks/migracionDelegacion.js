const {
    Pool
} = require('pg');
const config = require('../config.private');
const pool = new Pool(config.db);
const connectSql = require('./connectSql');

function makeJobDelegacion(i, total, page_size, consulta) {
    if (i < total) {
        let offset = i + page_size;
        return connectSql.consultaSql(consulta, i, offset)
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
    let query = `
         INSERT INTO delegacion (
            id, nombre)
          VALUES($1, $2)
        `;
    let values = [
        nueva_delegacion.id, nueva_delegacion.nombre
    ];
    return client.query(query, values);
}

module.exports.migrarDelegacion = function () {
    let consulta = 'select * from T_SUCURSAL WHERE CODIGO BETWEEN @offset AND @limit';
    let countDelegaciones = 'select COUNT(*) as cant from T_SUCURSAL';
    return connectSql.countSql(countDelegaciones)
        .then(res => {
            if (res && res !== []) {
                let cantDelegaciones = res['cant'];  
                makeJobDelegacion(0, cantDelegaciones, 100, consulta);
            }
            sql.close();
        })
        .catch(err => console.log('No se pudo importar Delegaciones', err))
}