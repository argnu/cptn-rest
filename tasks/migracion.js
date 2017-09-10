const {
    Pool
} = require('pg');
const config = require('../config.private');
const pool = new Pool(config.db);
const migracionInstitucion = require('./migracionInstitucion');

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

migracionInstitucion.migrarInstitucion();