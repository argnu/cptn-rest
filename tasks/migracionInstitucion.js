const {
    Pool
} = require('pg');
const config = require('../config.private');
const pool = new Pool(config.db);
const connectSql = require('./connectSql');


function makeJobInstitucion(i, total, page_size, consulta) {
    if (i < total) {
        let offset = i + page_size;
        connectSql.consultaSql(consulta, i, offset)
            .then(rows => {
                let nuevasInstituciones = [];
                if (rows && rows.recordset) {
                    rows.recordset.forEach(universidad => {
                        let nuevaUniversidad = {};
                        nuevaUniversidad['id'] = universidad['CODIGO'];
                        nuevaUniversidad['nombre'] = universidad['DESCRIPCION'];
                        nuevasInstituciones.push(addInstitucion(pool, nuevaUniversidad));
                    });
                    Promise.all(nuevasInstituciones).then(function () {});
                }
                return makeJobInstitucion(offset + 1, total, page_size, consulta);
            })
            .catch(error => {
                console.log('ERROR', error);
            })
    }

}

function addInstitucion(client, nueva_institucion) {
    let query = `
         INSERT INTO institucion (
            id, nombre)
          VALUES($1, $2)
        `;
    let values = [
        nueva_institucion.id, nueva_institucion.nombre
    ];
    return client.query(query, values);
}

module.exports.migrarInstitucion = function () {
    let consultaInstitucion = 'select * from T_Universidad WHERE CODIGO BETWEEN @offset AND @limit';
    let countInstituciones = 'select COUNT(*) as cantUniversidades from T_Universidad';
    connectSql.countSql(countInstituciones)
        .then(res => {
            if (res && res !== []) {
                let resultado = res[0];
                let cantInstitucion = res['cant'];  
                console.log('Cantidad', cantInstitucion);
                makeJobInstitucion(0, cantInstitucion, 100, consultaInstitucion);
            }
        })
        .catch(err => console.log('No se pudo importar Institucion', err))
    return;
}