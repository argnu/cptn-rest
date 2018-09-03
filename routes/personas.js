const utils = require('../utils');
const path = require('path');
const router = require('express').Router();
const model = require('../model');
const auth = require('../auth');

router.use(function(req, res, next) {
    if (req.method == 'OPTIONS') next();
  else if (req.ability.can(auth.getMethodAbility(req.method), 'Persona')) next();
  else utils.sinPermiso(res);
});

router.get('/', function (req, res) {
    model.Persona.getAll(req.query)
        .then(r => res.json(r))
        .catch(e => utils.errorHandler(e, req, res));
});

router.get('/:id', function (req, res) {
    model.Persona.get(req.params.id)
        .then(r => res.json(r))
        .catch(e => utils.errorHandler(e, req, res));
});


module.exports = router;
