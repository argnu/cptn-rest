const config = require('../../../config.private');
const sqlserver = require('../sqlserver');
const connector = require('../../../connector');
const sql = require('sql');
sql.setDialect('postgres');
const model = require('../../../model');

function makeJobPaises(i, total, page_100, consulta) {
    if (i < total) {
        let offset = i + page_100;
        return sqlserver.query(consulta, i, offset)
            .then(paises => {
                let nuevosPaises = [];
                if (paises) {
                    paises.forEach(pais => {
                        let nuevoPais = {};
                        nuevoPais['id'] = pais['CODIGO'];
                        nuevoPais['nombre'] = pais['DESCRIPCION'];
                        nuevosPaises.push(addPais(nuevoPais));
                    });
                    return Promise.all(nuevosPaises).then(res =>
                      makeJobPaises(offset + 1, total, page_100, consulta)
                    );
                }
                else return makeJobPaises(offset + 1, total, page_100, consulta);
            });
    }
}

function makeJobProvincia(i, total, page_100, consulta) {
    if (i < total) {
        let offset = i + page_100;
        return sqlserver.query(consulta, i, offset)
            .then(provincias => {
                let listaProvincias = [];
                if (provincias) {
                    provincias.forEach(provincia => {
                        let nuevaProvincia = {};
                        nuevaProvincia['id'] = provincia['CODPROVINCIA'];
                        nuevaProvincia['nombre'] = provincia['DESCRIPCION'];
                        nuevaProvincia['pais'] = provincia['CODPAIS'];
                        listaProvincias.push(addProvincia( nuevaProvincia));
                    });
                    return Promise.all(listaProvincias).then(res =>
                        makeJobProvincia(offset + 1, total, page_100, consulta)
                    );
                }
                else return makeJobProvincia(offset + 1, total, page_100, consulta);
            });
    }
}

function makeJobDepartamento(i, total, page_100, consulta) {
    if (i < total) {
        let offset = i + page_100;
        return sqlserver.query(consulta, i, offset)
            .then(departamentos => {
                let listaDepartamentos = [];
                if (departamentos) {
                    departamentos.forEach(dpto => {
                        let nuevoDepartamento = {};
                        nuevoDepartamento['id'] = dpto['CODDEPARTAMENTO'];
                        nuevoDepartamento['nombre'] = dpto['DESCRIPCION'];
                        nuevoDepartamento['provincia'] = dpto['CODPROVINCIA'];
                        listaDepartamentos.push(addDepartamento(nuevoDepartamento));
                    });
                    return Promise.all(listaDepartamentos).then(res =>
                        makeJobDepartamento(offset + 1, total, page_100, consulta)
                    );
                }
                else return makeJobDepartamento(offset + 1, total, page_100, consulta);
            });
    }
}

function makeJobLocalidad(i, total, page_100, consulta) {
    if (i < total) {
        let offset = i + page_100;
        return sqlserver.query(consulta, i, offset)
            .then(localidades => {
                let listaLocalidades = [];
                if (localidades) {
                    localidades.forEach(localidad => {
                        let nuevaLocalidad = {};
                        nuevaLocalidad['id'] = localidad['CODIGO'];
                        nuevaLocalidad['nombre'] = localidad['DESCRIPCION'];
                        nuevaLocalidad['departamento'] = localidad['CODDEPARTAMENTO'];
                        listaLocalidades.push(addLocalidad(nuevaLocalidad));
                    });
                    return Promise.all(listaLocalidades).then(res =>
                      makeJobLocalidad(offset + 1, total, page_100, consulta)
                    );
                }
                else return makeJobLocalidad(offset + 1, total, page_100, consulta);
            });
    }
}


function addPais(nuevo_pais) {
    let table = model.Pais.table;
    let query = table.insert(
                  table.id.value(nuevo_pais.id),
                  table.nombre.value(nuevo_pais.nombre)
                ).toQuery();

    return connector.execQuery(query);
}

function addProvincia(nueva_provincia) {
    let table = model.Provincia.table;
    let query = table.insert(
                  table.id.value(nueva_provincia.id),
                  table.nombre.value(nueva_provincia.nombre),
                  table.pais.value(nueva_provincia.pais)
                ).toQuery();

    return connector.execQuery(query);
}

function addDepartamento(nuevo_departamento) {
    let table = model.Departamento.table;
    let query = table.insert(
                  table.id.value(nuevo_departamento.id),
                  table.nombre.value(nuevo_departamento.nombre),
                  table.provincia.value(nuevo_departamento.provincia)
                ).toQuery();

    return connector.execQuery(query);
}

function addLocalidad(nueva_localidad) {
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
    let limites = 'select MIN(CODIGO) as min, MAX(CODIGO) as max from T_PAIS';

    return sqlserver.query(limites)
            .then(resultado => {
                if (resultado[0]) {
                    let min = resultado[0]['min'];
                    let max = resultado[0]['max'];
                    return makeJobPaises(min, max, 100, consultaPaises);
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
    let limites = 'select MIN(CODIGO) as min, MAX(CODIGO) as max from T_PCIAS';

    return sqlserver.query(limites)
            .then(resultado => {
                if (resultado[0]) {
                    let min = resultado[0]['min'];
                    let max = resultado[0]['max'];
                    return makeJobProvincia(min, max, 100, consultaProvincias);
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
    let limites = 'select MIN(CODIGO) as min, MAX(CODIGO) as max from T_DEPTOS';


    return sqlserver.query(limites)
            .then(resultado => {
                if (resultado[0]) {
                    let min = resultado[0]['min'];
                    let max = resultado[0]['max'];
                    return makeJobDepartamento(min, max, 100, consultaDepartamentos);
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
    let limites = 'select MIN(CODIGO) as min, MAX(CODIGO) as max from T_LOCALIDAD';
    
    return sqlserver.query(limites)
            .then(resultado => {
                if (resultado[0]) {
                    let min = resultado[0]['min'];
                    let max = resultado[0]['max'];
                    return makeJobLocalidad(min, max, 100, consultaLocalidad);
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
