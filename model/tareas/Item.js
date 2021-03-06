const connector = require(`../../db/connector`);
const sql = require('node-sql-2');
sql.setDialect('postgres');

const table = sql.define({
  name: 'tarea_item',
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

module.exports.add = function(item, client) {
  let query = table.insert(table.descripcion.value(item.descripcion))
                   .returning(table.id, table.descripcion)
                   .toQuery();

  return connector.execQuery(query, client).then(r => r.rows[0]);
}
