const {
    Pool
} = require('pg');
const config = require('../config.private');
const pool = new Pool(config.db);
const connectSql = require('./connectSql');

function makeJobPaises(i, total, page_size, consulta) {
    if (i < total) {
        let offset = i + page_size;
        return connectSql.consultaSql(consulta, i, offset)
            .then(paises => {
                let nuevosPaises = [];
                if (paises) {
                    paises.forEach(pais => {
                        let nuevoPais = {};
                        nuevoPais['id'] = pais['CODIGO'];
                        nuevoPais['nombre'] = pais['DESCRIPCION'];
                        nuevosPaises.push(addPais(pool, nuevoPais));
                    });
                    return Promise.all(nuevosPaises).then(res =>
                      makeJobPaises(offset + 1, total, page_size, consulta)
                    );
                }
                else return makeJobPaises(offset + 1, total, page_size, consulta);
            });
    }
}

function makeJobProvincia(i, total, page_size, consulta) {
    if (i < total) {
        let offset = i + page_size;
        return connectSql.consultaSql(consulta, i, offset)
            .then(provincias => {
                let listaProvincias = [];
                if (provincias) {
                    provincias.forEach(provincia => {
                        let nuevaProvincia = {};
                        nuevaProvincia['id'] = provincia['CODPROVINCIA'];
                        nuevaProvincia['nombre'] = provincia['DESCRIPCION'];
                        nuevaProvincia['pais'] = provincia['CODPAIS'];
                        listaProvincias.push(addProvincia(pool, nuevaProvincia));
                    });
                    return Promise.all(listaProvincias).then(res =>
                        makeJobProvincia(offset + 1, total, page_size, consulta)
                    );
                }
                else return makeJobProvincia(offset + 1, total, page_size, consulta);
            });
    }
}

function makeJobDepartamento(i, total, page_size, consulta) {
    if (i < total) {
        let offset = i + page_size;
        return connectSql.consultaSql(consulta, i, offset)
            .then(departamentos => {
                let listaDepartamentos = [];
                if (departamentos) {
                    departamentos.forEach(dpto => {
                        let nuevoDepartamento = {};
                        nuevoDepartamento['id'] = dpto['CODDEPARTAMENTO'];
                        nuevoDepartamento['nombre'] = dpto['DESCRIPCION'];
                        nuevoDepartamento['provincia'] = dpto['CODPROVINCIA'];
                        listaDepartamentos.push(addDepartamento(pool, nuevoDepartamento));
                    });
                    return Promise.all(listaDepartamentos).then(res =>
                        makeJobDepartamento(offset + 1, total, page_size, consulta)
                    );
                }
                else return makeJobDepartamento(offset + 1, total, page_size, consulta);
            });
    }
}

