const {
    Pool
} = require('pg');
const config = require('../config.private');
const pool = new Pool(config.db);
const connectSql = require('./connectSql');

function makeJobMatriculas(i, total, page_size, consulta) {
    if (i < total) {
        let offset = i + page_size;
        return connectSql.consultaSql(consulta, i, offset)
            .then(matriculas => {
                let nuevasMatriculas = [];
                if (matriculas) {
                    matriculas.forEach(matricula => {
                        let nuevaMatricula = {};
                        
                        //TODO: crear Domicilios
                        // crear Entidad
                        // crear Profesional
                        //      crear Matriculas
                        // nuevasMatriculas.push ...
                    });
                   return Promise.all(nuevasMatriculas).then(res =>
                    makeJobMatriculas(offset + 1, total, page_size, consulta)
                  );
                }
                else return makeJobMatriculas(offset + 1, total, page_size, consulta);
            })
            .catch(error => {
                console.log('ERROR', error);
            })
    }

}

function createDomicilioReal (matricula){
    let nuevoDomicilio = {};
    nuevoDomicilio['calle'] = matricula['DOMICREALCALLE'];
    nuevoDomicilio['localidad'] = matricula['DOMICREALLOCALIDAD'];
    return nuevoDomicilio;
}

function createDomicilioLegal (matricula){
    let nuevoDomicilio = {};
    nuevoDomicilio['calle'] = matricula['DOMICLEGALCALLE'];
    nuevoDomicilio['localidad'] = matricula['DOMICLEGALLOCALIDAD'];
    return nuevoDomicilio;
}

function createProfesional(matricula){
    let nuevoProfesional = {};
    nuevoProfesional['dni'] = matricula['NUMDOC'];
    nuevoProfesional['apellido'] = matricula['APELLIDO'];
    nuevoProfesional['nombre'] = matricula['NOMBRE'];
    nuevoProfesional['fechaNacimiento'] = matricula['apellido'];
    //nuevoProfesional['sexo'] 
    nuevoProfesional['estadoCivil'] = matricula['ESTADOCIVIL'];
    nuevoProfesional['observaciones'] = matricula['OBSERVACIONES'];
    nuevoProfesional['relacionLaboral'] = matricula['RELACIONLABORAL'];
    nuevoProfesional['empresa'] = matricula['EMPRESA'];
    nuevoProfesional['serviciosPrestados'] = matricula['SERVICIOSPRESTADOS'];
    nuevoProfesional['cajaPrevisional'] = matricula['apellido'];
    nuevoProfesional['publicar'] = matricula['PUBLICARDATOS'];
    //Datos para crear la entidad
    nuevoProfesional['tipo'] = 'profesional';
    nuevoProfesional['cuit'] = matricula['CUIT'];
    nuevoProfesional['condafip'] = matricula['SITAFIP'];
    nuevoProfesional['domicilioReal'] = createDomicilioReal(matricula);
    nuevoProfesional['domicilioLegal'] = createDomicilioLegal(matricula);
}

function createMatricula(){
    
}


module.exports.migrarMatriculas = function () {
    let consultaMatriculas = 'select M.SITAFIP, M.CUIT, ' +
    'M.DOMICREALCALLE, M.DOMICREALCODPOSTAL, ' +
    'M.DOMICREALDEPARTAMENTO, M.DOMICREALLOCALIDAD, ' +
    'M.DOMICREALPROV, M.DOMICREALPAIS, ' +
    'M.DOMICLEGALCALLE, M.DOMICLEGALCODPOSTAL, ' +
    'M.DOMICLEGALDEPARTAMENTO, M.DOMICLEGALLOCALIDAD, ' +
    'M.DOMICLEGALPROV, M.DOMICLEGALPAIS, ' +
    'M.NOMBRE, M.APELLIDO, M.FECNAC_DATE ,M.NUMDOCU, ' +
    'M.ESTADOCIVIL, M.LUGNACCIUDAD as LocalidadNacimiento,' +
    'M.OBSERVACIONES, M.RELACIONLABORAL,M.EMPRESA, M.SERVICIOSPRESTADOS, ' +
    'M.PUBLICARDATOS, ' +
    'M.LEGAJO, M.NROMATRICULA,M.FECHARESOLUCION_DATE, ' + 
    'M.NUMACTA, M.FECHABAJA_DATE, M.OBSERVACIONES, M.NOTASPRIVADAS,'  +
    'M.ASIENTOBAJAF, M.CODBAJAF, M.NOMBREARCHIVOFOTO, ' +
    'M.NombreArchivoFirma, M.ESTADO ' +
    'from MATRICULAS M WHERE ID BETWEEN @offset AND @limit';
    let countMatriculas = 'select COUNT(*) as cantMatriculas from MATRICULAS';
    return connectSql.countSql(countMatriculas)
        .then(res => {
            console.log(res);
            if (res && res !== []) {
                let cantMatriculas = res['cantMatriculas'];  
                makeJobMatriculas(0, cantMatriculas, 100, consultaMatriculas);
            }
        })
        .catch(err => console.log('Error al importar Matriculas', err))
}
