const connector = require('../connector');
const model = require('../model');

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

function populateOpciones() {
  let opcion = model.Opcion.table;
  let querys = [];
  querys.push(opcion.insert(opcion.tipo.value('sexo'), opcion.valor.value('Femenino')));
  querys.push(opcion.insert(opcion.tipo.value('sexo'), opcion.valor.value('Masculino')));
  querys.push(opcion.insert(opcion.tipo.value('estadocivil'), opcion.valor.value('Casado')));
  querys.push(opcion.insert(opcion.tipo.value('estadocivil'), opcion.valor.value('Soltero')));
  querys.push(opcion.insert(opcion.tipo.value('estadocivil'), opcion.valor.value('Concubino')));
  querys.push(opcion.insert(opcion.tipo.value('estadocivil'), opcion.valor.value('Viudo')));
  querys.push(opcion.insert(opcion.tipo.value('formacion'), opcion.valor.value('Grado')));
  querys.push(opcion.insert(opcion.tipo.value('formacion'), opcion.valor.value('Posgrado')));
  querys.push(opcion.insert(opcion.tipo.value('contacto'), opcion.valor.value('Fijo')));
  querys.push(opcion.insert(opcion.tipo.value('contacto'), opcion.valor.value('Celular')));
  querys.push(opcion.insert(opcion.tipo.value('contacto'), opcion.valor.value('Email')));
  querys.push(opcion.insert(opcion.tipo.value('contacto'), opcion.valor.value('Web')));
  querys.push(opcion.insert(opcion.tipo.value('relacionlaboral'), opcion.valor.value('Relación de Dependencia')));
  querys.push(opcion.insert(opcion.tipo.value('relacionlaboral'), opcion.valor.value('Autónomo')));
  querys.push(opcion.insert(opcion.tipo.value('tipoempresa'), opcion.valor.value('Unipersonal')));
  querys.push(opcion.insert(opcion.tipo.value('tipoempresa'), opcion.valor.value('Societaria')));
  querys.push(opcion.insert(opcion.tipo.value('sociedad'), opcion.valor.value('Anónima')));
  querys.push(opcion.insert(opcion.tipo.value('sociedad'), opcion.valor.value('Comercial Colectiva')));
  querys.push(opcion.insert(opcion.tipo.value('sociedad'), opcion.valor.value('En Comandita Simple o Por Acciones')));
  querys.push(opcion.insert(opcion.tipo.value('sociedad'), opcion.valor.value('De Responsabilidad Limitada')));
  querys.push(opcion.insert(opcion.tipo.value('sociedad'), opcion.valor.value('De Capital e Industria')));
  querys.push(opcion.insert(opcion.tipo.value('sociedad'), opcion.valor.value('Cooperativa')));
  querys.push(opcion.insert(opcion.tipo.value('sociedad'), opcion.valor.value('En Formación')));
  querys.push(opcion.insert(opcion.tipo.value('sociedad'), opcion.valor.value('De Hecho')));
  querys.push(opcion.insert(opcion.tipo.value('condicionafip'), opcion.valor.value('Consumidor Final')));
  querys.push(opcion.insert(opcion.tipo.value('condicionafip'), opcion.valor.value('Responsable Inscripto')));
  querys.push(opcion.insert(opcion.tipo.value('condicionafip'), opcion.valor.value('Responsable No Inscripto')));
  querys.push(opcion.insert(opcion.tipo.value('condicionafip'), opcion.valor.value('No Responsable')));
  querys.push(opcion.insert(opcion.tipo.value('condicionafip'), opcion.valor.value('Exento')));
  querys.push(opcion.insert(opcion.tipo.value('condicionafip'), opcion.valor.value('Monotributista')));

  let proms = [];
  for(let query of querys) {
    let q = query.toQuery();
    proms.push(connector.execQuery(q));
  }

  return Promise.all(proms);
}

function fakeData() {
  let institucion = model.Institucion.table;
  let delegacion = model.Delegacion.table;
  return Promise.all([
    connector.execQuery(
      institucion.insert(institucion.nombre.value('UNCO')).toQuery()
    ),
    connector.execQuery(
      institucion.insert(delegacion.nombre.value('Neuquén')).toQuery()
    )
  ])
  .then(r =>     connector.execQuery(
        model.Pais.table.insert(model.Pais.table.nombre.value('Argentina')).toQuery()
      ))
  .then(r => connector.execQuery(
        model.Provincia.table.insert(
          model.Provincia.table.nombre.value('Neuquén'),
          model.Provincia.table.pais.value(1)
        ).toQuery()
      ))
  .then(r => connector.execQuery(
        model.Departamento.table.insert(
          model.Departamento.table.nombre.value('Confluencia'),
          model.Departamento.table.provincia.value(1)
        ).toQuery()
      ))
  .then(r => connector.execQuery(
        model.Localidad.table.insert(
          model.Localidad.table.nombre.value('Neuquén'),
          model.Localidad.table.departamento.value(1)
        ).toQuery()
      ))
}

function populate() {
  return Promise.all([
    populateOpciones(),
    fakeData()
  ])
}

function* dropQuery() {
  for(let entidad in model) {
    yield connector.execQuery(model[entidad].table.drop().cascade().ifExists().toQuery());
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

dropTable()
.then(rs => {
  Promise.all([
    createDatosGeograficos(),
    createTable(model.Opcion.table),
    createTable(model.Institucion.table),
    createTable(model.Delegacion.table)
  ])
  .then(rs => createEntidades())
  .then(r => Promise.all([
                createTable(model.Contacto.table),
                createTable(model.Formacion.table),
                createTable(model.Solicitud.table),
                createTable(model.BeneficiarioCaja.table),
                createTable(model.Subsidiario.table),
              ]))
  .then(rs => {
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
