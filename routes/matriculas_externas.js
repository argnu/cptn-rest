const utils = require('../utils');
const router = require('express').Router();
const model = require('../model');

router.get('/', function (req, res) {
    if (!req.ability.can('read', 'MatriculaExterna')) return utils.sinPermiso(res);

    model.MatriculaExterna.getAll(req.query)
        .then(matriculas => res.json(matriculas))
        .catch(e => utils.errorHandler(e, req, res));
});

router.get('/:id', function (req, res) {
    if (!req.ability.can('read', 'MatriculaExterna')) return utils.sinPermiso(res);

    model.MatriculaExterna.get(req.params.id)
        .then(matricula => res.json(matricula))
        .catch(e => utils.errorHandler(e, req, res));
});

router.post('/', function (req, res) {
    if (!req.ability.can('create', 'MatriculaExterna')) return utils.sinPermiso(res);

    model.MatriculaExterna.add(req.body)
    .then(matricula => res.status(201).json(matricula))
    .catch(e => utils.errorHandler(e, req, res));
});

module.exports = router;
