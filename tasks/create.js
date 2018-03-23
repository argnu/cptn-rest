const path = require('path');
const connector = require('../db/connector');
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
  .then(r => createTable(model.tareas.ItemPredeterminado.table))
  .then(r => createTable(model.tareas.ItemValorPredeterminado.table))
  .then(r => createTable(model.tareas.Legajo.table))
  .then(r => createTable(model.tareas.LegajoItem.table))
  .then(r => createTable(model.tareas.LegajoComitente.table))
}


function createEntidades() {
  return createTable(model.Entidad.table)
    .then(r => createTable(model.Empresa.table))
    .then(r => createTable(model.Profesional.table))
    .then(r => createTable(model.Solicitud.table))
    .then(r => createTable(model.Contacto.table))
    .then(r => createTable(model.Formacion.table))
    .then(r => createTable(model.BeneficiarioCaja.table))
    .then(r => createTable(model.Subsidiario.table))
    .then(r => createTable(model.Matricula.table))
    .then(r => createTable(model.Persona.table))
    .then(r => createTable(model.PersonaFisica.table))
    .then(r => createTable(model.PersonaJuridica.table))
    .then(r => createTable(model.MatriculaExterna.table))    
    .then(r => createTable(model.EmpresaRepresentante.table))
    .then(r => createTable(model.EntidadDomicilio.table))
}

function createDatosCobranzas() {
  return  createTable(model.Boleta.table)
  .then(rs => createTable(model.BoletaItem.table))
  .then(rs => createTable(model.Comprobante.table))
  .then(rs => createTable(model.ComprobanteItem.table))
  .then(rs => createTable(model.ComprobantePago.table))
  .then(rs => createTable(model.ComprobantePagoCheque.table))
  .then(rs => createTable(model.ComprobantePagoTarjeta.table))
  .then(rs => createTable(model.VolantePago.table))
  .then(rs => createTable(model.VolantePagoBoleta.table))
}

function init() {
    Promise.all([
      createDatosGeograficos(),
      createTable(model.ValoresGlobales.table),
      createTable(model.TipoSexo.table),
      createTable(model.TipoCondicionAfip.table),
      createTable(model.TipoContacto.table),
      createTable(model.TipoEstadoCivil.table),
      createTable(model.TipoFormacion.table),
      createTable(model.TipoEmpresa.table),
      createTable(model.TipoSociedad.table),
      createTable(model.TipoIncumbencia.table),
      createTable(model.TipoEstadoMatricula.table),
      createTable(model.TipoEstadoLegajo.table),
      createTable(model.TipoVinculo.table),
      createTable(model.TipoComprobante.table),
      createTable(model.TipoEstadoBoleta.table),
      createTable(model.TipoPago.table),
      createTable(model.TipoMoneda.table),
      createTable(model.TipoTarjeta.table),
      createTable(model.Banco.table),
      createTable(model.Usuario.table),
      createTable(model.Institucion.table),
      createTable(model.Delegacion.table)
    ])
    .then(rs => Promise.all([
                  createEntidades(),                  
                  createTable(model.Titulo.table),
                  createTable(model.TipoFormaPago.table),
                  createTable(model.UsuarioDelegacion.table)
                ]))
    .then(r => createDatosTareas())
    .then(r => createDatosCobranzas())
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
