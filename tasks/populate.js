const path = require('path');
global.__base = path.join(__dirname, '..');
const connector = require('../connector');
const model = require('../model');

function querysSecuencial(querys) {
  function* getQuery() {
      for(let q of querys) yield connector.execQuery(q);
  }

  var it = getQuery();
  function execQuerys() {
    let q = it.next().value;
    if (q) return q.then(r => execQuerys());
    else return Promise.resolve();
  }

  return execQuerys();
}


function populateEstadoCivil() {
  let querys = [];
  querys.push(model.TipoEstadoCivil.table.insert(model.TipoEstadoCivil.table.valor.value('Casado')).toQuery());
  querys.push(model.TipoEstadoCivil.table.insert(model.TipoEstadoCivil.table.valor.value('Soltero')).toQuery());
  querys.push(model.TipoEstadoCivil.table.insert(model.TipoEstadoCivil.table.valor.value('Divorciado')).toQuery());
  querys.push(model.TipoEstadoCivil.table.insert(model.TipoEstadoCivil.table.valor.value('Viudo')).toQuery());
  querys.push(model.TipoEstadoCivil.table.insert(model.TipoEstadoCivil.table.valor.value('Concubino')).toQuery());
  return querysSecuencial(querys);
}

function populateSexo() {
  let querys = [];
  querys.push(model.TipoSexo.table.insert(model.TipoSexo.table.valor.value('Femenino')).toQuery());
  querys.push(model.TipoSexo.table.insert(model.TipoSexo.table.valor.value('Masculino')).toQuery());
  return querysSecuencial(querys);
}

function populateFormacion() {
  let querys = [];
  querys.push(model.TipoFormacion.table.insert(model.TipoFormacion.table.valor.value('Grado')).toQuery());
  querys.push(model.TipoFormacion.table.insert(model.TipoFormacion.table.valor.value('Posgrado')).toQuery());
  return querysSecuencial(querys);
}

function populateContacto() {
  let querys = [];
  querys.push(model.TipoContacto.table.insert(model.TipoContacto.table.valor.value('Teléfono Fijo')).toQuery());
  querys.push(model.TipoContacto.table.insert(model.TipoContacto.table.valor.value('Teléfono Celular')).toQuery());
  querys.push(model.TipoContacto.table.insert(model.TipoContacto.table.valor.value('Email')).toQuery());
  querys.push(model.TipoContacto.table.insert(model.TipoContacto.table.valor.value('Web')).toQuery());
  return querysSecuencial(querys);
}

function populateVinculo() {
  let querys = [];
  querys.push(model.TipoVinculo.table.insert(model.TipoVinculo.table.valor.value('Esposa/o')).toQuery());
  querys.push(model.TipoVinculo.table.insert(model.TipoVinculo.table.valor.value('Hija/o')).toQuery());
  querys.push(model.TipoVinculo.table.insert(model.TipoVinculo.table.valor.value('Padre/o')).toQuery());
  querys.push(model.TipoVinculo.table.insert(model.TipoVinculo.table.valor.value('Madre/o')).toQuery());  
  return querysSecuencial(querys);
}

function populateEmpresa() {
  let querys = [];
  querys.push(model.TipoEmpresa.table.insert(model.TipoEmpresa.table.valor.value('Unipersonal')).toQuery());
  querys.push(model.TipoEmpresa.table.insert(model.TipoEmpresa.table.valor.value('Societaria')).toQuery());
  return querysSecuencial(querys);
}

function populateSociedad() {
  let querys = [];
  querys.push(model.TipoSociedad.table.insert(model.TipoSociedad.table.valor.value('Anónima')).toQuery());
  querys.push(model.TipoSociedad.table.insert(model.TipoSociedad.table.valor.value('Comercial Colectiva')).toQuery());
  querys.push(model.TipoSociedad.table.insert(model.TipoSociedad.table.valor.value('En Comandita Simple o Por Acciones')).toQuery());
  querys.push(model.TipoSociedad.table.insert(model.TipoSociedad.table.valor.value('De Responsabilidad Limitada')).toQuery());
  querys.push(model.TipoSociedad.table.insert(model.TipoSociedad.table.valor.value('De Capital e Industria')).toQuery());
  querys.push(model.TipoSociedad.table.insert(model.TipoSociedad.table.valor.value('Cooperativa')).toQuery());
  querys.push(model.TipoSociedad.table.insert(model.TipoSociedad.table.valor.value('En Formación')).toQuery());
  querys.push(model.TipoSociedad.table.insert(model.TipoSociedad.table.valor.value('De Hecho')).toQuery());
  querys.push(model.TipoSociedad.table.insert(model.TipoSociedad.table.valor.value('Fideicomiso')).toQuery());
  return querysSecuencial(querys);
}

