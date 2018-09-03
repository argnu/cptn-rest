const router = require('express').Router();

router.use((req, res, next) => {
  if (req.method != 'OPTIONS') {
    if (req.path == '/usuarios/auth' || !!req.user) next();
    else if (req.path.match(/^\/profesionales\/\d+\/(foto|firma)$/)) next();
    else return res.status(401).json({ msg: 'Usuario sin autorización' });
  }
  else next();
});

router.get('/*', (req, res, next) => {
  if (req.query.sort) {
    let sort_obj = {};
    for(let s of req.query.sort.split(',')) {
      let key = s;
      let type = 'asc';
      if (s[0] == '-') type = 'desc';
      key = s.substring(1, s.length).trim();
      sort_obj[key] = type;
    }
    req.query.sort = sort_obj;

  }
  next();
});

router.use('/profesionales', require('./profesionales'));
router.use('/empresas', require('./empresas'));
router.use('/solicitudes', require('./solicitudes'));
router.use('/matriculas', require('./matriculas'));
router.use('/matriculas-externas', require('./matriculas_externas'));
router.use('/opciones', require('./opciones'));
router.use('/paises', require('./paises'));
router.use('/provincias', require('./provincias'));
router.use('/departamentos', require('./departamentos'));
router.use('/localidades', require('./localidades'));
router.use('/delegaciones', require('./delegaciones'));
router.use('/instituciones', require('./instituciones'));
router.use('/boletas', require('./boletas'));
router.use('/comprobantes', require('./comprobantes'));
router.use('/volantespago', require('./volantespago'));
router.use('/bancos', require('./bancos'));
router.use('/usuarios', require('./usuarios'));
router.use('/legajos', require('./legajos'));
router.use('/tareas', require('./tareas'));
router.use('/cajas-previsionales', require('./cajas-previsionales'));

router.use('/personas', require('./personas'));
router.use('/valores-globales', require('./valores_globales'));
router.use('/comprobantes-exenciones', require('./comprobantes_exenciones'));
router.use('/solicitudes-suspension', require('./solicitudes_suspension'));

module.exports = router;
