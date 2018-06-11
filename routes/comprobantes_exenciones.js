const utils = require('../utils');
const router = require('express').Router();
const model = require('../model');
const bodyParser = require('body-parser');
router.use(bodyParser.json());

router.get('/', function(req, res) {
  model.ComprobanteExencion.getAll(req.query)
    .then(r => res.json(r))
    .catch(e => utils.errorHandler(e, req, res));
});

router.get('/:id', function(req, res) {
  model.ComprobanteExencion.get(req.params.id)
    .then(r => res.json(r))
    .catch(e => utils.errorHandler(e, req, res));
});


router.post('/', function(req, res) {
  req.body.created_by = req.user.id;
  model.ComprobanteExencion.add(req.body)
    .then(r => res.status(201).json(r))
    .catch(e => utils.errorHandler(e, req, res));
});


router.put('/:id', function(req, res) {

});

router.delete('/:id', function(req, res) {

});

module.exports = router;