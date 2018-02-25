const connector = require('../db/connector');
const sql = require('sql');
sql.setDialect('postgres');

 const table = sql.define({
  name: 'documento',
  columns: [{
      name: 'id',
      dataType: 'serial',
      primaryKey: true
    },
    {
      name: 'tipo',
      dataType: 'int',
      notNull: true
    },
    {
      name: 'numero',
      dataType: 'int',
      notNull: true
    },
    {
      name: 'fecha',
      dataType: 'date',
      notNull: true
    }
  ],

  foreignKeys: [
      {
        table: 't_documento',
        columns: ['tipo'],
        refColumns: ['id']          
      }
  ]
});

module.exports.table = table;

module.exports.getAll = function(params) {
  let query = table.select(table.star()).from(table);

  if (params.numero) query.where(table.numero.equals(params.numero));
  if (params.tipo) query.where(table.tipo.equals(params.tipo));

  return connector.execQuery(query.toQuery())
  .then(r => r.rows);
}

module.exports.get = function(id) {
  let query = table.select(table.star())
       .from(table)
       .where(table.id.equals(id))
       .toQuery();

  return connector.execQuery(query)
  .then(r => r.rows[0]);
}

module.exports.add = function(documento, client) {
  try {
    let query = table.select(table.star())
    .where(
      table.numero.equals(documento.numero)
      .and(table.tipo.equals(documento.tipo))
    )
    .toQuery();
  
    return connector.execQuery(query)
    .then(r => {
      if (r.rows.length > 0) return Promise.reject({ code: 400, message: "Ya existe un documento con mismo número y tipo" })
      else {
        let query = table.insert(
          table.numero.value(documento.numero),
          table.fecha.value(documento.fecha),
          table.tipo.value(documento.tipo)
        )
        .returning(table.id, table.numero, table.tipo, table.fecha)
        .toQuery();
  
        return connector.execQuery(query, client)
        .then(r => r.rows[0])
        .catch(e => {
          console.error(e);
          return Promise.reject(e);          
        })
      }
    });
  }
  catch (e) {
    console.error(e);
    return Promise.reject(e);
  }
}
