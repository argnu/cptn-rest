const {
    Pool
} = require('pg');
const config = require('../config.private');
const pool = new Pool(config.db);
const connectSql = require('./connectSql');

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

function makeJobPaises(i, total, page_size, consulta) {
    if (i < total) {
        let offset = i + page_size;
        connectSql.consultaSql(consulta, i, offset)
            .then(rows => {
                let nuevosPaises = [];
                if (rows && rows.recordset) {
                    rows.recordset.forEach(pais => {
                        let nuevoPais = {};
                        nuevoPais['id'] = pais['CODIGO'];
                        nuevoPais['nombre'] = pais['DESCRIPCION'];
                        nuevosPaises.push(addPais(pool, nuevoPais));
                    });
                    Promise.all(nuevosPaises).then(function () {});
                }
                return makeJobPaises(offset + 1, total, page_size, consulta);
            })
            .catch(error => {
                console.log('ERROR en Paises', error);
            })
    }
}

function makeJobProvincia(i, total, page_size, consulta) {
    if (i < total) {
        let offset = i + page_size;
        connectSql.consultaSql(consulta, i, offset)
            .then(rows => {
                let listaProvincias = [];
                if (rows && rows.recordset) {
                    rows.recordset.forEach(provincia => {
                        let nuevaProvincia = {};
                        nuevaProvincia['id'] = provincia['CODPROVINCIA'];
                        nuevaProvincia['nombre'] = provincia['DESCRIPCION'];
                        nuevaProvincia['idPais'] = provincia['CODPAIS'];
                        listaProvincias.push(addProvincia(pool, nuevaProvincia));
                    });
                    Promise.all(listaProvincias).then(function () {});
                }
                return makeJobProvincia(offset + 1, total, page_size, consulta);
            })
            .catch(error => {
                console.log('ERROR', error);
            })
    }
}

function makeJobDepartamento(i, total, page_size, consulta) {
    if (i < total) {
        let offset = i + page_size;
        connectSql.consultaSql(consulta, i, offset)
            .then(rows => {
                let listaDepartamentos = [];
                if (rows && rows.recordset) {
                    rows.recordset.forEach(dpto => {
                        let nuevoDepartamento = {};
                        nuevoDepartamento['id'] = dpto['CODPROVINCIA'];
                        nuevoDepartamento['nombre'] = dpto['DESCRIPCION'];
                        nuevoDepartamento['idProvincia'] = dpto['CODPROVINCIA'];
                        listaDepartamentos.push(addDepartamento(pool, nuevoDepartamento));
                    });
                    Promise.all(listaDepartamentos).then(function () {});
                }
                return makeJobDepartamento(offset + 1, total, page_size, consulta);
            })
            .catch(error => {
                console.log('ERROR', error);
            })
    }
}

function makeJobLocalidad(i, total, page_size, consulta) {
    if (i < total) {
        let offset = i + page_size;
        connectSql.consultaSql(consulta, i, offset)
            .then(rows => {
                let listaLocalidades = [];
                if (rows && rows.recordset) {
                    rows.recordset.forEach(localidad => {
                        let nuevaLocalidad = {};
                        nuevaLocalidad['id'] = localidad['CODIGO'];
                        nuevaLocalidad['nombre'] = localidad['DESCRIPCION'];
                        nuevaLocalidad['idDepartamento'] = localidad['CODDEPARTAMENTO'];
                        listaLocalidades.push(addLocalidad(pool, nuevaLocalidad));
                    });
                    Promise.all(listaLocalidades).then(function () {});
                }
                return makeJobLocalidad(offset + 1, total, page_size, consulta);
            })
            .catch(error => {
                console.log('ERROR', error);
            })
    }
}


function addPais(client, nuevo_pais) {
    let query = `
      INSERT INTO pais (
        id, nombre)
      VALUES($1, $2)
    `;
    let values = [
        nuevo_pais.id, nuevo_pais.nombre
    ];

    return client.query(query, values);
}

