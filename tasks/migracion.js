const {
    Pool
} = require('pg');
const config = require('../config.private');
const pool = new Pool(config.db);
const sql = require('mssql');

function makeJobFormacion(i, total, page_size, consulta) {
    if (i * page_size < total) {
        let offset = i * page_size;
        consultaSql(consulta, offset, page_size)
            .then(rows => {
                let nuevasInstituciones = [];
                if (rows) {
                    // rows.forEach(universidad => {
                    //     let nuevaUniversidad = {};
                    //     nuevaUniversidad['id'] = universidad.codigo;
                    //     nuevaUniversidad['nombre'] = localidad.descripcion;
                    //     nuevasInstituciones.push(addInstitucion(pool, nuevaUniversidad));
                    // });
                    // rows.map(function (institucion) {
                        
                    //   }).pop().on('end', function () {
                    //     makeJobFormacion(i + 1, total, page_size, consulta);
                    //   })
                    console.log('Filas', rows);
                    
                    // Promise.all(nuevasInstituciones).then(function() {
                    //     makeJobFormacion(i + 1, total, page_size, consulta)
                    // });
                }

            })
            .catch(error => {

            })
    }

}

function consultaSql(consulta, offset, limit) {
    // consulta debe tener la sentenacia order by [any field]
    return new Promise((resolve, reject) => {
        sql.connect(config.dbMssql, function (err) {
            if (err) {
                console.log("Error de Conexión", err);
                reject(err);
            }
            new sql.Request()
                .input('offset', offset)
                .input('limit', limit)
                .query(query)
                .then(listaRow => {
                    resolve(listaRow);
                })
                .catch(error => {
                    console.log('Error', error);
                    reject(error);
                })
        })

    }); //Fin Promise

};

function countSql(table) {
    return new Promise((resolve, reject) => {
        sql.connect(config.dbMssql, function (err) {
            if (err) {
                console.log("Error de Conexión", err);
                reject(err);
            }
            new sql.Request()
                .query(query)
                .then(cantidadRows => {
                    resolve(cantidadRows);
                })
                .catch(error => {
                    console.log('Error', error);
                    reject(error);
                })
        })

    }); //Fin Promise

};




function migrateFormacion() {
    consultaSql('select * from T_Universidad').then(listaUniversidades => {
            if (listaUniversidades) {
                listaUniversidades.forEach(universidad => {
                    let nuevaUniversidad = {};
                    nuevaUniversidad['id'] = universidad.codigo;
                    nuevaUniversidad['nombre'] = localidad.descripcion;
                });
                addInstitucion(pool, nuevaUniversidad);
            }
        })
        .catch(err => {
            console.log('Error', err);
        });
}


// function migrateDatosGeograficos() {
//     consultaSql('select * from T_PAIS').then(listaPais => {
//         //Se realiza la migración de los paises
//         if (listaPais) {
//             listaPais.forEach(function (pais) {
//                 //Se inserta en la tabla correspondiente
//                 let nuevoPais = {};
//                 nuevoPais['id'] = pais.codigo;
//                 nuevoPais['nombre'] = pais.descripcion;
//                 addPais(pool, nuevoPais);
//             });
//         }
//         console.log(listaPais);
//         //Se realiza la migracion de las provincias
//         consultaSql('select * from T_PCIAS').then(listaProvincias => {
//             if (listaProvincias) {
//                 listaProvincias.forEach(provincia => {
//                     let nuevaProvincia = {};
//                     nuevaProvincia['id'] = provincia.codprovincia;
//                     nuevaProvincia['nombre'] = provincia.descripcion;
//                     nuevaProvincia['idPais'] = provincia.codPais;
//                 });
//                 addProvincia(pool, nuevaProvincia);
//             }
//             //Se realiza la migracion de los Departamentos
//             consultaSql('select * from T_DPTO').then(listaDepartamentos => {
//                     if (listaDepartamentos) {
//                         listaDepartamentos.forEach(departamento => {
//                             let nuevoDpto = {};
//                             nuevoDpto['id'] = departamento.coddepartamento;
//                             nuevoDpto['nombre'] = departamento.descripcion;
//                             nuevoDpto['idProvincia'] = departamento.codprovincia;
//                         });
//                         addDepartamento(pool, nuevoDpto);
//                     }
//                     //Se realiza la migracion de las localidades
//                     consultaSql('select * from T_LOCALIDAD').then(listaLocalidades => {
//                             if (listaLocalidades) {
//                                 listaLocalidades.forEach(localidad => {
//                                     let nuevaLocalidad = {};
//                                     nuevaLocalidad['id'] = localidad.codigo;
//                                     nuevaLocalidad['nombre'] = localidad.descripcion;
//                                     nuevaLocalidad['idProvincia'] = localidad.coddepartamento;
//                                 });
//                                 addLocalidad(pool, nuevaLocalidad);
//                             }

//                         })
//                         .catch(err => {
//                             console.log('Error', err);
//                         });

//                 })
//                 .catch(err => {
//                     console.log('Error', err);
//                 });


//         })
//     })
// }


// function addPais(client, nuevo_pais) {
//     let query = `
//       INSERT INTO pais (
//         id, nombre)
//       VALUES($1, $2)
//     `;
//     let values = [
//         nuevo_pais.id, nuevo_pais.nombre
//     ];

//     return client.query(query, values);
// }

// function addProvincia(client, nueva_provincia) {
//     let query = `
//       INSERT INTO provincia (
//         id, nombre, idPais)
//       VALUES($1, $2, $3)
//     `;
//     let values = [
//         nueva_provincia.id, nueva_provincia.nombre, nueva_provincia.idPais
//     ];

//     return client.query(query, values);
// }

// function addDepartamento(client, nuevo_Departamento) {
//     let query = `
//       INSERT INTO departamento (
//         id, nombre, idProvincia)
//       VALUES($1, $2, $3)
//     `;
//     let values = [
//         nuevo_Departamento.id, nuevo_Departamento.nombre, nuevo_Departamento.idProvincia
//     ];

//     return client.query(query, values);
// }

// function addLocalidad(client, nueva_Localidad) {
//     let query = `
//       INSERT INTO localidad (
//         id, nombre, idDepartamento)
//       VALUES($1, $2, $3)
//     `;
//     let values = [
//         nuevo_Departamento.id, nuevo_Departamento.nombre, nuevo_Departamento.idDepartamento
//     ];

//     return client.query(query, values);
// }


function addInstitucion(client, nueva_institucion) {
    let query = `
     "INSERT INTO institucion (
        id, nombre)
      VALUES($1, $2)
    `;
    let values = [
        nueva_institucion.id, nueva_institucion.nombre
    ];

    return client.query(query, values);
}




let consulta = 'select * from T_Universidad ORDER BY CODIGO';
// migrateDatosGeograficos();
makeJobFormacion(0,800,10, consulta);