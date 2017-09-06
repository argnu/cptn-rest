const router = require('express').Router();

router.get('/*', (req, res, next) => {
  if (req.query.sort) {
    let sort_obj = {};
    for(let s of req.query.sort.split(',')) {
      let key = s;
      let type = 'asc';
      if (s[0] == '-') {
        type = 'desc';
        key = s.substring(1, s.length);
      }
      sort_obj[key] = type;
    }
    req.query.sort = sort_obj;

  }
  next();
});

router.use('/profesionales', require('./profesionales'));
// router.use('/empresas', require('./empresas'));
router.use('/solicitudes', require('./solicitudes'));
router.use('/opciones', require('./opciones'));
router.use('/paises', require('./paises'));
router.use('/provincias', require('./provincias'));
router.use('/departamentos', require('./departamentos'));
router.use('/localidades', require('./localidades'));

module.exports = router;
