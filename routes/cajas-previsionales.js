const utils = require('../utils');
const router = require('express').Router();
const model = require('../model');

router.get('/', function(req, res) {
  if (!req.ability.can('read', 'CajaPrevisonal')) return utils.sinPermiso(res);

  model.CajaPrevisional.getAll(req.query)
    .then(r => res.json(r))
    .catch(e => utils.errorHandler(e, req, res));
});

router.get('/:id', function(req, res) {
  if (!req.ability.can('read', 'CajaPrevisonal')) return utils.sinPermiso(res);

  model.CajaPrevisional.get(req.params.id)
    .then(r => res.json(r))
    .catch(e => utils.errorHandler(e, req, res));
});

router.post('/', function(req, res) {
  if (!req.ability.can('create', 'CajaPrevisonal')) return utils.sinPermiso(res);
  
  model.CajaPrevisional.add(req.body)
    .then(r => res.json(r))
    .catch(e => utils.errorHandler(e, req, res));
});

module.exports = router;
