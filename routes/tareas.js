const utils = require('../utils');
const router = require('express').Router();
const model = require('../model');
const auth = require('../auth');

router.use(function(req, res, next) {
  if (req.method == 'OPTIONS') next();
  else if (req.ability.can(auth.getMethodAbility(req.method), 'Tareas')) next();
  else utils.sinPermiso(res);
});

router.get('/categorias', function(req, res) {
  model.Categoria.getAll(req.params)
    .then(r => res.json(r))
    .catch(e => utils.errorHandler(e, req, res));
});

router.get('/categorias/:id', function(req, res) {
  model.Categoria.get(req.params.id)
    .then(r => res.json(r))
    .catch(e => utils.errorHandler(e, req, res));
});

router.get('/subcategorias/:id/items', function(req, res) {
  model.ItemPredeterminado.get({ subcategoria: req.params.id })
    .then(r => res.json(r))
    .catch(e => utils.errorHandler(e, req, res));
});

router.get('/items/:id/predeterminados', function(req, res) {
  model.ItemValorPredeterminado.get({ item: req.params.id })
    .then(r => res.json(r))
    .catch(e => utils.errorHandler(e, req, res));
});

module.exports = router;