function populateAfip() {
  let querys = [];
  querys.push(model.TipoCondicionAfip.table.insert(model.TipoCondicionAfip.table.valor.value('Consumidor Final')).toQuery());
  querys.push(model.TipoCondicionAfip.table.insert(model.TipoCondicionAfip.table.valor.value('Responsable Inscripto')).toQuery());
  querys.push(model.TipoCondicionAfip.table.insert(model.TipoCondicionAfip.table.valor.value('Responsable No Inscripto')).toQuery());
  querys.push(model.TipoCondicionAfip.table.insert(model.TipoCondicionAfip.table.valor.value('No Responsable')).toQuery());
  querys.push(model.TipoCondicionAfip.table.insert(model.TipoCondicionAfip.table.valor.value('Exento')).toQuery());
  querys.push(model.TipoCondicionAfip.table.insert(model.TipoCondicionAfip.table.valor.value('Monotributista')).toQuery());
  return querysSecuencial(querys);
}


function populateEstadoLegajo () {
  let querys = [];
  querys.push(model.TipoEstadoLegajo.table.insert(model.TipoEstadoLegajo.table.id.value(0), model.TipoEstadoLegajo.table.valor.value('Eliminada')).toQuery());
  querys.push(model.TipoEstadoLegajo.table.insert(model.TipoEstadoLegajo.table.id.value(1), model.TipoEstadoLegajo.table.valor.value('Pendiente')).toQuery());
  querys.push(model.TipoEstadoLegajo.table.insert(model.TipoEstadoLegajo.table.id.value(2), model.TipoEstadoLegajo.table.valor.value('Pendiente')).toQuery());
  querys.push(model.TipoEstadoLegajo.table.insert(model.TipoEstadoLegajo.table.id.value(3), model.TipoEstadoLegajo.table.valor.value('Aprobada')).toQuery());
  querys.push(model.TipoEstadoLegajo.table.insert(model.TipoEstadoLegajo.table.id.value(4), model.TipoEstadoLegajo.table.valor.value('Pendiente de Pago')).toQuery());
  querys.push(model.TipoEstadoLegajo.table.insert(model.TipoEstadoLegajo.table.id.value(5), model.TipoEstadoLegajo.table.valor.value('Publicada en Acervo')).toQuery());
  querys.push(model.TipoEstadoLegajo.table.insert(model.TipoEstadoLegajo.table.id.value(6), model.TipoEstadoLegajo.table.valor.value('Rechazada')).toQuery());
  querys.push(model.TipoEstadoLegajo.table.insert(model.TipoEstadoLegajo.table.id.value(7), model.TipoEstadoLegajo.table.valor.value('Anulada')).toQuery());
  querys.push(model.TipoEstadoLegajo.table.insert(model.TipoEstadoLegajo.table.id.value(8), model.TipoEstadoLegajo.table.valor.value('Aprobada por Acta')).toQuery());
  return querysSecuencial(querys);
}

function populateEstadoBoleta() {
  let querys = [];
  querys.push(model.TipoEstadoBoleta.table.insert(model.TipoEstadoBoleta.table.id.value(10), model.TipoEstadoBoleta.table.valor.value('Volante de Pago Generado')).toQuery());
  return querysSecuencial(querys);
}

function populateEstadoMatricula() {
  let querys = [];
  querys.push(model.TipoEstadoMatricula.table.insert(model.TipoEstadoMatricula.table.valor.value('Inhabilitado por Res. X')).toQuery());
  return querysSecuencial(querys);
}

function populate() {
  return Promise.all([
    populateEstadoCivil(),
    populateSexo(),
    populateFormacion(),
    populateContacto(),
    populateVinculo(),
    populateSociedad(),
    populateEmpresa(),
    populateAfip(),
    populateEstadoLegajo()
  ]);
}

populate()
.then(r => {
  console.log('Datos agregados!');
  process.exit();
})
.catch(e => console.error(e));
