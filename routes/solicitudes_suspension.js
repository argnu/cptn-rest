const router = require('express').Router();
const model = require('../model');
const utils = require('../utils');

router.get('/', function(req, res) {
  if (!req.ability.can('read', 'SolicitudSuspension')) return utils.sinPermiso(res);

  model.SolicitudSuspension.getAll(req.query)
    .then(r => res.json(r))
    .catch(e => utils.errorHandler(e, req, res));
});

router.get('/:id', function(req, res) {
  if (!req.ability.can('read', 'SolicitudSuspension')) return utils.sinPermiso(res);

  model.SolicitudSuspension.get(req.params.id)
    .then(r => res.json(r))
    .catch(e => utils.errorHandler(e, req, res));
});

router.post('/', function(req, res) {
  if (!req.ability.can('create', 'SolicitudSuspension')) return utils.sinPermiso(res);

  req.body.created_by = req.user.id;
  model.SolicitudSuspension.add(req.body)
  .then(solicitud => res.status(201).json(solicitud))
  .catch(e => utils.errorHandler(e, req, res));
});

router.post('/:id/aprobar', function(req, res) {
  if (!req.ability.can('update', 'SolicitudSuspension')) return utils.sinPermiso(res);

  let aprobacion = {
    documento: req.body,
    updated_by: req.user.id
  }
  
  model.SolicitudSuspension.aprobar(req.params.id, aprobacion)
  .then(solicitud => res.status(200).json(solicitud))
  .catch(e => utils.errorHandler(e, req, res));
});

router.patch('/:id', function(req, res) {
  if (!req.ability.can('update', 'SolicitudSuspension')) return utils.sinPermiso(res);

    req.body.updated_by = req.user.id;
    model.SolicitudSuspension.patch(req.params.id, req.body)
    .then(r => res.status(200).json(r))
    .catch(e => utils.errorHandler(e, req, res));
});


module.exports = router;
