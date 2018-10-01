const utils = require('../utils');
const path = require('path');
const router = require('express').Router();
const model = require('../model');

router.get('/', function (req, res) {
    if (!req.ability.can('read', 'Persona')) return utils.sinPermiso(res);

    model.Persona.getAll(req.query)
        .then(r => res.json(r))
        .catch(e => utils.errorHandler(e, req, res));
});

router.get('/:id', function (req, res) {
    if (!req.ability.can('read', 'Persona')) return utils.sinPermiso(res);

    model.Persona.get(req.params.id)
        .then(r => res.json(r))
        .catch(e => utils.errorHandler(e, req, res));
});


module.exports = router;
