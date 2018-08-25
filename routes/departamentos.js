const utils = require('../utils');
const router = require('express').Router();
const model = require('../model');
const auth = require('../auth');

router.use(function(req, res, next) {
  if (req.ability.can(auth.getMethodAbility(req.method), 'Departamento')) next();
  else utils.sinPermiso(res);
});

router.get('/', function(req, res) {
  model.Departamento.getAll(req.query)
    .then(r => res.json(r))
    .catch(e => utils.errorHandler(e, req, res));
});

router.get('/:id', function(req, res) {
  model.Departamento.get(req.params.id)
    .then(r => res.json(r))
    .catch(e => utils.errorHandler(e, req, res));
});

module.exports = router;
