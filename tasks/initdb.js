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
  let querys = [];
  querys.push(model.TipoSexo.table.insert(model.TipoSexo.table.valor.value('Femenino')));
  querys.push(model.TipoSexo.table.insert(model.TipoSexo.table.valor.value('Masculino')));
  querys.push(model.TipoEstadoCivil.table.insert(model.TipoEstadoCivil.table.valor.value('Casado')));
  querys.push(model.TipoEstadoCivil.table.insert(model.TipoEstadoCivil.table.valor.value('Soltero')));
  querys.push(model.TipoEstadoCivil.table.insert(model.TipoEstadoCivil.table.valor.value('Concubino')));
  querys.push(model.TipoEstadoCivil.table.insert(model.TipoEstadoCivil.table.valor.value('Viudo')));
  querys.push(model.TipoFormacion.table.insert(model.TipoFormacion.table.valor.value('Grado')));
  querys.push(model.TipoFormacion.table.insert(model.TipoFormacion.table.valor.value('Posgrado')));
  querys.push(model.TipoContacto.table.insert(model.TipoContacto.table.valor.value('Fijo')));
  querys.push(model.TipoContacto.table.insert(model.TipoContacto.table.valor.value('Celular')));
  querys.push(model.TipoContacto.table.insert(model.TipoContacto.table.valor.value('Email')));
  querys.push(model.TipoContacto.table.insert(model.TipoContacto.table.valor.value('Web')));
  querys.push(model.TipoRelacionLaboral.table.insert(model.TipoRelacionLaboral.table.valor.value('Relación de Dependencia')));
  querys.push(model.TipoRelacionLaboral.table.insert(model.TipoRelacionLaboral.table.valor.value('Autónomo')));
  querys.push(model.TipoEmpresa.table.insert(model.TipoEmpresa.table.valor.value('Unipersonal')));
  querys.push(model.TipoEmpresa.table.insert(model.TipoEmpresa.table.valor.value('Societaria')));
  querys.push(model.TipoSociedad.table.insert(model.TipoSociedad.table.valor.value('Anónima')));
  querys.push(model.TipoSociedad.table.insert(model.TipoSociedad.table.valor.value('Comercial Colectiva')));
  querys.push(model.TipoSociedad.table.insert(model.TipoSociedad.table.valor.value('En Comandita Simple o Por Acciones')));
  querys.push(model.TipoSociedad.table.insert(model.TipoSociedad.table.valor.value('De Responsabilidad Limitada')));
  querys.push(model.TipoSociedad.table.insert(model.TipoSociedad.table.valor.value('De Capital e Industria')));
  querys.push(model.TipoSociedad.table.insert(model.TipoSociedad.table.valor.value('Cooperativa')));
  querys.push(model.TipoSociedad.table.insert(model.TipoSociedad.table.valor.value('En Formación')));
  querys.push(model.TipoSociedad.table.insert(model.TipoSociedad.table.valor.value('De Hecho')));
  querys.push(model.TipoSociedad.table.insert(model.TipoSociedad.table.valor.value('Fideicomiso')));
  querys.push(model.TipoCondicionAfip.table.insert(model.TipoCondicionAfip.table.valor.value('Consumidor Final')));
  querys.push(model.TipoCondicionAfip.table.insert(model.TipoCondicionAfip.table.valor.value('Responsable Inscripto')));
  querys.push(model.TipoCondicionAfip.table.insert(model.TipoCondicionAfip.table.valor.value('Responsable No Inscripto')));
  querys.push(model.TipoCondicionAfip.table.insert(model.TipoCondicionAfip.table.valor.value('No Responsable')));
  querys.push(model.TipoCondicionAfip.table.insert(model.TipoCondicionAfip.table.valor.value('Exento')));
  querys.push(model.TipoCondicionAfip.table.insert(model.TipoCondicionAfip.table.valor.value('Monotributista')));

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
      delegacion.insert(delegacion.nombre.value('Neuquén')).toQuery()
    ),
    connector.execQuery(
      model.TipoIncumbencia.table.insert(model.TipoIncumbencia.table.id.value(1), model.TipoIncumbencia.table.valor.value('Arquitectura')).toQuery()
    ),
    connector.execQuery(
      model.TipoIncumbencia.table.insert(model.TipoIncumbencia.table.id.value(2), model.TipoIncumbencia.table.valor.value('Saneamiento')).toQuery()
    ),
    connector.execQuery(
      model.TipoEstadoMatricula.table.insert(model.TipoEstadoMatricula.table.valor.value('habilitado')).toQuery()
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
    createTable(model.TipoSexo.table),
    createTable(model.TipoCondicionAfip.table),
    createTable(model.TipoContacto.table),
    createTable(model.TipoEstadoCivil.table),
    createTable(model.TipoFormacion.table),
    createTable(model.TipoRelacionLaboral.table),
    createTable(model.TipoEmpresa.table),
    createTable(model.TipoSociedad.table),
    createTable(model.TipoIncumbencia.table),
    createTable(model.TipoEstadoMatricula.table),
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
