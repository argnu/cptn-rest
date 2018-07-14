const utils = require('../utils');
const fs = require('fs');
const path = require('path');
const multer = require('multer');
const router = require('express').Router();
const model = require('../model');
const bodyParser = require('body-parser');
// create application/json parser
router.use(bodyParser.json({
  limit: '10mb'
}));

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

const upload = multer({
  storage: storage
})

router.get('/', function (req, res) {
  model.Profesional.getAll(req.query)
    .then(r => res.json(r))
    .catch(e => utils.errorHandler(e, req, res));
});

router.get('/:id/contactos', function (req, res) {
  model.Contacto.getAll(req.params.id)
    .then(r => res.json(r))
    .catch(e => utils.errorHandler(e, req, res));
});


router.get('/:id/subsidiarios', function (req, res) {
  model.Subsidiario.getAll(req.params.id)
    .then(r => res.json(r))
    .catch(e => utils.errorHandler(e, req, res));
});

router.get('/:id/foto', function (req, res) {
  model.Profesional.getFoto(req.params.id)
    .then(r => {
      let file_path = path.join(__dirname, '..', 'files/fotos', r);
      if (fs.existsSync(file_path)) res.sendFile(file_path);
      else return Promise.reject({
        code: 404,
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
        code: 404,
        msg: 'El recurso solicitado no existe'
      });
    })
    .catch(e => utils.errorHandler(e, req, res));
});

router.get('/:id', function (req, res) {
  model.Profesional.get(req.params.id)
    .then(r => res.json(r))
    .catch(e => utils.errorHandler(e, req, res));
});

router.post('/', function (req, res) {
  model.Profesional.add(req.body)
    .then(r => res.status(201).json(r))
    .catch(e => utils.errorHandler(e, req, res));
});

// upload.fields([{
//   name: 'foto',
//   maxCount: 1
// }]),

router.put('/:id/foto', function (req, res) {

  if (req.body.foto && req.body.filename) {

    const foto = req.body.foto.replace(/^data:(.*);base64,/, "");
    let ext = path.extname(req.body.filename);
    let name = req.body.filename.replace(ext, '') + '-' + Date.now() + ext;

    const filename = path.join(__dirname, '../files/fotos/', name);

    fs.writeFile(filename, foto, 'base64', function (err) {
      if (err) {
        return next(err)
      }

      model.Profesional.patch(req.params.id, {
          foto: filename
        })
        .then(id => res.status(200).json({
          id
        }))
        .catch(e => utils.errorHandler(e, req, res));
    })

  } else res.status(500).json({
    msg: 'Error en el servidor'
  });

});

router.put('/:id/firma', upload.fields([{
  name: 'firma',
  maxCount: 1
}]), function (req, res) {
  if (req.body.firma) {
    model.Profesional.patch(req.params.id, {
        firma: req.body.firma
      })
      .then(id => res.status(200).json({
        id
      }))
      .catch(e => utils.errorHandler(e, req, res));
  } else res.status(500).json({
    msg: 'Error en el servidor'
  });
});

router.put('/:id',
  upload.fields([{
    name: 'foto',
    maxCount: 1
  }, {
    name: 'firma',
    maxCount: 1
  }]),
  function (req, res) {
    let profesional = JSON.parse(req.body.profesional);
    profesional.operador = req.user.id;

    let proms = [];

    if (req.body.foto) {
      proms.push(model.Profesional.patch(req.params.id, {
        foto: req.body.foto
      }));
    }

    if (req.body.firma) {
      proms.push(model.Profesional.patch(req.params.id, {
        firma: req.body.firma
      }));
    }

    proms.push(model.Profesional.edit(req.params.id, profesional))

    Promise.all(proms)
      .then(id => res.status(200).json(profesional))
      .catch(e => utils.errorHandler(e, req, res));
  });

router.delete('/:id', function (req, res) {

});

module.exports = router;