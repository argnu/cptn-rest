const utils = require('../utils');
const fs = require('fs');
const path = require('path');
const router = require('express').Router();
const model = require('../model');

router.get('/', function (req, res) {
  if (!req.ability.can('read', 'Profesional')) return utils.sinPermiso(res);
  model.Profesional.getAll(req.query)
    .then(r => res.json(r))
    .catch(e => utils.errorHandler(e, req, res));
});

router.get('/:id/contactos', function (req, res) {
  if (!req.ability.can('read', 'Profesional') || !req.ability.can('read', 'Contacto')) 
    return utils.sinPermiso(res);
  model.Contacto.getAll(req.params.id)
    .then(r => res.json(r))
    .catch(e => utils.errorHandler(e, req, res));
});


router.get('/:id/subsidiarios', function (req, res) {
  if (!req.ability.can('read', 'Profesional') || !req.ability.can('read', 'Subsidiario')) 
    return utils.sinPermiso(res);

  model.Subsidiario.getAll(req.params.id)
    .then(r => res.json(r))
    .catch(e => utils.errorHandler(e, req, res));
});

router.get('/:id/foto', function (req, res) {
  model.Profesional.getFoto(req.params.id)
    .then(foto => {
      let file_path = path.join(__dirname, '..', 'files/fotos', foto);
      if (fs.existsSync(file_path)) res.sendFile(file_path);
      else return Promise.reject({
        http_code: 404,
        msg: 'El recurso solicitado no existe'
      });
    })
    .catch(e => utils.errorHandler(e, req, res));
});

router.get('/:id/firma', function (req, res) {
  model.Profesional.getFirma(req.params.id)
    .then(r => {
      let file_path = path.join(__dirname, '..', 'files/firmas', r);
      if (fs.existsSync(file_path)) res.sendFile(file_path);
      else return Promise.reject({
        http_code: 404,
        msg: 'El recurso solicitado no existe'
      });
    })
    .catch(e => utils.errorHandler(e, req, res));
});

router.get('/:id', function (req, res) {
  if (!req.ability.can('read', 'Profesional')) return utils.sinPermiso(res);

  model.Profesional.get(req.params.id)
    .then(r => res.json(r))
    .catch(e => utils.errorHandler(e, req, res));
});

router.post('/', function (req, res) {
  if (!req.ability.can('create', 'Profesional')) return utils.sinPermiso(res);

  model.Profesional.add(req.body)
  .then(r => res.status(201).json(r))
  .catch(e => utils.errorHandler(e, req, res));
});

router.put('/:id/foto', function (req, res) {
  if (!req.ability.can('update', 'Profesional')) return utils.sinPermiso(res);

  if (req.body.foto) {
    return utils.guardarArchivo('foto', req.body.foto)
    .then(foto => model.Profesional.patch(req.params.id, { foto }))
    .then(() => res.status(200).json({ id: req.params.id }))
    .catch(e => utils.errorHandler(e, req, res));
  } 
  else res.status(500).json({
    msg: 'Error en el servidor'
  });
});

router.put('/:id/firma', function (req, res) {
  if (!req.ability.can('update', 'Profesional')) return utils.sinPermiso(res);

  if (req.body.firma) {
    return utils.guardarArchivo('firma', req.body.firma)
    .then(firma => model.Profesional.patch(req.params.id, { firma }))
    .then(() => res.status(200).json({ id: req.params.id }))
    .catch(e => utils.errorHandler(e, req, res));
  } 
  else res.status(500).json({
    msg: 'Error en el servidor'
  });
});

router.put('/:id', function (req, res) {
  if (!req.ability.can('update', 'Profesional')) return utils.sinPermiso(res);
  
  let profesional;
  
  Promise.all([
    utils.guardarArchivo('foto', req.body.foto),
    utils.guardarArchivo('firma', req.body.firma)
  ])    
  .then(([foto, firma]) => {
    profesional = req.body;
    profesional.updated_by = req.user.id;

    if (foto) profesional.foto = foto;  
    if (firma) profesional.firma = firma;

    return model.Profesional.edit(req.params.id, profesional)
  })
  .then(id => res.status(200).json(profesional))
  .catch(e => utils.errorHandler(e, req, res));
});

module.exports = router;