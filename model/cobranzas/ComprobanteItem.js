const utils = require('../../utils');
const connector = require('../../db/connector');
const sql = require('sql');
sql.setDialect('postgres');


const table = sql.define({
    name: 'comprobante_item',
    columns: [{
            name: 'id',
            dataType: 'serial',
            primaryKey: true
        },
        {
            name: 'comprobante',
            dataType: 'int',
            notNull: true
        },
        {
            name: 'item',
            dataType: 'int',
        },
        {
            name: 'boleta',
            dataType: 'int'
        },
        {
            name: 'descripcion',
            dataType: 'varchar(255)',
        },
        {
            name: 'cuenta_contable',
            dataType: 'varchar(255)',
        },
        {
            name: 'importe',
            dataType: 'float',
        },
        {
            name: 'delegacion',
            dataType: 'int',
        }
    ],

    foreignKeys: [{
            table: 'comprobante',
            columns: ['comprobante'],
            refColumns: ['id'],
            onDelete: 'cascade'
        },
        {
            table: 'boleta',
            columns: ['boleta'],
            refColumns: ['id'],
            onDelete: 'set null'
        }
    ]
});

module.exports.table = table;

module.exports.getByComprobante = function(id) {
  let query = table.select(table.star())
      .from(table)
      .where(table.comprobante.equals(id))
      .toQuery();

  return connector.execQuery(query)
      .then(r => r.rows);
}

module.exports.add = function (comprobante_item, client) {
    let query = table.insert(
            table.comprobante.value(comprobante_item.comprobante),
            table.item.value(comprobante_item.item),
            table.boleta.value(comprobante_item.boleta),
            table.descripcion.value(comprobante_item.descripcion),
            table.cuenta_contable.value(comprobante_item.cuenta_contable),
            table.importe.value(utils.getFloat(comprobante_item.importe))
        )
        .returning(table.id, table.descripcion)
        .toQuery();

    return connector.execQuery(query, client).then(r => r.rows[0]);
}
