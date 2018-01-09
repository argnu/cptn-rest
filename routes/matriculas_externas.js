const router = require('express').Router();
const model = require('../model');
const bodyParser = require('body-parser');
router.use(bodyParser.json());

function handler(e, res) {
    console.log(e);
    if (e.code) res.status(e.code).json({ message: e.message });
    else res.status(500).json({ msg: 'Error en el servidor' });
}

router.get('/', function (req, res) {
    model.MatriculaExterna.getAll(req.query)
        .then(matriculas => res.json(matriculas))
        .catch(e => handler(e, res));
});

router.get('/:id', function (req, res) {
    model.MatriculaExterna.get(req.params.id)
        .then(matricula => res.json(matricula))
        .catch(e => handler(e, res));
});

router.post('/', function (req, res) {
    model.MatriculaExterna.add(req.body)
        .then(matricula => res.status(201).json(matricula))
        .catch(e => handler(e, res));
});

router.patch('/:id', function (req, res) {

});

router.put('/:id', function (req, res) {

});

router.delete('/:id', function (req, res) {

});

module.exports = router;
