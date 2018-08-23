const connector = require(`../../db/connector`);
const sql = require('node-sql-2');
sql.setDialect('postgres');
const Persona = require(`../Persona`);

const table = sql.define({
    name: 'legajo_comitente',
    columns: [
        {
            name: 'id',
            dataType: 'serial',
            primaryKey: true
        },
        {
            name: 'legajo',
            dataType: 'int',
            notNull: true
        },
        {
            name: 'persona',
            dataType: 'int',
            notNull: true
        },
        {
            name: 'porcentaje',
            dataType: 'float',
        }
    ],

    foreignKeys: [
        {
            table: 'legajo',
            columns: ['legajo'],
            refColumns: ['id'],
            onDelete: 'cascade'
        },
        {
            table: 'persona',
            columns: ['persona'],
            refColumns: ['id'],
            onDelete: 'cascade'
        },
    ]
});

module.exports.table = table;

module.exports.add = function (data, client) {
    let query = table.insert(
        table.legajo.value(data.legajo),
        table.persona.value(data.persona),
        table.porcentaje.value(data.porcentaje)
    )
    .returning(table.star())
    .toQuery();

    return connector.execQuery(query, client).then(r => r.rows[0]);
}

module.exports.getByLegajo = function(id_legajo) {
    let comitentes;
    let query = table.select(table.star()).where(table.legajo.equals(id_legajo)).toQuery();

    return connector.execQuery(query)
    .then(r => {
        comitentes = r.rows;
        return Promise.all(comitentes.map(c => Persona.get(c.persona)));
    })
    .then(personas => {
        comitentes.forEach((comitente, i) => {
            comitente.persona = personas[i];
        });
        return comitentes;
    })
}