module.exports.getMethodAbility = function(method) {
    let abilities = {
      GET: 'read',
      PUT: 'update',
      DELETE: 'delete'
    }
  
    return abilities[method];
}

module.exports.roles = require('./roles');