function makeJobLocalidad(i, total, page_size, consulta) {
    if (i < total) {
        let offset = i + page_size;
        return connectSql.consultaSql(consulta, i, offset)
            .then(localidades => {
                let listaLocalidades = [];
                if (localidades) {
                    localidades.forEach(localidad => {
                        let nuevaLocalidad = {};
                        nuevaLocalidad['id'] = localidad['CODIGO'];
                        nuevaLocalidad['nombre'] = localidad['DESCRIPCION'];
                        nuevaLocalidad['departamento'] = localidad['CODDEPARTAMENTO'];
                        listaLocalidades.push(addLocalidad(pool, nuevaLocalidad));
                    });
                    return Promise.all(listaLocalidades).then(res =>
                      makeJobLocalidad(offset + 1, total, page_size, consulta)
                    );
                }
                else return makeJobLocalidad(offset + 1, total, page_size, consulta);
            });
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
        id, nombre, pais)
      VALUES($1, $2, $3)
    `;
    let values = [
        nueva_provincia.id, nueva_provincia.nombre, nueva_provincia.pais
    ];

    return client.query(query, values);
}

function addDepartamento(client, nuevo_Departamento) {
    let query = `
      INSERT INTO departamento (
        id, nombre, provincia)
      VALUES($1, $2, $3)
    `;
    let values = [
        nuevo_Departamento.id, nuevo_Departamento.nombre, nuevo_Departamento.provincia
    ];

    return client.query(query, values);
}

function addLocalidad(client, nueva_Localidad) {
    let query = `
      INSERT INTO localidad (
        id, nombre, departamento)
      VALUES($1, $2, $3)
    `;
    let values = [
        nueva_Localidad.id, nueva_Localidad.nombre, nueva_Localidad.departamento
    ];

    return client.query(query, values);
}


function migrarPaises() {
    let consultaPaises = 'select * from T_PAIS WHERE CODIGO BETWEEN @offset AND @limit';
    let countPaises = 'select COUNT(*) as cantPaises from T_PAIS';
    let size = 100;

    return connectSql.countSql(countPaises)
            .then(resultado => {
                if (resultado) {
                    let cantPaises = resultado['cantPaises'];
                    console.log('Cantidad Paises', cantPaises);
                    if (cantPaises < size) {
                        size = cantPaises;
                    }
                    return makeJobPaises(0, cantPaises, size, consultaPaises);
                }
                else return;
            })
            .catch(err => {
                console.log('No se pudo importar Paises', err);
                throw Error(err);
            })
}

migrarProvincias = function () {
    let consultaProvincias = 'select * from T_PCIAS WHERE CODPROVINCIA BETWEEN @offset AND @limit';
    let countProvincia = 'select COUNT(*) as cantProvincias from T_PCIAS';
    let size = 100;
    return connectSql.countSql(countProvincia)
            .then(resultado => {
                if (resultado) {
                    let cantProvincias = resultado['cantProvincias'];
                    console.log('Cantidad Provincias', cantProvincias);
                    if (cantProvincias < size) {
                        size = cantProvincias;
                    }
                    return makeJobProvincia(0, cantProvincias, size, consultaProvincias);
                }
                else return;
            })
            .catch(err => {
                console.log('No se pudo importar Provincias', err);
                throw Error(err);
            })
}

migrarDepartamentos = function () {
    let consultaDepartamentos = 'select * from T_DEPTOS WHERE CODDEPARTAMENTO BETWEEN @offset AND @limit';
    let countDepartamentos = 'select COUNT(*) as cantDepartamentos from T_DEPTOS';
    let sizeDptos = 100;
    return connectSql.countSql(countDepartamentos)
            .then(resultado => {
                if (resultado) {
                    let cantDptos = resultado['cantDepartamentos'];
                    if (cantDptos < sizeDptos) {
                        sizeDptos = cantDptos;
                    }
                    return makeJobDepartamento(0, cantDptos, sizeDptos, consultaDepartamentos);
                }
                else return;
            })
            .catch(err => {
                console.log('No se pudo importar Departamentos', err);
                throw Error(err);
            });
}

migrarLocalidad = function () {
    let consultaLocalidad = 'select * from T_LOCALIDAD WHERE CODIGO BETWEEN @offset AND @limit';
    let countLocalidad = 'select COUNT(*) as cantLocalidades from T_LOCALIDAD';
    let size = 100;
    return connectSql.countSql(countLocalidad)
            .then(resultado => {
                if (resultado) {
                    let cantLocalidad = resultado['cantLocalidad'];
                    console.log('Cantidad Localidad', cantLocalidad);
                    if (cantLocalidad < size) {
                        size = cantLocalidad;
                    }
                    return makeJobLocalidad(0, cantLocalidad, size, consultaLocalidad);
                }
                else return;
            })
            .catch(err => {
                console.log('No se pudo importar Localidades', err);
                throw Error(err);
            });
}

module.exports.migrarDatosGeograficos = function () {
    migrarPaises()
        .then(r => migrarProvincias())
        .then(r => migrarDepartamentos())
        .then(r => migrarLocalidad())
        .then(r => console.log('Migrado!'))
        .catch(err => console.log('No se pudo importar DatosGeograficos', err))
}
