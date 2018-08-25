const utils = require('../utils');
const router = require('express').Router();
const model = require('../model');
const auth = require('../auth');

router.use(function(req, res, next) {
  if (req.ability.can(auth.getMethodAbility(req.method), 'Comprobante')) next();
  else utils.sinPermiso(res);
});

router.get('/', function(req, res) {
  model.Comprobante.getAll(req.query)
    .then(r => res.json(r))
    .catch(e => utils.errorHandler(e, req, res));
});

router.get('/:id', function(req, res) {
  model.Comprobante.get(req.params.id)
    .then(r => res.json(r))
    .catch(e => utils.errorHandler(e, req, res));
});

router.post('/', function(req, res) {
  if (!req.ability.can('create', 'Comprobante')) utils.sinPermiso(res);

  req.body.created_by = req.user.id;
  model.Comprobante.add(req.body)
    .then(r => res.status(201).json(r))
    .catch(e => utils.errorHandler(e, req, res));
});

router.post('/:id/anular', function(req, res) {
  if (!req.ability.can('update', 'Comprobante')) utils.sinPermiso(res);
  
  let comprobante = {
    updated_by: req.user.id
  }
  
  model.Comprobante.anular(req.params.id, comprobante)
    .then(r => res.status(201).json(r))
    .catch(e => utils.errorHandler(e, req, res));
});

module.exports = router;
