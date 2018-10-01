const utils = require('../utils');
const router = require('express').Router();
const model = require('../model');

router.get('/', function(req, res) {
  if (!req.ability.can('read', 'Legajo')) return utils.sinPermiso(res);

  model.Legajo.getAll(req.query)
    .then(r => res.json(r))
    .catch(e => utils.errorHandler(e, req, res));
});

router.get('/:id', function(req, res) {
  if (!req.ability.can('read', 'Legajo')) return utils.sinPermiso(res);

  model.Legajo.get(req.params.id)
    .then(r => res.json(r))
    .catch(e => utils.errorHandler(e, req, res));
});

router.post('/', function(req, res) {
  if (!req.ability.can('create', 'Legajo')) return utils.sinPermiso(res);

  req.body.created_by = req.user.id;
  model.Legajo.add(req.body)
  .then(legajo => res.json(legajo))
  .catch(e => utils.errorHandler(e, req, res));
});

router.put('/:id', function(req, res) {
  if (!req.ability.can('update', 'Legajo')) return utils.sinPermiso(res);

  req.body.updated_by = req.user.id;
  model.Legajo.edit(req.params.id, req.body)
  .then(legajo => res.json(legajo))
  .catch(e => utils.errorHandler(e, req, res));
});

router.patch('/:id', function(req, res) {
  if (!req.ability.can('update', 'Legajo')) return utils.sinPermiso(res);

  req.body.updated_by = req.user.id;
  model.Legajo.patch(req.params.id, req.body)
  .then(legajo => res.json(legajo))
  .catch(e => utils.errorHandler(e, req, res));
});

module.exports = router;
