const utils = require('../utils');
const router = require('express').Router();
const model = require('../model');
const auth = require('../auth');

router.use(function(req, res, next) {
  if (req.ability.can(auth.getMethodAbility(req.method), 'Legajo')) next();
  else utils.sinPermiso(res);
});

router.get('/', function(req, res) {
  model.Legajo.getAll(req.query)
    .then(r => res.json(r))
    .catch(e => utils.errorHandler(e, req, res));
});

router.get('/:id', function(req, res) {
  model.Legajo.get(req.params.id)
    .then(r => res.json(r))
    .catch(e => utils.errorHandler(e, req, res));
});

router.post('/', function(req, res) {
  if (!req.ability.can('create', 'Legajo')) utils.sinPermiso(res);

  req.body.created_by = req.user.id;
  model.Legajo.add(req.body)
  .then(legajo => res.json(legajo))
  .catch(e => utils.errorHandler(e, req, res));
});

router.put('/:id', function(req, res) {
  req.body.updated_by = req.user.id;
  model.Legajo.edit(req.params.id, req.body)
  .then(legajo => res.json(legajo))
  .catch(e => utils.errorHandler(e, req, res));
});

router.patch('/:id', function(req, res) {
  req.body.updated_by = req.user.id;
  model.Legajo.patch(req.params.id, req.body)
  .then(legajo => res.json(legajo))
  .catch(e => utils.errorHandler(e, req, res));
});

module.exports = router;
