const router = require('express').Router();
const model = require('../model');
const bodyParser = require('body-parser');
router.use(bodyParser.json());

router.get('/', function(req, res) {
  model.Delegacion.getAll(req.query)
    .then(r => res.json(r))
    .catch(e => {
      console.error(e);
      res.status(500).json({ msg: 'Error en el servidor' });
    });
});

router.get('/:id', function(req, res) {
  model.Delegacion.get(req.params.id)
    .then(r => res.json(r))
    .catch(e => {
      console.error(e);
      res.status(500).json({ msg: 'Error en el servidor' });
    });
});

router.post('/', function(req, res) {

});

router.put('/:id', function(req, res) {

});

router.delete('/:id', function(req, res) {

});

module.exports = router;
