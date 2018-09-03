const utils = require('../utils');
const router = require('express').Router();
const model = require('../model');
const auth = require('../auth');

router.use(function(req, res, next) {
  if (req.method == 'OPTIONS') next();
  else if (req.ability.can(auth.getMethodAbility(req.method), 'Boleta')) next();
  else utils.sinPermiso(res);
});

router.get('/', function(req, res) {
  model.Boleta.getAll(req.query)
    .then(r => res.json(r))
    .catch(e => utils.errorHandler(e, req, res));
});

router.get('/:id', function(req, res) {
  model.Boleta.get(req.params.id)
    .then(r => res.json(r))
    .catch(e => utils.errorHandler(e, req, res));
});

router.post('/', function(req, res) {
  if (!req.ability.can('create', 'Boleta')) utils.sinPermiso(res);

  req.body.created_by = req.user.id;
  model.Boleta.add(req.body)
  .then(r => res.status(201).json(r))
  .catch(e => utils.errorHandler(e, req, res));
});

router.patch('/:id', function(req, res) {
  req.body.updated_by = req.user.id;
  model.Boleta.patch(req.params.id, req.body)
  .then(r => res.json(r))
  .catch(e => utils.errorHandler(e, req, res));
});

module.exports = router;
