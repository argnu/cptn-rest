const connector = require(`${__base}/connector`);
const sql = require('sql');
sql.setDialect('postgres');
const Subcategoria = require('./Subcategoria');

const table = sql.define({
  name: 'tarea_categoria',
  columns: [
    {
      name: 'id',
      dataType: 'serial',
      primaryKey: true
    },
    {
      name: 'descripcion',
      dataType: 'varchar(255)',
      notNull: true
    }
  ]
});

module.exports.table = table;

function getSubcategorias(id) {
  let table = Subcategoria.table;
  let query = table.select(table.star())
                   .from(table)
                   .where(table.categoria.equals(id))
                   .toQuery();

  return connector.execQuery(query)
         .then(r => r.rows);
}

module.exports.getAll = function() {
  let query = table.select(table.star()).toQuery();
  let categorias = []
  return connector.execQuery(query)
         .then(r => {
           categorias = r.rows;
           return Promise.all(categorias.map(c => getSubcategorias(c.id)))
         })
         .then(r => {
           r.forEach((subcategorias, i) => {
             categorias[i].subcategorias = subcategorias;
           })
           return categorias;
         });
}
