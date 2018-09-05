const utils = require('../utils');
const router = require('express').Router();
const model = require('../model');

router.get('/', function(req, res) {
  if (!req.ability.can('read', 'CajaPrevisonal')) return utils.sinPermiso(res);

  model.ComprobanteExencion.getAll(req.query)
    .then(r => res.json(r))
    .catch(e => utils.errorHandler(e, req, res));
});

router.get('/:id', function(req, res) {
  if (!req.ability.can('read', 'ComprobanteExencion')) return utils.sinPermiso(res);

  model.ComprobanteExencion.get(req.params.id)
    .then(r => res.json(r))
    .catch(e => utils.errorHandler(e, req, res));
});


router.post('/', function(req, res) {
  if (!req.ability.can('create', 'ComprobanteExencion')) return utils.sinPermiso(res);
  
  req.body.created_by = req.user.id;
  model.ComprobanteExencion.add(req.body)
    .then(r => res.status(201).json(r))
    .catch(e => utils.errorHandler(e, req, res));
});

module.exports = router;
