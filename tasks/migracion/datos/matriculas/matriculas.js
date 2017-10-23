const config = require('../../../config.private');
const connector = require('../../../connector');
const sql = require('sql');
sql.setDialect('postgres');
const model = require('../../../model');
const sqlserver = require('../../sqlserver');

function makeJobMatriculas(i, total, page_size, consulta) {
    if (i < total) {
        let offset = i + page_size;
        return sqlserver.query(consulta, i, offset)
            .then(matriculas => {
                if (matriculas) {
                   nuevasMatriculas = matriculas.map(matricula => createMatricula(matricula));
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
    if (matricula['DOMICREALCALLE'] && matricula['DOMICREALLOCALIDAD'] ){
        let nuevoDomicilio = {};
        nuevoDomicilio['calle'] = matricula['DOMICREALCALLE'];
        nuevoDomicilio['localidad'] = matricula['DOMICREALLOCALIDAD'];
        return nuevoDomicilio;
    }
    else return null;
}

function createDomicilioLegal (matricula){
    if (matricula['DOMICREALCALLE'] && matricula['DOMICREALLOCALIDAD'] ){
        let nuevoDomicilio = {};
        nuevoDomicilio['calle'] = matricula['DOMICLEGALCALLE'];
        nuevoDomicilio['localidad'] = matricula['DOMICLEGALLOCALIDAD'];
        return nuevoDomicilio;
    }
    else return null;
}

function createProfesional(matricula) {
    let nuevoProfesional = {};
    nuevoProfesional['dni'] = matricula['NUMDOCU'];
    nuevoProfesional['apellido'] = matricula['APELLIDO'];
    nuevoProfesional['nombre'] = matricula['NOMBRE'];
    nuevoProfesional['fechaNacimiento'] = matricula['FECNAC_DATE'];
    nuevoProfesional['estadoCivil'] = matricula['ESTADOCIVIL'] == 0 ? null : matricula['ESTADOCIVIL'];
    nuevoProfesional['observaciones'] = matricula['OBSERVACIONES'];

    nuevoProfesional.contactos = [];
    ['TELFIJO', 'TELCEL', 'EMAIL', 'PAGWEB'].forEach((tipo, i) => {
        if (matricula[tipo] && matricula[tipo].length) {
            nuevoProfesional.contactos.push({
                tipo: i + 1, valor: matricula[tipo]
            });
        }
    });

    nuevoProfesional['relacionDependencia'] = matricula['RELACIONLABORAL'];
    nuevoProfesional['empresa'] = matricula['EMPRESA'];
    nuevoProfesional['serviciosPrestados'] = matricula['SERVICIOSPRESTADOS'];
    if (matricula['SERVICIOSPRESTADOS']) {
        nuevoProfesional['independiente'] = 1;
    } else {
        nuevoProfesional['independiente'] = 0;
    }
    nuevoProfesional['poseeCajaPrevisional'] = matricula['CODESTADOCAJA'];
    nuevoProfesional['publicar'] = matricula['PUBLICARDATOS'];
    //Datos para crear la entidad
    nuevoProfesional['tipo'] = 'profesional';
    nuevoProfesional['cuit'] = matricula['CUIT'];

    let condafip = matricula['SITAFIP'];
    if (condafip != null) {
        if (condafip == 9) condafip = null;
        else condafip++
    }

    nuevoProfesional['condafip'] = condafip;
    // Se crean los contactos del profesional

    nuevoProfesional['domicilioReal'] = createDomicilioReal(matricula);
    nuevoProfesional['domicilioLegal'] = createDomicilioLegal(matricula);
    return Profesional.addProfesional(nuevoProfesional);
}

function createMatricula(matricula) {
  return createProfesional(matricula)
         .then(profesional => {
           let nuevaMatricula = {};
           nuevaMatricula.entidad = profesional.entidad;
           nuevaMatricula.solicitud = null;
           nuevaMatricula.fechaResolucion = matricula['FECHARESOLUCION_DATE'];
           nuevaMatricula.numeroMatricula = matricula['NROMATRICULA'];
           nuevaMatricula.numeroActa = matricula['NUMACTA'];
           nuevaMatricula.fechaBaja = matricula['FECHABAJA_DATE'];
           nuevaMatricula.observaciones = matricula['OBSERVACIONES'];
           nuevaMatricula.notasPrivadas = matricula['NOTASPRIVADAS'];
           nuevaMatricula.asientoBajaF = matricula['ASIENTOBAJAF'];
           nuevaMatricula.codBajaF = matricula['CODBAJAF'];
           nuevaMatricula.nombreArchivoFoto = matricula['NOMBREARCHIVOFOTO'];
           nuevaMatricula.nombreArchivoFirma = matricula['NombreArchivoFirma'];
           nuevaMatricula.estado = matricula['ESTADO'];
           nuevaMatricula.idMigracion = matricula['ID'];
           return Matricula.addMatriculaMigracion(nuevaMatricula);
         })
}


module.exports.migrar = function () {
    let consultaMatriculas = 'select M.ID, M.SITAFIP, M.CUIT, ' +
    'M.DOMICREALCALLE, M.DOMICREALCODPOSTAL, ' +
    'M.DOMICREALDEPARTAMENTO, M.DOMICREALLOCALIDAD, ' +
    'M.DOMICREALPROV, M.DOMICREALPAIS, ' +
    'M.DOMICLEGALCALLE, M.DOMICLEGALCODPOSTAL, ' +
    'M.DOMICLEGALDEPARTAMENTO, M.DOMICLEGALLOCALIDAD, ' +
    'M.DOMICLEGALPROV, M.DOMICLEGALPAIS, ' +
    'M.NOMBRE, M.APELLIDO, M.FECNAC_DATE ,M.NUMDOCU, ' +
    'M.ESTADOCIVIL, M.LUGNACCIUDAD as LocalidadNacimiento,' +
    'M.OBSERVACIONES, M.RELACIONLABORAL, M.EMPRESA, M.SERVICIOSPRESTADOS, ' +
    'M.TELFIJO, M.TELCEL, M.EMAIL, M.PAGWEB' +
    'M.PUBLICARDATOS, M.CODESTADOCAJA, ' +
    'M.LEGAJO, M.NROMATRICULA,M.FECHARESOLUCION_DATE, ' +
    'M.NUMACTA, M.FECHABAJA_DATE, M.OBSERVACIONES, M.NOTASPRIVADAS,'  +
    'M.ASIENTOBAJAF, M.CODBAJAF, M.NOMBREARCHIVOFOTO, ' +
    'M.NombreArchivoFirma, M.ESTADO ' +
    'from MATRICULAS M WHERE ID BETWEEN @offset AND @limit';
    let limitesMatriculas = 'select MIN(ID) as minMatriculas, MAX(ID) as maxMatriculas from MATRICULAS';
    return sqlserver.query(limitesMatriculas)
        .then(resultado => {
            if (resultado[0]) {
                let min = resultado[0]['minMatriculas'];
                let max = resultado[0]['maxMatriculas'];
                return makeJobMatriculas(min, max, 100, consultaMatriculas);
            }
            else return;
        })
}
