const utils = require('../utils');
const router = require('express').Router();
const model = require('../model');



router.get('/', function(req, res) {
  model.ValoresGlobales.getAll(req.query)
    .then(r => res.json(r))
    .catch(e => utils.errorHandler(e, req, res));
});

router.get('/:id', function(req, res) {
  model.ValoresGlobales.get(req.params.id)
    .then(r => res.json(r))
    .catch(e => utils.errorHandler(e, req, res));
});


router.post('/', function(req, res) {
  model.ValoresGlobales.add(req.body)
  .then(r => res.status(201).json(r))
  .catch(e => utils.errorHandler(e, req, res));
});

router.put('/:id', function(req, res) {
  model.ValoresGlobales.edit(req.params.id, req.body)
  .then(r => res.status(200).json(r))
  .catch(e => utils.errorHandler(e, req, res));
});

router.delete('/:id', function(req, res) {
  model.ValoresGlobales.delete(req.params.id)
  .then(r => res.status(200).json(r))
  .catch(e => utils.errorHandler(e, req, res));
});

module.exports = router;
