const utils = require('../utils');
const fs = require('fs');
const path = require('path');
const multer  = require('multer');
const router = require('express').Router();
const model = require('../model');
const bodyParser = require('body-parser');
router.use(bodyParser.json());

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    let dest = (file.fieldname == 'firma') ? 'firmas' : 'fotos';
    cb(null, path.join(__dirname, '..', 'files', dest))
  },

  filename: function (req, file, cb) {
    let ext = path.extname(file.originalname);
    let name = file.originalname.replace(ext, '') + '-' + Date.now() + ext;    
    req.body[file.fieldname] = name;
    cb(null, name)
  }
})

const upload = multer({ storage: storage })

router.get('/', function(req, res) {
  model.Profesional.getAll(req.query)
    .then(r => res.json(r))
    .catch(e => utils.errorHandler(e, req, res));
});

router.get('/:id/contactos', function(req, res) {
  model.Contacto.getAll(req.params.id)
    .then(r => res.json(r))
    .catch(e => utils.errorHandler(e, req, res));
});

router.get('/:id/formaciones', function(req, res) {
  model.Formacion.getAll(req.params.id)
    .then(r => res.json(r))
    .catch(e => utils.errorHandler(e, req, res));
});

router.get('/:id/beneficiarios', function(req, res) {
  model.BeneficiarioCaja.getAll(req.params.id)
    .then(r => res.json(r))
    .catch(e => utils.errorHandler(e, req, res));
});

router.get('/:id/subsidiarios', function(req, res) {
  model.Subsidiario.getAll(req.params.id)
    .then(r => res.json(r))
    .catch(e => utils.errorHandler(e, req, res));
});

router.get('/:id/foto', function (req, res) {
  model.Profesional.getFoto(req.params.id)
    .then(r => {
      let file_path = path.join(__dirname, '..', 'files/fotos', r);
      if (fs.existsSync(file_path)) res.sendFile(file_path);
      else return Promise.reject({ code: 404, msg: 'El recurso solicitado no existe' });
    })
    .catch(e => utils.errorHandler(e, req, res));
});

router.get('/:id/firma', function (req, res) {
  model.Profesional.getFirma(req.params.id)
    .then(r => {
      let file_path = path.join(__dirname, '..', 'files/firmas', r);
      if (fs.existsSync(file_path)) res.sendFile(file_path);
      else return Promise.reject({ code: 404, msg: 'El recurso solicitado no existe' });
    })
    .catch(e => utils.errorHandler(e, req, res));
});

router.get('/:id', function (req, res) {
  model.Profesional.get(req.params.id)
    .then(r => res.json(r))
    .catch(e => utils.errorHandler(e, req, res));
});

router.post('/', function(req, res) {
  model.Profesional.add(req.body)
    .then(r => res.status(201).json(r))
    .catch(e => utils.errorHandler(e, req, res));
});

router.put('/:id/foto', upload.fields([{ name: 'foto', maxCount: 1 }]), function(req, res) {
    if (req.body.foto) {
      model.Profesional.patch(req.params.id, { foto: req.body.foto })
        .then(id => res.status(200).json({ id }))
        .catch(e => utils.errorHandler(e, req, res));
    }
    else res.status(500).json({ msg: 'Error en el servidor' });
});

router.put('/:id/firma', upload.fields([{ name: 'firma', maxCount: 1 }]), function(req, res) {
    if (req.body.firma) {
      model.Profesional.patch(req.params.id, { firma: req.body.firma })
        .then(id => res.status(200).json({ id }))
        .catch(e => utils.errorHandler(e, req, res));
    }
    else res.status(500).json({ msg: 'Error en el servidor' });
});

router.put('/:id', function(req, res) {

});

router.delete('/:id', function(req, res) {

});

module.exports = router;
