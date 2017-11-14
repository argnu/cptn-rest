const connector = require(`${__base}/connector`);
const sql = require('sql');
sql.setDialect('postgres');
const model = require(`${__base}/model`);

const table = sql.define({
    name: 'comprobante',
    columns: [{
            name: 'id',
            dataType: 'serial',
            primaryKey: true
        },
        {
            name: 'numero',
            dataType: 'int',
            notNull: true
        },
        {
            name: 'matricula',
            dataType: 'int',
            notNull: true
        },
        {
            name: 'fecha',
            dataType: 'date',
        },
        {
            name: 'fecha_vencimiento',
            dataType: 'date',
        },
        {
            name: 'subtotal',
            dataType: 'float',
        },
        {
            name: 'interes_total',
            dataType: 'float',
        },
        {
            name: 'bonificacion_total',
            dataType: 'float',
        },
        {
            name: 'importe_total',
            dataType: 'float',
        },
        {
            name: 'importe_cancelado',
            dataType: 'float',
        },
        {
            name: 'observaciones',
            dataType: 'text',
        },
        {
            name: 'delegacion',
            dataType: 'int',
            // Agregar foreign key una vez que se confirmen los datos
        },
        {
            name: 'operador',
            dataType: 'int',
        },
        {
            name: 'anulado',
            dataType: 'int',
        },
        {
            name: 'contable',
            dataType: 'int',
        }
    ],

    foreignKeys: [{
        table: 'matricula',
        columns: ['matricula'],
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

function getData(b) {
    return Promise.all([
        model.ComprobanteItem.getByComprobante(b.id),
    ])
}

module.exports.getAll = function (params) {
    let comprobantes = [];

    let query = table.select(table.star())
        .from(table);

   if (params.matricula) query.where(table.matricula.equals(params.matricula));
   if (params.fecha_desde) query.where(table.fecha_vencimiento.gte(params.fecha_desde));
   if (params.fecha_hasta) query.where(table.fecha_vencimiento.lte(params.fecha_hasta));

   if (params.sort && params.sort.fecha) query.order(table.fecha[params.sort.fecha]);
   if (params.sort && params.sort.fecha_vencimiento) query.order(table.fecha_vencimiento[params.sort.fecha_vencimiento]);

   if (params.limit) query.limit(+params.limit);
   if (params.limit && params.offset) query.offset(+params.offset);

    return connector.execQuery(query.toQuery())
        .then(r => {
            comprobantes = r.rows;
            let proms = comprobantes.map(b => getData(b));
            return Promise.all(proms);
        })
        .then(data_list => {
            data_list.forEach((data, index) => {
                comprobantes[index].items = data[0];
            });
            return comprobantes;
        })
}
