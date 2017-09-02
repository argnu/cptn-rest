const connector = require('../connector');
const model = require('../model');

function createTable(table) {
  return new Promise(function(resolve, reject) {
   connector.execQuery(table.create().toQuery(), (err, res) => {
     if (err) reject(err);
     console.info(`Tabla "${table._name}" creada`);
     resolve();
   });
  });
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
  querys.push(opcion.insert(opcion.tipo.value('sexo'), opcion.valor.value('femenino')));
  querys.push(opcion.insert(opcion.tipo.value('sexo'), opcion.valor.value('masculino')));
  querys.push(opcion.insert(opcion.tipo.value('estadocivil'), opcion.valor.value('casado')));
  querys.push(opcion.insert(opcion.tipo.value('estadocivil'), opcion.valor.value('soltero')));
  querys.push(opcion.insert(opcion.tipo.value('estadocivil'), opcion.valor.value('concubino')));
  querys.push(opcion.insert(opcion.tipo.value('estadocivil'), opcion.valor.value('viudo')));
  querys.push(opcion.insert(opcion.tipo.value('formacion'), opcion.valor.value('grado')));
  querys.push(opcion.insert(opcion.tipo.value('formacion'), opcion.valor.value('posgrado')));
  querys.push(opcion.insert(opcion.tipo.value('contacto'), opcion.valor.value('fijo')));
  querys.push(opcion.insert(opcion.tipo.value('contacto'), opcion.valor.value('celular')));
  querys.push(opcion.insert(opcion.tipo.value('contacto'), opcion.valor.value('email')));
  querys.push(opcion.insert(opcion.tipo.value('contacto'), opcion.valor.value('web')));
  querys.push(opcion.insert(opcion.tipo.value('relacionlaboral'), opcion.valor.value('dependencia')));
  querys.push(opcion.insert(opcion.tipo.value('relacionlaboral'), opcion.valor.value('autonomo')));

  let proms = [];
  for(let query of querys) {
    let q = query.toQuery();
    proms.push(connector.execQuery(q.text, q.values));
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

dropTable()
.then(rs => {
  Promise.all([
    createDatosGeograficos(),
    createTable(model.Opcion.table),
    createTable(model.CondicionAFIP.table),
    createTable(model.Institucion.table),
    createTable(model.Delegacion.table)
  ])
  .then(rs => createTable(model.Profesional.table))
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
