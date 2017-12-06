const connector = require('../../../../connector');
const sql = require('sql');
sql.setDialect('postgres');
const model = require('../../../../model');
const utils = require('../../utils');


function createDomicilioReal (matricula) {
    if (matricula['DOMICREALCALLE'] && matricula['DOMICREALLOCALIDAD'] ){
        let nuevoDomicilio = {};
        nuevoDomicilio['calle'] = matricula['DOMICREALCALLE'];
        nuevoDomicilio['localidad'] = matricula['DOMICREALLOCALIDAD'];
        return nuevoDomicilio;
    }
    else return null;
}

function createDomicilioProfesional (matricula) {
    if (matricula['DOMICLEGALCALLE'] && matricula['DOMICLEGALLOCALIDAD'] ){
        let nuevoDomicilio = {};
        nuevoDomicilio['calle'] = matricula['DOMICLEGALCALLE'];
        nuevoDomicilio['localidad'] = matricula['DOMICLEGALLOCALIDAD'];
        return nuevoDomicilio;
    }
    else return null;
}

function createEmpresa(matricula) {
    let nuevaEmpresa = {};
    nuevaEmpresa['nombre'] = matricula['NOMBRE'];
    // nuevaEmpresa['cuit'] = matricula['CUIT'];
    nuevaEmpresa['fechaInicio'] = utils.getFecha(matricula['FECHAINC_DATE']);
    nuevaEmpresa['tipoEmpresa'] = matricula['TIPOEMPRESA'];
    nuevaEmpresa['tipoSociedad'] = matricula['TIPOSOCIEDAD'] ? matricula['TIPOSOCIEDAD'] : null;
    nuevaEmpresa['fechaConstitucion'] = utils.getFecha(matricula['FECHACONSTITUCION_date']);

    nuevaEmpresa.contactos = [];
    ['TELFIJO', 'TELCEL', 'EMAIL', 'PAGWEB'].forEach((tipo, i) => {
        if (matricula[tipo] && matricula[tipo].length) {
            nuevaEmpresa.contactos.push({
                tipo: i + 1, valor: matricula[tipo]
            });
        }
    });

    //Datos para crear la entidad
    nuevaEmpresa['tipo'] = 'empresa';
    nuevaEmpresa['cuit'] = matricula['CUIT'];

    let condafip = matricula['SITAFIP'];
    if (condafip != null) {
        if (condafip == 9) condafip = null;
        else condafip++
    }

    nuevaEmpresa['condafip'] = condafip;

    nuevaEmpresa['domicilioReal'] = createDomicilioReal(matricula);
    nuevaEmpresa['domicilioProfesional'] = createDomicilioProfesional(matricula);
    return model.Empresa.add(nuevaEmpresa);
}

const addMatricula = (matricula) => {
  return createEmpresa(matricula)
         .then(empresa => {
           let nuevaMatricula = {};
           nuevaMatricula.entidad = empresa.id;
           nuevaMatricula.solicitud = null;
           nuevaMatricula.fechaResolucion = utils.getFecha(matricula['FECHARESOLUCION_DATE']);
           nuevaMatricula.numeroMatricula = matricula['NROMATRICULA'];
           nuevaMatricula.numeroActa = matricula['NUMACTA'];
           nuevaMatricula.observaciones = matricula['OBSERVACIONES'];
           //nuevaMatricula.notasPrivadas = matricula['NOTASPRIVADAS'];
           nuevaMatricula.estado = matricula['ESTADO'];
           nuevaMatricula.idMigracion = matricula['ID'];
           return model.Matricula.addMatriculaMigracion(nuevaMatricula);
         })
}


module.exports.migrar = function() {
    console.log('Migrando empresas...');
    let q_objetos = 'select * ' +
    'from EMPRESAS WHERE ID BETWEEN @offset AND @limit';
    let q_limites = 'select MIN(ID) as min, MAX(ID) as max from EMPRESAS';

    return utils.migrar(q_objetos, q_limites, 100, addMatricula);
}
