const path = require('path');
const router = require('express').Router();
const model = require('../model');
const utils = require('../utils');
const auth = require('../auth');

router.use(function(req, res, next) {
  if (req.method == 'OPTIONS') next();
  else if (req.ability.can(auth.getMethodAbility(req.method), 'Solicitud')) next();
  else utils.sinPermiso(res);
});

router.get('/', function(req, res) {
  model.Solicitud.getAll(req.query)
    .then(r => res.json(r))
    .catch(e => utils.errorHandler(e, req, res));
});

router.get('/:id', function(req, res) {
  model.Solicitud.get(req.params.id)
    .then(r => res.json(r))
    .catch(e => utils.errorHandler(e, req, res));
});

router.post('/', function(req, res) {
  if (!req.ability.can('create', 'Solicitud')) utils.sinPermiso(res);
  
  Promise.all([
    utils.guardarArchivo('foto', req.body.entidad.foto),
    utils.guardarArchivo('firma', req.body.entidad.firma)
  ])
  .then(([foto, firma]) => {
    let solicitud = req.body;
    solicitud.created_by = req.user.id;

    if (foto) solicitud.entidad.foto = foto;
    if (firma) solicitud.entidad.firma = firma;

    return model.Solicitud.add(solicitud);
  })
  .then(solicitud => res.status(201).json(solicitud))
  .catch(e => utils.errorHandler(e, req, res));
});

router.put('/:id', function(req, res) {
  let solicitud;
  Promise.all([
    utils.guardarArchivo('foto', req.body.entidad.foto),
    utils.guardarArchivo('firma', req.body.entidad.firma)
  ])
  .then(([foto, firma]) => {  
    solicitud = req.body;
    solicitud.updated_by = req.user.id;

    if (foto) solicitud.entidad.foto = foto;
    if (firma) solicitud.entidad.firma = firma;    
      
    return model.Solicitud.edit(req.params.id, solicitud)
  })
  .then(id => res.status(200).json(solicitud))
  .catch(e => utils.errorHandler(e, req, res));
});


router.patch('/:id', function(req, res) {
  req.body.updated_by = req.user.id;
  model.Solicitud.patch(req.params.id, req.body)
    .then(r => res.status(200).json(r))
    .catch(e => utils.errorHandler(e, req, res));
});


module.exports = router;
