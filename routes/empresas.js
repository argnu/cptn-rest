const utils = require('../utils');
const router = require('express').Router();
const model = require('../model');

router.get('/', function(req, res) {
  if (!req.ability.can('read', 'Empresa')) return utils.sinPermiso(res);

  model.Empresa.getAll(req.query)
    .then(r => res.json(r))
    .catch(e => utils.errorHandler(e, req, res));
});

router.get('/:id', function(req, res) {
  if (!req.ability.can('read', 'Empresa')) return utils.sinPermiso(res);

  model.Empresa.get(req.params.id)
    .then(r => res.json(r))
    .catch(e => utils.errorHandler(e, req, res));
});

router.get('/:id/contactos', function(req, res) {
  if (!req.ability.can('read', 'Empresa')) return utils.sinPermiso(res);

  model.Contacto.getAll(req.params.id)
    .then(r => res.json(r))
    .catch(e => utils.errorHandler(e, req, res));
});

router.post('/', function(req, res) {
  if(!req.ability.can('create', 'Empresa')) return utils.sinPermiso(res);

  model.Empresa.add(req.body)
    .then(r => res.status(201).json(r))
    .catch(e => utils.errorHandler(e, req, res));
});

router.put('/:id', function (req, res) {
  if (!req.ability.can('update', 'Empresa')) return utils.sinPermiso(res);
  
  model.Empresa.edit(req.params.id, req.body)
  .then(id => res.status(200).json(req.body))
  .catch(e => utils.errorHandler(e, req, res));
});

module.exports = router;
