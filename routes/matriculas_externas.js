const utils = require('../utils');
const router = require('express').Router();
const model = require('../model');
const auth = require('../auth');

router.use(function(req, res, next) {
  if (req.ability.can(auth.getMethodAbility(req.method), 'MatriculaExterna')) next();
  else utils.sinPermiso(res);
});

router.get('/', function (req, res) {
    model.MatriculaExterna.getAll(req.query)
        .then(matriculas => res.json(matriculas))
        .catch(e => utils.errorHandler(e, req, res));
});

router.get('/:id', function (req, res) {
    model.MatriculaExterna.get(req.params.id)
        .then(matricula => res.json(matricula))
        .catch(e => utils.errorHandler(e, req, res));
});

router.post('/', function (req, res) {
    if (!req.ability.can('create', 'MatriculaExterna')) utils.sinPermiso(res);

    model.MatriculaExterna.add(req.body)
    .then(matricula => res.status(201).json(matricula))
    .catch(e => utils.errorHandler(e, req, res));
});

module.exports = router;
