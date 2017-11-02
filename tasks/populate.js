const connector = require('../connector');
const model = require('../model');

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
  querys.push(model.TipoContacto.table.insert(model.TipoContacto.table.valor.value('Fijo')).toQuery());
  querys.push(model.TipoContacto.table.insert(model.TipoContacto.table.valor.value('Celular')).toQuery());
  querys.push(model.TipoContacto.table.insert(model.TipoContacto.table.valor.value('Email')).toQuery());
  querys.push(model.TipoContacto.table.insert(model.TipoContacto.table.valor.value('Web')).toQuery());
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

function populate() {
  return Promise.all([
    populateEstadoCivil(),
    populateSexo(),
    populateFormacion(),
    populateContacto(),
    populateSociedad(),
    populateEmpresa(),
    populateAfip()
  ]);
}

populate()
.then(r => {
  console.log('Datos agregados!');
  process.exit();
})
.catch(e => console.error(e));
