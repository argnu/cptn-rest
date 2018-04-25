const dot = require('dot-object');
const connector = require(`../db/connector`);
const sql = require('sql');
sql.setDialect('postgres');

const TipoVariableGlobal = require('./tipos/TipoVariableGlobal');

const table = sql.define({
    name: 'valores_globales',
    columns: [
        {
            name: 'id',
            dataType: 'serial',
            primaryKey: true
        },
        {
            name: 'fecha',
            dataType: 'date',
            primaryKey: true
        },
        {
            name: 'variable',
            dataType: 'int',
            notNull: true            
        },
        {
            name: 'valor',
            dataType: 'float',
            notNull: true
        }
    ],

    foreignKeys: [
        {
            table: 't_variable_global',
            columns: ['variable'],
            refColumns: ['id']
        }
    ]
});

module.exports.table = table;

const select = [
    table.id,
    table.fecha.cast('varchar(10)'),
    TipoVariableGlobal.table.id.as('variable.id'),
    TipoVariableGlobal.table.nombre.as('variable.nombre'),
    TipoVariableGlobal.table.descripcion.as('variable.descripcion'),
    table.valor
]

const from = table.join(TipoVariableGlobal.table).on(table.variable.equals(TipoVariableGlobal.table.id));

module.exports.getAll = function (params) {
    let query = table.select(select).from(from);

    if (params.nombre) query.where(TipoVariableGlobal.table.nombre.equals(params.nombre));

    query.order(table.fecha.desc);

    return connector.execQuery(query.toQuery())
    .then(r => r.rows.map(row => dot.object(row)));
}

module.exports.get = function (id) {
    let query = table.select(select).from(from).where(table.id.equals(id)).toQuery();

    return connector.execQuery(query)
    .then(r => dot.object(r.rows[0]));
}

module.exports.add = function (global) {
    let query = table.insert(
        table.fecha.value(new Date()),
        table.variable.value(global.variable),
        table.valor.value(global.valor)
    )
    .returning(table.id, table.fecha, table.variable, table.valor)
    .toQuery();

    return connector.execQuery(query)
    .then(r => r.rows[0]);
}