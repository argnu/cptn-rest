const connector = require('../../db/connector');
const sql = require('node-sql-2');
sql.setDialect('postgres');

const utils = require(`../../utils`)
const Boleta = require('./Boleta');

const table = sql.define({
    name: 'boleta_item',
    columns: [{
            name: 'id',
            dataType: 'serial',
            primaryKey: true
        },
        {
            name: 'boleta',
            dataType: 'int',
            notNull: true
        },
        {
            name: 'item',
            dataType: 'int',
            notNull: true
        },
        {
            name: 'descripcion',
            dataType: 'varchar(255)',
        },
        {
            name: 'importe',
            dataType: 'float',
        }
    ],

    foreignKeys: [
        {
            table: 'boleta',
            columns: ['boleta'],
            refColumns: ['id'],
            onDelete: 'cascade'
        }, 
    ]
});

module.exports.table = table;

module.exports.getByBoleta = function (boleta) {
    let query = table.select(table.star())
        .from(table)
        .where(table.boleta.equals(boleta))
        .toQuery();

    return connector.execQuery(query)
        .then(r => r.rows);
}

module.exports.getByNumeroBoleta = function (numero, item) {
    let query = table.select(
            table.id,
            table.item,
            table.descripcion
        )
        .from(
            table.join(Boleta.table)
            .on(table.boleta.equals(Boleta.table.id))
        )
        .where(
            Boleta.table.numero.equals(numero)
            .and(table.item.equals(item))
        )
        .toQuery();

    return connector.execQuery(query)
        .then(r => r.rows ? r.rows[0] : null);
}

module.exports.add = function (boleta_item, client) {
    let query = table.insert(
            table.boleta.value(boleta_item.boleta),
            table.item.value(boleta_item.item),
            table.descripcion.value(boleta_item.descripcion),
            table.importe.value(utils.getFloat(boleta_item.importe))
        )
        .returning(table.id, table.descripcion)
        .toQuery();

    return connector.execQuery(query, client).then(r => r.rows[0]);
}