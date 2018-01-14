const path = require('path');
const multer  = require('multer');
const router = require('express').Router();
const model = require('../model');
const bodyParser = require('body-parser');
router.use(bodyParser.json());

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    let dest = (file.fieldname == 'firma') ? 'firmas' : 'fotos';
    cb(null, `${__base}/files/${dest}`)
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
    .catch(e => {
      console.error(e);
      res.status(500).json({ msg: 'Error en el servidor' });
    });
});

router.get('/:id', function(req, res) {
  model.Solicitud.get(req.params.id)
    .then(r => res.json(r))
    .catch(e => {
      console.error(e);
      res.status(500).json({ msg: 'Error en el servidor' });
    });
});

router.post('/',          
  upload.fields([{
    name: 'foto', maxCount: 1
  }, {
    name: 'firma', maxCount: 1
  }]), 
  function(req, res) {
    let solicitud;

    if (req.body.solicitud) {
      solicitud = JSON.parse(req.body.solicitud);
      solicitud.entidad.foto = req.body.foto ? req.body.foto : null;
      solicitud.entidad.firma = req.body.firma ? req.body.firma : null;
    }
    else solicitud = req.body;

    model.Solicitud.add(solicitud)
      .then(id => res.status(201).json({ id }))
      .catch(e => {
        console.error(e);
        res.status(500).json({ msg: 'Error en el servidor' });
      });
});

router.put('/:id',          
  upload.fields([{
    name: 'foto', maxCount: 1
  }, {
    name: 'firma', maxCount: 1
  }]), 
  function(req, res) {
    let solicitud;
    if (req.body.solicitud) {
      solicitud = JSON.parse(req.body.solicitud);
      solicitud.entidad.foto = req.body.foto ? req.body.foto : null;
      solicitud.entidad.firma = req.body.firma ? req.body.firma : null;
    }
    else solicitud = req.body;    

    model.Solicitud.edit(req.params.id, solicitud)
      .then(id => res.status(201).json({ id }))
      .catch(e => {
        console.error(e);
        res.status(500).json({ msg: 'Error en el servidor' });
      });
});

router.delete('/:id', function(req, res) {

});

module.exports = router;
