const router = require('express').Router();
const model = require('../model');
const bodyParser = require('body-parser');
router.use(bodyParser.json());

router.get('/', function(req, res) {
  let opciones = {};

  Promise.all([
    model.TipoCondicionAfip.getAll(req.query),
    model.TipoContacto.getAll(req.query),
    model.TipoEmpresa.getAll(req.query),
    model.TipoEstadoCivil.getAll(req.query),
    model.TipoFormacion.getAll(req.query),
    model.TipoRelacionLaboral.getAll(req.query),
    model.TipoSexo.getAll(req.query),
    model.TipoSociedad.getAll(req.query),
    model.TipoIncumbencia.getAll(req.query),
  ])
  .then(([
    condicionafip, contacto, empresa, estadocivil,
    formacion, relacionlaboral, sexo, sociedad,
    incumbencia
  ]) => res.json({
        condicionafip, contacto, empresa, estadocivil,
        formacion, relacionlaboral, sexo, sociedad,
        incumbencia
      })
  )
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
