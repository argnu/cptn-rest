const router = require('express').Router();

router.use('/profesionales', require('./profesionales'));
// router.use('/empresas', require('./empresas'));
router.use('/solicitudes', require('./solicitudes'));
router.use('/opciones', require('./opciones'));
router.use('/paises', require('./paises'));
router.use('/provincias', require('./provincias'));
router.use('/departamentos', require('./departamentos'));
router.use('/localidades', require('./localidades'));

module.exports = router;
