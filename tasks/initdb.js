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

function createTable(table) {
   return connector.execQuery(table.create().toQuery())
    .then(r => console.info(`Tabla "${table._name}" creada`));
}

function createDatosGeograficos() {
  return createTable(model.Pais.table)
  .then(r => createTable(model.Provincia.table))
  .then(r => createTable(model.Departamento.table))
  .then(r => createTable(model.Localidad.table))
  .then(r => createTable(model.Domicilio.table))
}

function createDatosTareas() {
  return createTable(model.tareas.Categoria.table)
  .then(r => createTable(model.tareas.Subcategoria.table))
  .then(r => createTable(model.tareas.Item.table))
  .then(r => createTable(model.tareas.ItemsPredeterminados.table))
  .then(r => createTable(model.tareas.ItemValorPredeterminado.table))
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

function populateOpciones() {
  return populateEstadoCivil()
  .then(r => populateSexo())
  .then(r => populateFormacion())
  .then(r => populateContacto())
  .then(r => populateEmpresa())
  .then(r => populateEmpresa())
  .then(r => populateAfip())
  .catch(e => console.error(e));
}


function populate() {
  return populateOpciones();
}

function* dropQuery() {
  for(let entidad in model) {
    if (!model[entidad].table) {
      for(let subentidad in model[entidad]) {
        yield connector.execQuery(model[entidad][subentidad].table.drop().cascade().ifExists().toQuery());
      }
    }
    else yield connector.execQuery(model[entidad].table.drop().cascade().ifExists().toQuery());
  }
  yield null;
}

let genDrop = dropQuery();

function dropTable() {
  let promise = genDrop.next().value;
  if (promise == null) return;
  else return promise.then(r => dropTable());
}

function createEntidades() {
  return createTable(model.Entidad.table)
    .then(r => createTable(model.Empresa.table))
    .then(r => createTable(model.Profesional.table))
}

function init() {
  dropTable()
  .then(rs => {
    Promise.all([
      createDatosGeograficos(),
      createDatosTareas(),
      createTable(model.TipoSexo.table),
      createTable(model.TipoCondicionAfip.table),
      createTable(model.TipoContacto.table),
      createTable(model.TipoEstadoCivil.table),
      createTable(model.TipoFormacion.table),
      createTable(model.TipoEmpresa.table),
      createTable(model.TipoSociedad.table),
      createTable(model.TipoIncumbencia.table),
      createTable(model.TipoEstadoMatricula.table),
      createTable(model.Institucion.table),
      createTable(model.Delegacion.table),
      createTable(model.Titulo.table)
    ])
    .then(rs => createEntidades())
    .then(r => Promise.all([
                  createTable(model.Contacto.table),
                  createTable(model.Formacion.table),
                  createTable(model.Solicitud.table),
                  createTable(model.BeneficiarioCaja.table),
                  createTable(model.Subsidiario.table),
                ]))
    .then(rs => createTable(model.Matricula.table))
    .then(r => {
      console.info('Todas las tablas han sido creadas!');
      populate()
        .then(r => {
            console.info('Tablas con datos falsos!');
            process.exit();
          })
    })
  })
  .catch(e => {
    console.error(e);
    process.exit();
  });
}

init();

// Promise.all([
//   connector.execQuery(model.TipoEmpresa.table.drop().cascade().ifExists().toQuery()),
//   connector.execQuery(model.TipoSociedad.table.drop().cascade().ifExists().toQuery())
// ])
// .then(r => Promise.all([
//   createTable(model.TipoEmpresa.table),
//   createTable(model.TipoSociedad.table)
// ]))
// .then(r => Promise.all([
//   populateEmpresa(),
//   populateSociedad()
// ]))
// .then(r => {
//   console.log('listo');
//   process.exit();
// })
// .catch(e => console.error(e));
