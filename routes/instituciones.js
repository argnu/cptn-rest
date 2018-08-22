const utils = require('../utils');
const router = require('express').Router();
const model = require('../model');
const auth = require('../auth');



router.use(function(req, res, next) {
  if (req.ability.can(auth.getMethodAbility(req.method), 'Institucion')) next();
  else res.status(403).json({msg: 'No tiene permisos para efectuar esta operación' })
});

router.get('/', function(req, res) {
  model.Institucion.getAll(req.query)
    .then(r => res.json(r))
    .catch(e => utils.errorHandler(e, req, res));
});

router.get('/:id', function(req, res) {
  model.Institucion.get(req.params.id)
    .then(r => res.json(r))
    .catch(e => utils.errorHandler(e, req, res));
});

router.get('/:id/titulos', function(req, res) {
  let query = req.query;
  query.institucion = req.params.id;

  model.InstitucionTitulo.getAll(query)
    .then(r => res.json(r))
    .catch(e => utils.errorHandler(e, req, res));
});

router.post('/', function(req, res) {
  model.Institucion.add(req.body)
    .then(r => res.json(r))
    .catch(e => utils.errorHandler(e, req, res));
});

router.post('/:id/titulos', function(req, res) {
  req.body.institucion = req.params.id;
  model.InstitucionTitulo.add(req.body)
    .then(r => res.json(r))
    .catch(e => utils.errorHandler(e, req, res));
});

router.put('/:id', function(req, res) {
  model.Institucion.edit(req.params.id, req.body)
    .then(r => res.json(r))
    .catch(e => utils.errorHandler(e, req, res));
});

router.put('/:id_inst/titulos/:id', function(req, res) {
  model.InstitucionTitulo.edit(req.params.id, req.body)
    .then(r => res.json(r))
    .catch(e => utils.errorHandler(e, req, res));
});

router.patch('/:id', function(req, res) {
  model.Institucion.patch(req.params.id, req.body)
    .then(r => res.json(r))
    .catch(e => utils.errorHandler(e, req, res));
});

router.delete('/:id', function(req, res) {

});

router.delete('/:id_inst/titulos/:id', function(req, res) {
  model.InstitucionTitulo.delete(req.params.id)
    .then(r => res.json(r))
    .catch(e => utils.errorHandler(e, req, res));
});

module.exports = router;
