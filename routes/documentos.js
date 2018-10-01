const utils = require('../utils');
const router = require('express').Router();
const model = require('../model');
const path = require('path');
const fs = require('fs');
const multer = require('multer');

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, '../files/documentos'))
  },
  filename: function (req, file, cb) {
    cb(null, 'documento-' + Date.now() + '.' + file.originalname.split('.').pop())
  }
})

const upload = multer({ storage: storage })

router.get('/', function(req, res) {
  if (!req.ability.can('read', 'Documento')) return utils.sinPermiso(res);

  model.Documento.getAll(req.query)
    .then(r => res.json(r))
    .catch(e => utils.errorHandler(e, req, res));
});

router.get('/:id', function(req, res) {
  if (!req.ability.can('read', 'Documento')) return utils.sinPermiso(res);

  model.Documento.get(req.params.id)
    .then(r => res.json(r))
    .catch(e => utils.errorHandler(e, req, res));
});

const notFound =  {
    http_code: 404,
    mensaje: 'El recurso solicitado no existe'
}

router.get('/:id/archivo', function(req, res) {
  model.Documento.getArchivo(req.params.id)
    .then(r => {
      if (!r) return Promise.reject(notFound);
      let file_path = path.join(__dirname, '..', 'files/documentos', r);
      if (fs.existsSync(file_path)) res.sendFile(file_path);
      else return Promise.reject(notFound);
    })
    .catch(e => utils.errorHandler(e, req, res));
});

router.post('/', upload.single('archivo'), function(req, res) {
  if (!req.ability.can('create', 'Documento')) return utils.sinPermiso(res);

  req.body.archivo = req.file ? req.file.filename : null;
  req.body.created_by = req.user.id;
  model.Documento.add(req.body)
  .then(r => res.status(201).json(r))
  .catch(e => utils.errorHandler(e, req, res));
});

router.put('/:id', upload.single('archivo'), function(req, res) {
  if (!req.ability.can('update', 'Documento')) return utils.sinPermiso(res);

  req.body.archivo = req.file ? req.file.filename : null;
  req.body.updated_by = req.user.id;
  model.Documento.edit(req.params.id, req.body)
  .then(r => res.json(r))
  .catch(e => utils.errorHandler(e, req, res));
});

router.delete('/:id', function(req, res) {
  if (!req.ability.can('delete', 'Documento')) return utils.sinPermiso(res);

  model.Documento.delete(req.params.id)
  .then(r => res.json(r))
  .catch(e => utils.errorHandler(e, req, res));
});

module.exports = router;
