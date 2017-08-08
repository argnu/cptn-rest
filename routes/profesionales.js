const router = require('express').Router();
const db = require('../db/Profesional');
const bodyParser = require('body-parser');
router.use(bodyParser.json());

router.get('/', function(req, res) {
  db.getAll()
    .then(r => res.status(200).json(r.rows))
    .catch(e => console.error(e));
});

router.get('/:id', function(req, res) {
  db.get(req.params.id)
    .then(r => res.status(200).json(r.rows[0]))
    .catch(e => console.error(e));
});

router.post('/', function(req, res) {
  db.add(req.body)
    .then(r => res.status(201).json(r.rows[0]))
    .catch(e => console.error(e));
});

router.put('/:id', function(req, res) {

});

router.delete('/:id', function(req, res) {

});

module.exports = router;
