const utils = require('../utils');
const router = require('express').Router();
const model = require('../model');

router.get('/', function(req, res) {
  model.VolantePago.getAll(req.query)
    .then(r => res.json(r))
    .catch(e => utils.errorHandler(e, req, res));
});

router.get('/:id', function(req, res) {
  model.VolantePago.get(req.params.id)
    .then(r => res.json(r))
    .catch(e => utils.errorHandler(e, req, res));
});


router.post('/', function(req, res) {
  req.body.created_by = req.user.id;
  model.VolantePago.add(req.body)
    .then(r => res.status(201).json(r))
    .catch(e => utils.errorHandler(e, req, res));
});

router.post('/:id/anular', function(req, res) {
  let volante = {
    updated_by: req.user.id
  }
  
  model.VolantePago.anular(req.params.id, volante)
    .then(r => res.status(200).json(r))
    .catch(e => utils.errorHandler(e, req, res));
});


router.put('/:id', function(req, res) {

});

router.delete('/:id', function(req, res) {

});

module.exports = router;
