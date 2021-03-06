
module.exports.Pais = require('./geograficos/Pais');
module.exports.Provincia = require('./geograficos/Provincia');
module.exports.Departamento = require('./geograficos/Departamento');
module.exports.Localidad = require('./geograficos/Localidad');
module.exports.Domicilio = require('./Domicilio');
module.exports.Delegacion = require('./Delegacion');

module.exports.Usuario = require('./usuarios/Usuario');
module.exports.UsuarioRol = require('./usuarios/UsuarioRol');
module.exports.UsuarioDelegacion = require('./usuarios/UsuarioDelegacion');

module.exports.TipoSexo = require('./tipos/TipoSexo');
module.exports.TipoCondicionAfip = require('./tipos/TipoCondicionAfip');
module.exports.TipoContacto = require('./tipos/TipoContacto');
module.exports.TipoEstadoCivil = require('./tipos/TipoEstadoCivil');
module.exports.TipoFormacion = require('./tipos/TipoFormacion');
module.exports.TipoEmpresa = require('./tipos/TipoEmpresa');
module.exports.TipoSociedad = require('./tipos/TipoSociedad');
module.exports.TipoIncumbencia = require('./tipos/TipoIncumbencia');
module.exports.TipoEstadoSolicitud = require('./tipos/TipoEstadoSolicitud');
module.exports.TipoEstadoMatricula = require('./tipos/TipoEstadoMatricula');
module.exports.TipoEstadoLegajo = require('./tipos/TipoEstadoLegajo');
module.exports.TipoComprobante = require('./tipos/TipoComprobante');
module.exports.TipoEstadoBoleta = require('./tipos/TipoEstadoBoleta');
module.exports.TipoMoneda = require('./tipos/TipoMoneda');
module.exports.TipoPago = require('./tipos/TipoPago');
module.exports.TipoFormaPago = require('./tipos/TipoFormaPago');
module.exports.TipoVinculo = require('./tipos/TipoVinculo');
module.exports.TipoTarjeta = require('./tipos/TipoTarjeta');
module.exports.TipoDocumento = require('./tipos/TipoDocumento');
module.exports.TipoNivelTitulo = require('./tipos/TipoNivelTitulo');
module.exports.TipoMovimientoMatricula = require('./tipos/TipoMovimientoMatricula');
module.exports.TipoVariableGlobal = require('./tipos/TipoVariableGlobal');
module.exports.TipoMatricula = require('./tipos/TipoMatricula');
module.exports.TipoLegajo = require('./tipos/TipoLegajo');

module.exports.ValoresGlobales = require('./ValoresGlobales');
module.exports.Documento = require('./Documento');
module.exports.Banco = require('./Banco');
module.exports.Institucion = require('./Institucion');
module.exports.InstitucionTitulo = require('./InstitucionTitulo');
module.exports.TituloIncumbencia = require('./TituloIncumbencia');
module.exports.Persona = require('./Persona');
module.exports.PersonaFisica = require('./PersonaFisica');
module.exports.PersonaJuridica = require('./PersonaJuridica');

module.exports.Entidad = require('./Entidad');
module.exports.EntidadDomicilio = require('./EntidadDomicilio');
module.exports.EntidadCondicionAfip = require('./EntidadCondicionAfip');

module.exports.Solicitud = require('./Solicitud');
module.exports.Matricula = require('./Matricula');
module.exports.MatriculaHistorial = require('./MatriculaHistorial');
module.exports.MatriculaMovimiento = require('./MatriculaMovimiento');

module.exports.Empresa = require('./empresa/Empresa');
module.exports.EmpresaRepresentante = require('./empresa/EmpresaRepresentante');
module.exports.EmpresaIncumbencia = require('./empresa/EmpresaIncumbencia');
module.exports.CajaPrevisional = require('./profesional/CajaPrevisional');
module.exports.Profesional = require('./profesional/Profesional');
module.exports.ProfesionalCajaPrevisional = require('./profesional/ProfesionalCajaPrevisional');
module.exports.ProfesionalTitulo = require('./profesional/ProfesionalTitulo');
module.exports.Subsidiario = require('./profesional/Subsidiario');
module.exports.Contacto = require('./Contacto');

module.exports.Categoria = require('./tareas/Categoria');
module.exports.Subcategoria = require('./tareas/Subcategoria');
module.exports.Item = require('./tareas/Item');
module.exports.ItemPredeterminado = require('./tareas/ItemPredeterminado');
module.exports.ItemValorPredeterminado = require('./tareas/ItemValorPredeterminado');
module.exports.Legajo = require('./tareas/Legajo');
module.exports.LegajoItem = require('./tareas/LegajoItem');
module.exports.LegajoComitente = require('./tareas/LegajoComitente');

module.exports.Boleta = require('./cobranzas/Boleta');
module.exports.BoletaItem = require('./cobranzas/BoletaItem');
module.exports.Comprobante = require('./cobranzas/Comprobante');
module.exports.ComprobanteItem = require('./cobranzas/ComprobanteItem');
module.exports.ComprobantePago = require('./cobranzas/ComprobantePago');
module.exports.ComprobantePagoCheque = require('./cobranzas/ComprobantePagoCheque');
module.exports.ComprobantePagoTarjeta = require('./cobranzas/ComprobantePagoTarjeta');
module.exports.ComprobanteExencion = require('./cobranzas/ComprobanteExencion');
module.exports.VolantePago = require('./cobranzas/VolantePago');
module.exports.VolantePagoBoleta = require('./cobranzas/VolantePagoBoleta');

module.exports.SolicitudSuspension = require('./SolicitudSuspension');