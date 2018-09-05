const utils = require('../utils');
const router = require('express').Router();
const model = require('../model');

router.get('/categorias', function(req, res) {
  if (!req.ability.can('read', 'Tareas')) return utils.sinPermiso(res);

  model.Categoria.getAll(req.params)
    .then(r => res.json(r))
    .catch(e => utils.errorHandler(e, req, res));
});

router.get('/categorias/:id', function(req, res) {
  if (!req.ability.can('read', 'Tareas')) return utils.sinPermiso(res);

  model.Categoria.get(req.params.id)
    .then(r => res.json(r))
    .catch(e => utils.errorHandler(e, req, res));
});

router.get('/subcategorias/:id/items', function(req, res) {
  if (!req.ability.can('read', 'Tareas')) return utils.sinPermiso(res);

  model.ItemPredeterminado.get({ subcategoria: req.params.id })
    .then(r => res.json(r))
    .catch(e => utils.errorHandler(e, req, res));
});

router.get('/items/:id/predeterminados', function(req, res) {
  if (!req.ability.can('read', 'Tareas')) return utils.sinPermiso(res);
  
  model.ItemValorPredeterminado.get({ item: req.params.id })
    .then(r => res.json(r))
    .catch(e => utils.errorHandler(e, req, res));
});

module.exports = router;
