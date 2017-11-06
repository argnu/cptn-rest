const connector = require('../../connector');
const sql = require('sql');
sql.setDialect('postgres');
const BoletaItem = require('./BoletaItem');

const table = sql.define({
    name: 'boleta',
    columns: [{
            name: 'id',
            dataType: 'serial',
            primaryKey: true
        },
        {
            name: 'numero',
            dataType: 'int',
            notNull: true,
            unique: true
        },
        {
            name: 'matricula',
            dataType: 'int',
            notNull: true
        },
        {
            name: 'tipo_comprobante',
            dataType: 'varchar(10)'
        },
        {
            name: 'fecha',
            dataType: 'date',
        },
        {
            name: 'total',
            dataType: 'float',
        },
        {
            name: 'estado',
            dataType: 'int',
        },
        {
            name: 'fecha_vencimiento',
            dataType: 'date',
        },
        {
            name: 'numero_comprobante',
            dataType: 'int',
        },
        {
            name: 'numero_solicitud',
            dataType: 'int',
        },
        {
            name: 'numero_condonacion',
            dataType: 'int',
        },
        {
            name: 'tipo_pago',
            dataType: 'int',
        },
        {
            name: 'fecha_pago',
            dataType: 'date',
        },
        {
            name: 'fecha_update',
            dataType: 'date',
        },
        {
            name: 'delegacion',
            dataType: 'int',
            // Agregar foreign key una vez que se confirmen los datos
        },
    ],

    foreignKeys: [{
            table: 'matricula',
            columns: ['matricula'],
            refColumns: ['id']
        },
        {
            table: 't_estadoboleta',
            columns: ['estado'],
            refColumns: ['id']
        },
        {
            table: 't_comprobante',
            columns: ['tipo_comprobante'],
            refColumns: ['id']
        }
    ]
});

module.exports.table = table;

module.exports.getByNumero = function(numero) {
  let query = table.select(table.star())
                   .from(table)
                   .where(table.numero.equals(numero))
                   .toQuery();

  return connector.execQuery(query)
         .then(r => r.rows[0]);
}

module.exports.getAll = function() {
  let boletas = [];

  let query = table.select(table.star())
                   .from(table)
                   .toQuery();

  return connector.execQuery(query)
         .then(r => {
           boletas = r.rows;
           let proms = boletas.map(b => BoletaItem.getByBoleta(b.id));
           return Promise.all(proms);
         })
         .then(bol_items => {
           bol_items.forEach((items, index) => {
             boletas[index].items = items;
           });
           return boletas;
         });
}

module.exports.get = function(id) {
  let query = table.select(table.star())
                   .from(table)
                   .where(table.id.equals(id))
                   .toQuery();

  let boleta;

  return connector.execQuery(query)
         .then(r => {
           boleta = r.rows[0];
           return BoletaItem.getByBoleta(id);
         })
         .then(items => {
           boleta.items = items;
           return boleta;
         });
}
