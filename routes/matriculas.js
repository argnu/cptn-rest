const utils = require('../utils');
const router = require('express').Router();
const model = require('../model');

router.get('/', function(req, res) {
  if (!req.ability.can('read', 'Matricula')) return utils.sinPermiso(res);

  model.Matricula.getAll(req.query, req.user.rol)
    .then(matriculas => res.json(matriculas))
    .catch(e => utils.errorHandler(e, req, res));
});

router.get('/nuevo_numero', function(req, res) {
  if (!req.ability.can('read', 'Matricula')) return utils.sinPermiso(res);

  model.Matricula.getNumeroMatricula(req.query.tipo)
    .then(numero => res.json(numero))
    .catch(e => utils.errorHandler(e, req, res));
});

router.get('/:id', function(req, res) {
  if (!req.ability.can('read', 'Matricula')) return utils.sinPermiso(res);

  model.Matricula.get(req.params.id)
    .then(matricula => res.json(matricula))
    .catch(e => utils.errorHandler(e, req, res));
});

router.get('/:id/historial', function(req, res) {
  if (!req.ability.can('read', 'Matricula') || !req.ability.can('read', 'MatriculaHistorial')) 
    return utils.sinPermiso(res);

  model.MatriculaHistorial.getByMatricula(req.params.id)
    .then(r => res.json(r))
    .catch(e => utils.errorHandler(e, req, res));
});

router.post('/', function(req, res) {
  if (!req.ability.can('create', 'Matricula')) return utils.sinPermiso(res);

  req.body.created_by = req.user.id;
  model.Matricula.aprobar(req.body)
    .then(matricula => res.status(201).json(matricula))
    .catch(e => utils.errorHandler(e, req, res));
});

router.post('/:id/cambiar-estado', function(req, res) {
  if (!req.ability.can('update', 'Matricula')) return utils.sinPermiso(res);

  req.body.updated_by = req.user.id;
  model.Matricula.cambiarEstado(req.params.id, req.body)
    .then(total => res.status(200).json(total))
    .catch(e => utils.errorHandler(e, req, res));
});

router.patch('/:id', function(req, res) {
  if (!req.ability.can('update', 'Matricula')) return utils.sinPermiso(res);

  req.body.updated_by = req.user.id;
  model.Matricula.patch(req.params.id, req.body)
    .then(r => res.status(200).json(r))
    .catch(e => utils.errorHandler(e, req, res));
});


/* LEGAJOS */
router.get('/:id/legajos', function(req, res) {
  if (!req.ability.can('read', 'Matricula') || !req.ability.can('read', 'Legajo'))  
    return utils.sinPermiso(res);

  if (!req.query) req.query = { matricula: { id: req.params.id } };
  else req.query.matricula = { id: req.params.id };

  model.Legajo.getAll(req.query)
    .then(matricula => res.json(matricula))
    .catch(e => utils.errorHandler(e, req, res));
});

router.put('/:id/legajos', function(req, res) {
  if (!req.ability.can('update', 'Matricula') || !req.ability.can('update', 'Legajo'))  
    return utils.sinPermiso(res);

  req.body.created_by = req.user.id;
  req.body.matricula = req.params.id;
  model.Legajo.add(req.body)
    .then(legajo => res.status(201).json(legajo))
    .catch(e => utils.errorHandler(e, req, res));
});

module.exports = router;
