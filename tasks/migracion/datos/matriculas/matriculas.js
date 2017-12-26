const connector = require('../../../../connector');
const sql = require('sql');
sql.setDialect('postgres');
const model = require('../../../../model');
const utils = require('../../utils');


function createDomicilioReal (matricula) {
    if (matricula['DOMICREALCALLE'] && matricula['DOMICREALLOCALIDAD'] ){
        let nuevoDomicilio = {};
        nuevoDomicilio['calle'] = matricula['DOMICREALCALLE'].trim();
        nuevoDomicilio['localidad'] = matricula['DOMICREALLOCALIDAD'];
        return nuevoDomicilio;
    }
    else return null;
}

function createDomicilioProfesional (matricula) {
    if (matricula['DOMICLEGALCALLE'] && matricula['DOMICLEGALLOCALIDAD'] ){
        let nuevoDomicilio = {};
        nuevoDomicilio['calle'] = matricula['DOMICLEGALCALLE'].trim();
        nuevoDomicilio['localidad'] = matricula['DOMICLEGALLOCALIDAD'];
        return nuevoDomicilio;
    }
    else return null;
}

function createProfesional(matricula) {
    let nuevoProfesional = {};
    nuevoProfesional['dni'] = matricula['NUMDOCU'].trim();
    nuevoProfesional['apellido'] = matricula['APELLIDO'].trim();
    nuevoProfesional['nombre'] = matricula['NOMBRE'].trim();
    nuevoProfesional['fechaNacimiento'] = utils.getFecha(matricula['FECNAC_DATE']);
    nuevoProfesional['estadoCivil'] = matricula['ESTADOCIVIL'] + 1;
    nuevoProfesional['observaciones'] = matricula['OBSERVACIONES'].trim();
    nuevoProfesional['lugarNacimiento'] = matricula['lugarNacimiento'].trim();

    nuevoProfesional.contactos = [];
    ['TELFIJO', 'TELCEL', 'EMAIL', 'PAGWEB'].forEach((tipo, i) => {
        if (matricula[tipo] && matricula[tipo].length) {
            nuevoProfesional.contactos.push({
                tipo: i + 1, valor: matricula[tipo].trim()
            });
        }
    });

    nuevoProfesional['relacionDependencia'] = matricula['RELACIONLABORAL'];
    nuevoProfesional['empresa'] = matricula['EMPRESA'].trim();
    nuevoProfesional['serviciosPrestados'] = matricula['SERVICIOSPRESTADOS'].trim();
    if (matricula['SERVICIOSPRESTADOS']) {
        nuevoProfesional['independiente'] = 1;
    } else {
        nuevoProfesional['independiente'] = 0;
    }
    nuevoProfesional['poseeCajaPrevisional'] = (matricula['CODESTADOCAJA'] == 2);
    nuevoProfesional['publicar'] = matricula['PUBLICARDATOS'];
    //Datos para crear la entidad
    nuevoProfesional['tipo'] = 'profesional';
    nuevoProfesional['cuit'] = matricula['CUIT'].trim();

    let condafip = matricula['SITAFIP'];
    if (condafip != null) {
        if (condafip == 9) condafip = null;
        else condafip++
    }

    nuevoProfesional['condafip'] = condafip;
    // Se crean los contactos del profesional

    nuevoProfesional['domicilioReal'] = createDomicilioReal(matricula);
    nuevoProfesional['domicilioProfesional'] = createDomicilioProfesional(matricula);
    return model.Profesional.addProfesional(nuevoProfesional);
}

const addMatricula = (matricula) => {
  return createProfesional(matricula)
         .then(profesional => {
            let nuevaMatricula = {};
            nuevaMatricula.entidad = profesional.id;
            nuevaMatricula.solicitud = null;
            nuevaMatricula.fechaResolucion = utils.getFecha(matricula['FECHARESOLUCION_DATE']);
            nuevaMatricula.numeroMatricula = matricula['NROMATRICULA'].trim();
            nuevaMatricula.numeroActa = matricula['NUMACTA'].trim();
            nuevaMatricula.fechaBaja = utils.getFecha(matricula['FECHABAJA_DATE']);
            nuevaMatricula.observaciones = matricula['OBSERVACIONES'].trim();
            nuevaMatricula.notasPrivadas = matricula['NOTASPRIVADAS'].trim();
            nuevaMatricula.asientoBajaF = matricula['ASIENTOBAJAF'].trim();
            nuevaMatricula.codBajaF = matricula['CODBAJAF'].trim();
            nuevaMatricula.estado = matricula['ESTADO'];
            nuevaMatricula.idMigracion = matricula['ID'];
            nuevaMatricula.legajo = matricula['LEGAJO'];
           return model.Matricula.addMatriculaMigracion(nuevaMatricula);
         })
}


module.exports.migrar = function() {
    console.log('Migrando matrículas...');
    let q_objetos = `select M.ID, M.SITAFIP, M.CUIT, 
        M.DOMICREALCALLE, M.DOMICREALCODPOSTAL, 
        M.DOMICREALDEPARTAMENTO, M.DOMICREALLOCALIDAD, 
        M.DOMICREALPROV, M.DOMICREALPAIS, 
        M.DOMICLEGALCALLE, M.DOMICLEGALCODPOSTAL, 
        M.DOMICLEGALDEPARTAMENTO, M.DOMICLEGALLOCALIDAD, 
        M.DOMICLEGALPROV, M.DOMICLEGALPAIS, 
        M.NOMBRE, M.APELLIDO, M.FECNAC_DATE ,M.NUMDOCU, 
        M.ESTADOCIVIL, l.DESCRIPCION as lugarNacimiento,
        M.OBSERVACIONES, M.RELACIONLABORAL, M.EMPRESA, M.SERVICIOSPRESTADOS, 
        M.TELFIJO, M.TELCEL, M.EMAIL, M.PAGWEB, 
        M.PUBLICARDATOS, M.CODESTADOCAJA, 
        M.LEGAJO, M.NROMATRICULA, M.FECHARESOLUCION_DATE, 
        M.NUMACTA, M.FECHABAJA_DATE, M.OBSERVACIONES, M.NOTASPRIVADAS,
        M.ASIENTOBAJAF, M.CODBAJAF, M.NOMBREARCHIVOFOTO, 
        M.NombreArchivoFirma, M.ESTADO 
    from MATRICULAS M left join T_LOCALIDAD l
    on m.LUGNACCIUDAD = l.CODIGO
    WHERE ID BETWEEN @offset AND @limit;`
    let q_limites = 'select MIN(ID) as min, MAX(ID) as max from MATRICULAS';

    return utils.migrar(q_objetos, q_limites, 100, addMatricula);
}
