const utils = require('../utils');
const router = require('express').Router();
const model = require('../model');



router.get('/', function(req, res) {
  model.Usuario.get(req.user.id)
  .then(operador => {
    if (!req.ability.can('manage', 'Usuario')) return Promise.reject({ code: 403, msg: 'No tiene permisos para efectuar esta operación' });
    else return model.Usuario.getAll(req.query);
  })
  .then(r => res.json(r))
  .catch(e => utils.errorHandler(e, req, res));
});

router.get('/:id/delegaciones', function (req, res) {
  model.Usuario.get(req.user.id)
  .then(operador => {
    if (req.ability.can('manage', 'Usuario') || operador.id==req.params.id) return model.Usuario.getDelegaciones(req.params.id);
    else return Promise.reject({ code: 403, msg: 'No tiene permisos para efectuar esta operación' });
  })
  .then(r => res.json(r))
  .catch(e => utils.errorHandler(e, req, res));
});

router.get('/:id', function(req, res) {
  model.Usuario.get(req.user.id)
  .then(operador => {
    if (req.ability.can('manage', 'Usuario') || operador.id==req.params.id) return model.Usuario.get(req.params.id)
    else return Promise.reject({ code: 403, msg: 'No tiene permisos para efectuar esta operación' });
  })
  .then(r => res.json(r))
  .catch(e => utils.errorHandler(e, req, res));    
});

router.post('/', function(req, res) {
  model.Usuario.get(req.user.id)
  .then(operador => {
    if (!req.ability.can('manage', 'Usuario')) return Promise.reject({ code: 403, msg: 'No tiene permisos para efectuar esta operación' });
    else return model.Usuario.add(req.body)
  })
  .then(r => res.json(r))
  .catch(e => utils.errorHandler(e, req, res));     
});

router.post('/:id/delegaciones', function(req, res) {
  model.Usuario.get(req.user.id)
  .then(operador => {
    if (req.ability.can('manage', 'Usuario') || operador.id==req.params.id) return model.Usuario.addDelegacion(req.params.id,req.body)
    else return Promise.reject({ code: 403, msg: 'No tiene permisos para efectuar esta operación' });
  })
  .then(r => res.json(r))
  .catch(e => utils.errorHandler(e, req, res));   
});

router.post('/auth', function(req, res) {
  model.Usuario.auth(req.body)
  .then(r => {
    if (r.code == 403) res.status(r.code).json({ message: r.message });
    else res.json(r.user);
  })
  .catch(e => utils.errorHandler(e, req, res));
});

router.patch('/:id', function(req, res) {
  model.Usuario.patch(req.params.id, req.body)
  .then(r => res.json(r))
  .catch(e => utils.errorHandler(e, req, res));
});

router.put('/:id', function(req, res) {
  model.Usuario.edit(req.params.id, req.body)
  .then(r => res.json(r))
  .catch(e => utils.errorHandler(e, req, res));
});

router.delete('/:id', function(req, res) {

});

router.delete('/:id/delegaciones/:id_del', function(req, res) {
  model.Usuario.get(req.user.id)
  .then(operador => {
    if (req.ability.can('manage', 'Usuario') || operador.id==req.params.id) return model.Usuario.borrarDelegacion(req.params.id_del)
    else return Promise.reject({ code: 403, msg: 'No tiene permisos para efectuar esta operación' });    
  })
  .then(r => res.json(r))
  .catch(e => utils.errorHandler(e, req, res));   
});

module.exports = router;
