const config = require('../../config.private');
const sqlserver = require('./sqlserver');
const connector = require('../../connector');
const sql = require('sql');
sql.setDialect('postgres');
const model = require('../../model');

function makeJobPaises(i, total, page_size, consulta) {
    if (i < total) {
        let offset = i + page_size;
        return sqlserver.query(consulta, i, offset)
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
        return sqlserver.query(consulta, i, offset)
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
        return sqlserver.query(consulta, i, offset)
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
        return sqlserver.query(consulta, i, offset)
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
    let table = model.Pais.table;
    let query = table.insert(
                  table.id.value(nuevo_pais.id),
                  table.nombre.value(nuevo_pais.nombre)
                ).toQuery();

    return connector.execQuery(query);
}

function addProvincia(client, nueva_provincia) {
    let table = model.Provincia.table;
    let query = table.insert(
                  table.id.value(nueva_provincia.id),
                  table.nombre.value(nueva_provincia.nombre),
                  table.pais.value(nueva_provincia.pais)
                ).toQuery();

    return connector.execQuery(query);
}

function addDepartamento(client, nuevo_departamento) {
    let table = model.Departamento.table;
    let query = table.insert(
                  table.id.value(nuevo_departamento.id),
                  table.nombre.value(nuevo_departamento.nombre),
                  table.provincia.value(nuevo_departamento.provincia)
                ).toQuery();

    return connector.execQuery(query);
}

function addLocalidad(client, nueva_localidad) {
    let table = model.Localidad.table;
    let query = table.insert(
                  table.id.value(nueva_localidad.id),
                  table.nombre.value(nueva_localidad.nombre),
                  table.departamento.value(nueva_localidad.departamento)
                ).toQuery();

    return connector.execQuery(query);
}


function migrarPaises() {
    let consultaPaises = 'select * from T_PAIS WHERE CODIGO BETWEEN @offset AND @limit';
    let countPaises = 'select COUNT(*) as cantPaises from T_PAIS';
    let size = 100;

    return sqlserver.query(countPaises)
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

function migrarProvincias() {
    let consultaProvincias = 'select * from T_PCIAS WHERE CODPROVINCIA BETWEEN @offset AND @limit';
    let countProvincia = 'select COUNT(*) as cantProvincias from T_PCIAS';
    let size = 100;
    return sqlserver.query(countProvincia)
            .then(resultado => {
                if (resultado[0]) {
                    let cantProvincias = resultado[0]['cantProvincias'];
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

function migrarDepartamentos() {
    let consultaDepartamentos = 'select * from T_DEPTOS WHERE CODDEPARTAMENTO BETWEEN @offset AND @limit';
    let countDepartamentos = 'select COUNT(*) as cantDepartamentos from T_DEPTOS';
    let sizeDptos = 100;
    return sqlserver.query(countDepartamentos)
            .then(resultado => {
                if (resultado[0]) {
                    let cantDptos = resultado[0]['cantDepartamentos'];
                    console.log('Cantidad Departamentos', cantDptos);
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

function migrarLocalidad() {
    let consultaLocalidad = 'select * from T_LOCALIDAD WHERE CODIGO BETWEEN @offset AND @limit';
    let countLocalidad = 'select COUNT(*) as cantLocalidades from T_LOCALIDAD';
    let size = 100;
    return sqlserver.query(countLocalidad)
            .then(resultado => {
                if (resultado[0]) {
                    let cantLocalidad = resultado[0]['cantLocalidades'];
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

module.exports.migrar = function () {
    console.log('Migrando Datos Geográficos...');
    return migrarPaises()
        .then(r => migrarProvincias())
        .then(r => migrarDepartamentos())
        .then(r => migrarLocalidad())
}
