const router = require('express').Router();
const model = require('../model');
const bodyParser = require('body-parser');
router.use(bodyParser.json());

router.get('/categorias', function(req, res) {
  model.tareas.Categoria.getAll(req.params)
    .then(r => res.json(r))
    .catch(e => {
      console.error(e);
      res.status(500).json({ msg: 'Error en el servidor' });
    });
});

router.get('/categorias/:id', function(req, res) {
  model.tareas.Categoria.get(req.params.id)
    .then(r => res.json(r))
    .catch(e => {
      console.error(e);
      res.status(500).json({ msg: 'Error en el servidor' });
    });
});

router.get('/subcategorias/:id/items', function(req, res) {
  model.tareas.ItemPredeterminado.get({ subcategoria: req.params.id })
    .then(r => res.json(r))
    .catch(e => {
      console.error(e);
      res.status(500).json({ msg: 'Error en el servidor' });
    });
});

router.get('/items/:id/predeterminados', function(req, res) {
  model.tareas.ItemValorPredeterminado.get({ item: req.params.id })
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
