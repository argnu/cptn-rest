const utils = require('../utils');
const router = require('express').Router();
const model = require('../model');



router.get('/', function(req, res) {
  model.Matricula.getAll(req.query)
    .then(matriculas => res.json(matriculas))
    .catch(e => utils.errorHandler(e, req, res));
});

router.get('/nuevo_numero', function(req, res) {
  model.Matricula.getNumeroMatricula(req.query.tipo)
    .then(numero => res.json(numero))
    .catch(e => utils.errorHandler(e, req, res));
});

router.get('/:id', function(req, res) {
  model.Matricula.get(req.params.id)
    .then(matricula => res.json(matricula))
    .catch(e => utils.errorHandler(e, req, res));
});

router.get('/:id/historial', function(req, res) {
  model.MatriculaHistorial.getByMatricula(req.params.id)
    .then(r => res.json(r))
    .catch(e => utils.errorHandler(e, req, res));
});

router.post('/', function(req, res) {
  req.body.operador = req.user.id;
  model.Matricula.aprobar(req.body)
    .then(matricula => res.status(201).json(matricula))
    .catch(e => utils.errorHandler(e, req, res));
});

router.post('/total', function(req, res) {
  model.Matricula.count()
    .then(total => res.status(200).json(total))
    .catch(e => utils.errorHandler(e, req, res));
});

router.post('/cambiar-estado', function(req, res) {
  req.body.operador = req.user.id;
  model.Matricula.cambiarEstado(req.body)
    .then(total => res.status(200).json(total))
    .catch(e => utils.errorHandler(e, req, res));
});

router.patch('/:id', function(req, res) {
  req.body.operador = req.user.id;
  model.Matricula.patch(req.params.id, req.body)
    .then(r => res.status(200).json(r))
    .catch(e => utils.errorHandler(e, req, res));
});

router.put('/:id', function(req, res) {

});

router.delete('/:id', function(req, res) {

});


/* LEGAJOS */
router.get('/:id/legajos', function(req, res) {
  if (!req.query) req.query = { matricula: { id: req.params.id } };
  else req.query.matricula = { id: req.params.id };

  model.Legajo.getAll(req.query)
    .then(matricula => res.json(matricula))
    .catch(e => utils.errorHandler(e, req, res));
});

router.put('/:id/legajos', function(req, res) {
  req.body.operador = req.user.id;
  req.body.matricula = req.params.id;
  model.Legajo.add(req.body)
    .then(legajo => res.status(201).json(legajo))
    .catch(e => utils.errorHandler(e, req, res));
});

module.exports = router;
