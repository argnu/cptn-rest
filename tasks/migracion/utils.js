const config = require('../../config.private');
const sqlserver = require('./sqlserver');

module.exports.migrar = function (q_objeto, q_limites, page_size, addNuevoObjeto) {
  let max;

  function navegar(index) {
      if (index < max) {
          let offset = index + page_size;
          return sqlserver.query(q_objeto, index, offset)
              .then(objetos => {
                  if (objetos && objetos.length) {
                    let nuevosObjetos = objetos.map(o => addNuevoObjeto(o));
                    return Promise.all(nuevosObjetos).then(res =>
                      navegar(offset + 1)
                    );
                  }
                  else return navegar(offset + 1);
              });
      }
  }

  return sqlserver.query(q_limites)
      .then(resultado => {
        console.log(`${resultado[0]['min']} - ${resultado[0]['max']}`);
          if (resultado[0]) {
              let min = resultado[0]['min'];
              max = resultado[0]['max'];
              return navegar(min);
          }

          return sql.close();
      });
}
