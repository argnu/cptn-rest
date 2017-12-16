const connector = require('../../connector');
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
            name: 'boleta_item',
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
            // Agregar foreign key una vez que se confirmen los datos
        }

    ],

    foreignKeys: [{
            table: 'comprobante',
            columns: ['comprobante'],
            refColumns: ['id']
        },
        {
            table: 'boleta_item',
            columns: ['boleta_item'],
            refColumns: ['id']
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
            table.importe.value(comprobante_item.importe),
            table.delegacion.value(comprobante_item.delegacion)
        )
        .returning(table.id, table.descripcion)
        .toQuery();

    return connector.execQuery(query, client).then(r => r.rows[0]);
}
