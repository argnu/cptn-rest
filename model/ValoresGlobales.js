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
            name: 'fecha_inicio',
            dataType: 'date',
        },
        {
            name: 'fecha_fin',
            dataType: 'date',
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
    table.fecha_inicio.cast('varchar(10)'),
    table.fecha_fin.cast('varchar(10)'),
    TipoVariableGlobal.table.id.as('variable.id'),
    TipoVariableGlobal.table.nombre.as('variable.nombre'),
    TipoVariableGlobal.table.descripcion.as('variable.descripcion'),
    table.valor
]

const from = table.join(TipoVariableGlobal.table).on(table.variable.equals(TipoVariableGlobal.table.id));

module.exports.getAll = function (params) {
    let query = table.select(select).from(from);

    if (params.nombre) query.where(TipoVariableGlobal.table.nombre.equals(params.nombre));
    if (params.variable) query.where(TipoVariableGlobal.table.id.equals(params.variable));

    query.order(table.fecha_inicio.desc);

    return connector.execQuery(query.toQuery())
    .then(r => r.rows.map(row => dot.object(row)));
}

module.exports.get = function (id) {
    let query = table.select(select).from(from).where(table.id.equals(id)).toQuery();

    return connector.execQuery(query)
    .then(r => dot.object(r.rows[0]));
}

module.exports.getValida = function (variable, fecha) {
    let query = table.select(select)
    .from(from)
    .where(
        table.variable.equals(variable)
        .and(table.fecha_inicio.lte(fecha))
        .and(table.fecha_fin.gte(fecha))
    )
    .toQuery();

    return connector.execQuery(query)
    .then(r => {
        if (r.rows.length > 0) return dot.object(r.rows[0]);
        else return Promise.reject('No hay una variable válida en la fecha especificada');
    });
}

module.exports.add = function (data) {
    let query = table.insert(
        table.fecha_inicio.value(data.fecha_inicio),
        table.fecha_fin.value(data.fecha_fin),
        table.variable.value(data.variable),
        table.valor.value(data.valor)
    )
    .returning(table.id, table.fecha_inicio, table.fecha_fin, table.variable, table.valor)
    .toQuery();

    return connector.execQuery(query)
    .then(r => r.rows[0]);
}

module.exports.edit = function (id, data) {
    let query = table.update(data)
    .where(table.id.equals(id))
    .returning(table.id, table.fecha_inicio, table.fecha_fin, table.variable, table.valor)
    .toQuery();

    return connector.execQuery(query)
    .then(r => r.rows[0]);
}

module.exports.delete = function (id, data) {
    let query = table.delete()
    .where(table.id.equals(id))
    .returning(table.id, table.fecha_inicio, table.fecha_fin, table.variable, table.valor)
    .toQuery();

    return connector.execQuery(query)
    .then(r => r.rows[0]);
}