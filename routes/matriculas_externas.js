const utils = require('../utils');
const router = require('express').Router();
const model = require('../model');
const bodyParser = require('body-parser');
router.use(bodyParser.json());

router.get('/', function (req, res) {
    model.MatriculaExterna.getAll(req.query)
        .then(matriculas => res.json(matriculas))
        .catch(e => utils.errorHandler(e, req, res));
});

router.get('/:id', function (req, res) {
    model.MatriculaExterna.get(req.params.id)
        .then(matricula => res.json(matricula))
        .catch(e => utils.errorHandler(e, req, res));
});

router.post('/', function (req, res) {
    model.MatriculaExterna.add(req.body)
        .then(matricula => res.status(201).json(matricula))
        .catch(e => utils.errorHandler(e, req, res));
});

router.patch('/:id', function (req, res) {

});

router.put('/:id', function (req, res) {

});

router.delete('/:id', function (req, res) {

});

module.exports = router;
