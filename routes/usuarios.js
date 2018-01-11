const router = require('express').Router();
const model = require('../model');
const bodyParser = require('body-parser');
router.use(bodyParser.json());

router.get('/', function(req, res) {
  model.Usuario.getAll(req.query)
    .then(r => res.json(r))
    .catch(e => {
      console.error(e);
      res.status(500).json({ msg: 'Error en el servidor' });
    });
});

router.get('/:id/delegaciones', function (req, res) {
  model.Usuario.getDelegaciones(req.params.id)
    .then(r => res.json(r))
    .catch(e => {
      console.error(e);
      res.status(500).json({ msg: 'Error en el servidor' });
    });
});

router.get('/:id', function(req, res) {
  model.Usuario.get(req.params.id)
    .then(r => res.json(r))
    .catch(e => {
      console.error(e);
      res.status(500).json({ msg: 'Error en el servidor' });
    });
});

router.post('/', function(req, res) {
  model.Usuario.add(req.body)
  .then(r => res.json(r))
  .catch(e => {
    console.error(e);
    res.status(500).json({ msg: 'Error en el servidor' });
  });
});

router.post('/auth', function(req, res) {
  model.Usuario.auth(req.body)
  .then(r => {
    if (!r) res.status(403).json({ msg: 'Combinación de usuario/contraseña incorrecta' });
    else res.json(r)
  })
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
