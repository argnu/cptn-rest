const connector = require('../connector');
const model = require('../model');


function createTable(table) {
   return connector.execQuery(table.create().ifNotExists().toQuery())
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


function createEntidades() {
  return createTable(model.Entidad.table)
    .then(r => createTable(model.Empresa.table))
    .then(r => createTable(model.Profesional.table))
    .then(r => createTable(model.Solicitud.table))
    .then(r => createTable(model.Matricula.table))
    .then(r => createTable(model.EmpresaRepresentante.table))
}

function init() {
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
      createTable(model.TipoComprobante.table),
      createTable(model.TipoEstadoBoleta.table),
      createTable(model.TipoPago.table),
      createTable(model.TipoMoneda.table),
      createTable(model.Banco.table),
      createTable(model.Usuario.table)
    ])
    .then(rs => Promise.all([
                  createEntidades(),
                  createTable(model.Titulo.table),
                  createTable(model.TipoFormaPago.table)
                ]))
    .then(r => Promise.all([
                  createTable(model.Contacto.table),
                  createTable(model.Formacion.table),
                  createTable(model.BeneficiarioCaja.table),
                  createTable(model.Subsidiario.table),
                ]))
    .then(rs => createTable(model.Boleta.table))
    .then(rs => createTable(model.BoletaItem.table))
    .then(rs => createTable(model.Comprobante.table))
    .then(rs => createTable(model.ComprobanteItem.table))
    .then(rs => createTable(model.ComprobantePago.table))
    .then(r => {
      console.info('Todas las tablas han sido creadas!');
      process.exit();
    })
  .catch(e => {
    console.error(e);
    process.exit();
  });
}

init();
