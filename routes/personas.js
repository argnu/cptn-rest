const path = require('path');
const router = require('express').Router();
const model = require('../model');
const bodyParser = require('body-parser');
router.use(bodyParser.json());

router.get('/', function (req, res) {
    model.Profesional.getAll(req.query)
        .then(r => res.json(r))
        .catch(e => {
            console.error(e);
            res.status(500).json({ msg: 'Error en el servidor' });
        });
});

router.get('/', function (req, res) {
    model.Persona.getAll(req.query)
        .then(r => res.json(r))
        .catch(e => {
            console.error(e);
            res.status(500).json({ msg: 'Error en el servidor' });
        });
});

router.get('/:id', function (req, res) {
    model.Persona.get(req.params.id)
        .then(r => res.json(r))
        .catch(e => {
            console.error(e);
            res.status(500).json({ msg: 'Error en el servidor' });
        });
});


module.exports = router;
