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
    req.body[file.fieldname] = file.originalname;
    cb(null, file.originalname)
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
    let solicitud = JSON.parse(req.body.solicitud);
    solicitud.entidad.foto = req.body.foto || null;
    solicitud.entidad.firma = req.body.firma || null;

    model.Solicitud.add(solicitud)
      .then(id => res.status(201).json({ id }))
      .catch(e => {
        console.error(e);
        res.status(500).json({ msg: 'Error en el servidor' });
      });
});

router.put('/:id', function(req, res) {

});

router.delete('/:id', function(req, res) {

});

module.exports = router;
