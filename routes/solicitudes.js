const path = require('path');
const router = require('express').Router();
const model = require('../model');
const utils = require('../utils');

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
  Promise.all([
    utils.guardarArchivo('foto', req.body.entidad.foto),
    utils.guardarArchivo('firma', req.body.entidad.firma)
  ])
  .then(([foto, firma]) => {
    let solicitud = req.body;
    solicitud.operador = req.user.id;

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
    solicitud.operador = req.user.id;

    if (foto) solicitud.entidad.foto = foto;
    if (firma) solicitud.entidad.firma = firma;    
      
    return model.Solicitud.edit(req.params.id, solicitud)
  })
  .then(id => res.status(200).json(solicitud))
  .catch(e => utils.errorHandler(e, req, res));
});

router.patch('/:id', function(req, res) {
  req.body.operador = req.user.id;
  model.Solicitud.patch(req.params.id, req.body)
    .then(r => res.status(200).json(r))
    .catch(e => utils.errorHandler(e, req, res));
});

router.delete('/:id', function(req, res) {

});

module.exports = router;
