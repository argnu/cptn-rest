const utils = require('../utils');
const router = require('express').Router();
const model = require('../model');

router.get('/', function(req, res) {
  if (!req.ability.can('read', 'Opciones')) return utils.sinPermiso(res);

  Promise.all([
    model.TipoCondicionAfip.getAll(req.query),
    model.TipoContacto.getAll(req.query),
    model.TipoEmpresa.getAll(req.query),
    model.TipoEstadoCivil.getAll(req.query),
    model.TipoFormacion.getAll(req.query),
    model.TipoSexo.getAll(req.query),
    model.TipoSociedad.getAll(req.query),
    model.TipoIncumbencia.getAll(req.query),
    model.TipoEstadoSolicitud.getAll(req.query),
    model.TipoEstadoMatricula.getAll(req.query),
    model.TipoEstadoBoleta.getAll(req.query),
    model.TipoComprobante.getAll(req.query),
    model.TipoFormaPago.getAll(req.query),
    model.TipoPago.getAll(req.query),
    model.TipoVinculo.getAll(req.query),
    model.TipoDocumento.getAll(req.query),
    model.TipoNivelTitulo.getAll(req.query),
    model.TipoMatricula.getAll(req.query),
    model.TipoVariableGlobal.getAll(req.query),
    model.TipoLegajo.getAll(req.query),
    model.TipoEstadoLegajo.getAll(req.query)
  ])
  .then(([
    condicionafip, contacto, empresa, estadocivil,
    formacion, sexo, sociedad,
    incumbencia, estadoSolicitud, estadoMatricula,
    estadoBoleta, comprobante, formaPago, pago,
    vinculo, documento, niveles_titulos, matricula,
    variableGlobal, legajo, estadoLegajo
  ]) => res.json({
        condicionafip, contacto, empresa, estadocivil,
        formacion, sexo, sociedad,
        incumbencia, estadoSolicitud, estadoMatricula,
        estadoBoleta, comprobante, formaPago, pago,
        vinculo, documento, niveles_titulos, matricula,
        variableGlobal, legajo, estadoLegajo
      })
  )
  .catch(e => utils.errorHandler(e, req, res));
});

module.exports = router;