function addProvincia(client, nueva_provincia) {
    let query = `
      INSERT INTO provincia (
        id, nombre, idPais)
      VALUES($1, $2, $3)
    `;
    let values = [
        nueva_provincia.id, nueva_provincia.nombre, nueva_provincia.idPais
    ];

    return client.query(query, values);
}

function addDepartamento(client, nuevo_Departamento) {
    let query = `
      INSERT INTO departamento (
        id, nombre, idProvincia)
      VALUES($1, $2, $3)
    `;
    let values = [
        nuevo_Departamento.id, nuevo_Departamento.nombre, nuevo_Departamento.idProvincia
    ];

    return client.query(query, values);
}

function addLocalidad(client, nueva_Localidad) {
    let query = `
      INSERT INTO localidad (
        id, nombre, idDepartamento)
      VALUES($1, $2, $3)
    `;
    let values = [
        nueva_Localidad.id, nueva_Localidad.nombre, nueva_Localidad.idDepartamento
    ];

    return client.query(query, values);
}


migrarPaises = function () {
    let consultaPaises = 'select * from T_PAIS WHERE CODIGO BETWEEN @offset AND @limit';
    let countPaises = 'select COUNT(*) as cantPaises from T_PAIS';
    let sizePaises = 100;

    return connectSql.countSql(countPaises)
        .then(res => {
            if (res && res !== []) {
                let resultado = res[0];
                let cantPaises = resultado['cantPaises'];
                console.log('Cantidad Paises', cantPaises);
                if (cantPaises < size) {
                    size = cantPaises;
                }
                makeJobPaises(0, cantPaises, size, consultaPaises);
            }
        })
        .catch(err => console.log('No se pudo importar Paises', err))
}

migrarProvincias = function () {
    let consultaProvincias = 'select * from T_PCIAS WHERE CODPROVINCIA BETWEEN @offset AND @limit';
    let countProvincia = 'select COUNT(*) as cantProvincias from T_PCIAS';
    let size = 100;

    connectSql.countSql(countPaises)
        .then(res => {
            if (res && res !== []) {
                let resultado = res[0];
                let cantProvincias = resultado['cantProvincias'];
                console.log('Cantidad Provincias', cantProvincias);
                if (cantProvincias < size) {
                    size = cantProvincias;
                }
                makeJobProvincia(0, cantProvincias, size, consultaProvincias);
            }
        })
        .catch(err => console.log('No se pudo importar Provincias', err))
}

migrarDepartamentos = function () {
    let consultaDepartamentos = 'select * from T_DEPTOS WHERE CODDEPARTAMENTO BETWEEN @offset AND @limit';
    let countDepartamentos = 'select COUNT(*) as cantDepartamentos from T_DEPTOS';
    let sizeDptos = 100;

    connectSql.countSql(countDepartamentos)
        .then(res => {
            if (res && res !== []) {
                let resultado = res[0];
                let cantDptos = resultado['cantDepartamentos'];
                console.log('Cantidad Departamentos', cantDptos);
                if (cantDptos < sizeDptos) {
                    sizeDptos = cantDptos;
                }
                makeJobDepartamento(0, cantDptos, sizeDptos, consultaDepartamentos);
            }
        })
        .catch(err => console.log('No se pudo importar Departamentos', err))
}

migrarLocalidad = function () {
    let consultaLocalidad = 'select * from T_LOCALIDAD WHERE CODIGO BETWEEN @offset AND @limit';
    let countLocalidad = 'select COUNT(*) as cantLocalidades from T_LOCALIDAD';
    let size = 100;
    return connectSql.countSql(countLocalidad)
        .then(res => {
            if (res && res !== []) {
                let resultado = res[0];
                let cantLocalidad = resultado['cantLocalidad'];
                console.log('Cantidad Localidad', cantLocalidad);
                if (cantLocalidad < size) {
                    size = cantLocalidad;
                }
                makeJobLocalidad(0, cantLocalidad, size, consultaLocalidad);
            }
        })
        .catch(err => console.log('No se pudo importar Localidades', err));
}

module.exports.migrarDatosGeograficos = function () {
    migrarPaises()
        .then(res => {
            console.log('Datos', res);
        })
        .catch(err => console.log('No se pudo importar DatosGeograficos', err))
}