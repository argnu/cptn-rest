const connector = require(`../db/connector`);
const sql = require('sql');
sql.setDialect('postgres');

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
            name: 'nombre',
            dataType: 'varchar(45)',
        },
        {
            name: 'descripcion',
            dataType: 'varchar(255)',
        },
        {
            name: 'valor',
            dataType: 'float',
            notNull: true
        }
    ]
});

module.exports.table = table;

const select = [
    table.id,
    table.fecha.cast('varchar(10)'),
    table.nombre,
    table.descripcion,
    table.valor
]

module.exports.getAll = function (params) {
    let query = table.select(select)

    if (params.descripcion) query.where(table.descripcion.equals(params.descripcion));
    if (params.nombre) query.where(table.nombre.equals(params.nombre));
    query.order(table.fecha.desc);

    return connector.execQuery(query.toQuery())
        .then(r => r.rows);
}

module.exports.get = function (id) {
    let query = table.select(select).where(table.id.equals(id)).toQuery();

    return connector.execQuery(query)
        .then(r => r.rows[0]);
}
