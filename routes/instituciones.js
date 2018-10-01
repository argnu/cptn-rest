const utils = require('../utils');
const router = require('express').Router();
const model = require('../model');

router.get('/', function(req, res) {
  if (!req.ability.can('read', 'Institucion')) return utils.sinPermiso(res);

  model.Institucion.getAll(req.query)
    .then(r => res.json(r))
    .catch(e => utils.errorHandler(e, req, res));
});

router.get('/:id', function(req, res) {
  if (!req.ability.can('read', 'Institucion')) return utils.sinPermiso(res);

  model.Institucion.get(req.params.id)
    .then(r => res.json(r))
    .catch(e => utils.errorHandler(e, req, res));
});

router.get('/:id/titulos', function(req, res) {
  if (!req.ability.can('read', 'Institucion')) return utils.sinPermiso(res);

  let query = req.query;
  query.institucion = req.params.id;

  model.InstitucionTitulo.getAll(query)
    .then(r => res.json(r))
    .catch(e => utils.errorHandler(e, req, res));
});

router.post('/', function(req, res) {
  if (!req.ability.can('create', 'Institucion')) return utils.sinPermiso(res);

  model.Institucion.add(req.body)
    .then(r => res.json(r))
    .catch(e => utils.errorHandler(e, req, res));
});

router.post('/:id/titulos', function(req, res) {
  if (!req.ability.can('update', 'Institucion') || !req.ability.can('create', 'InstitucionTitulo')) 
    return utils.sinPermiso(res);

  req.body.institucion = req.params.id;
  model.InstitucionTitulo.add(req.body)
    .then(r => res.json(r))
    .catch(e => utils.errorHandler(e, req, res));
});

router.put('/:id', function(req, res) {
  if (!req.ability.can('update', 'Institucion')) return utils.sinPermiso(res);

  model.Institucion.edit(req.params.id, req.body)
    .then(r => res.json(r))
    .catch(e => utils.errorHandler(e, req, res));
});

router.put('/:id_inst/titulos/:id', function(req, res) {
  if (!req.ability.can('update', 'Institucion') || !req.ability.can('update', 'InstitucionTitulo'))  
    return utils.sinPermiso(res);

  model.InstitucionTitulo.edit(req.params.id, req.body)
  .then(r => res.json(r))
  .catch(e => utils.errorHandler(e, req, res));
});

router.patch('/:id', function(req, res) {
  if (!req.ability.can('update', 'Institucion')) return utils.sinPermiso(res);

  model.Institucion.patch(req.params.id, req.body)
    .then(r => res.json(r))
    .catch(e => utils.errorHandler(e, req, res));
});

router.delete('/:id_inst/titulos/:id', function(req, res) {
  if (!req.ability.can('update', 'Institucion') || !req.ability.can('delete', 'InstitucionTitulo')) 
    return utils.sinPermiso(res);

  model.InstitucionTitulo.delete(req.params.id)
    .then(r => res.json(r))
    .catch(e => utils.errorHandler(e, req, res));
});

module.exports = router;
