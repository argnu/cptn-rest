const path = require('path');
const multer  = require('multer');
const router = require('express').Router();
const bodyParser = require('body-parser');
const model = require('../model');
const utils = require('../utils');

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
  model.Solicitud.getAll(req.query)
    .then(r => res.json(r))
    .catch(e => utils.errorHandler(e, req, res));
});

router.get('/:id', function(req, res) {
  model.Solicitud.get(req.params.id)
    .then(r => res.json(r))
    .catch(e => utils.errorHandler(e, req, res));
});

router.post('/',          
  upload.fields([{
    name: 'firma', maxCount: 1
  }]),

  function(req, res) {    
    utils.guardarFoto(req.body.foto)
    .then(foto => {
      let solicitud;

      if (req.body.solicitud) {
        solicitud = JSON.parse(req.body.solicitud);
        solicitud.entidad.foto = foto;
        solicitud.entidad.firma = req.body.firma ? req.body.firma : null;
      }
      else solicitud = req.body;
  
      solicitud.operador = req.user.id;      
      return model.Solicitud.add(solicitud);
    })
    .then(solicitud => res.status(201).json(solicitud))
    .catch(e => utils.errorHandler(e, req, res));   
});

router.put('/:id',          
  upload.fields([{
    name: 'firma', maxCount: 1
  }]), 

  function(req, res) {
    utils.guardarFoto(req.body.foto)
    .then(foto => {
      let solicitud;
      if (req.body.solicitud) {
        solicitud = JSON.parse(req.body.solicitud);
        solicitud.entidad.foto = foto;
        solicitud.entidad.firma = req.body.firma ? req.body.firma : null;
      }
      else solicitud = req.body;    
  
      solicitud.operador = req.user.id;
      model.Solicitud.edit(req.params.id, solicitud)
    })
    .then(id => res.status(200).json({ id }))
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
