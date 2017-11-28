const connector = require(`${__base}/connector`);
const sql = require('sql');
sql.setDialect('postgres');
const LegajoItem = require('./LegajoItem')
const Item = require('./Item')

const table = sql.define({
    name: 'legajo',
    columns: [{
            name: 'id',
            dataType: 'serial',
            primaryKey: true
        },
        {
            name: 'solicitud',
            dataType: 'int',
            notNull: true
        },
        {
            name: 'numero_legajo',
            dataType: 'int',
            notNull: true
        },
        {
            name: 'tipo',
            dataType: 'int',
        },
        {
            name: 'matricula',
            dataType: 'int',
            notNull: true
        },
        {
            name: 'fecha_solicitud',
            dataType: 'date',
        },
        {
            name: 'comitente',
            dataType: 'int',
        },
        {
            name: 'direccion',
            dataType: 'varchar(255)',
        },
        {
            name: 'nomenclatura',
            dataType: 'varchar(255)',
        },
        {
            name: 'estado',
            dataType: 'varchar(255)',
        },
        {
            name: 'ciudad',
            dataType: 'varchar(255)',
        },
        {
            name: 'departamento',
            dataType: 'varchar(255)',
        },
        {
            name: 'subcategoria',
            dataType: 'int',
        },
        {
            name: 'incumbencia',
            dataType: 'int',
        },
        {
            name: 'honorarios_presupuestados',
            dataType: 'float',
        },
        {
            name: 'forma_pago',
            dataType: 'varchar(255)',
        },
        {
            name: 'plazo_cumplimiento',
            dataType: 'date',
        },
        {
            name: 'honorarios_reales',
            dataType: 'float',
        },
        {
            name: 'porcentaje_cumplimiento',
            dataType: 'int',
        },
        {
            name: 'finalizacion_tarea',
            dataType: 'date',
        },
        {
            name: 'tarea_publica',
            dataType: 'boolean',
        },
        {
            name: 'dependencia',
            dataType: 'boolean',
        },
        {
            name: 'aporte_bruto',
            dataType: 'float',
        },
        {
            name: 'aporte_neto',
            dataType: 'float',
        },
        {
            name: 'cantidad_planos',
            dataType: 'int',
        },
        {
            name: 'observaciones',
            dataType: 'text',
        },
        {
            name: 'observaciones_internas',
            dataType: 'text',
        },
        {
            name: 'informacion_adicional',
            dataType: 'text',
        },
        {
            name: 'evaluador',
            dataType: 'varchar(30)',
        },
        {
            name: 'delegacion',
            dataType: 'int',
            // Agregar foreign key una vez que se confirmen los datos
        },
        {
            name: 'numero_acta',
            dataType: 'varchar(50)',
        },
        {
            name: 'operador_carga',
            dataType: 'varchar(30)',
        },
        {
            name: 'operador_aprobacion',
            dataType: 'varchar(30)',
        }

    ],

    foreignKeys: [{
            table: 'matricula',
            columns: ['matricula'],
            refColumns: ['id']
        },
        {
            table: 'tarea_subcategoria',
            columns: ['subcategoria'],
            refColumns: ['id']
        },
        {
            table: 'comitente',
            columns: ['comitente'],
            refColumns: ['id']
        },
        {
            table: 't_incumbencia',
            columns: ['incumbencia'],
            refColumns: ['id']
        }
    ]
});

module.exports.table = table;

module.exports.getBySolicitud = function (id_solicitud) {
    let query = table.select(table.id)
      .from(table)
      .where(table.solicitud.equals(id_solicitud))
      .toQuery();
    return connector.execQuery(query)
      .then(r => r.rows[0]);
}

function getItems(id_legajo) {
  let table = LegajoItem.table;
  let query = table.select(table.star()).from(table)
                   .where(table.legajo.equals(id_legajo))
                   .toQuery();
  let items = [];

 return connector.execQuery(query)
   .then(r => {
     items = r.rows;
     return Promise.all(items.map(i => getItemData(i.item)))
   })
   .then(data => {
     items.forEach((item, i) => {
       item.item = data[i];
     });
     return items;
   })
}

function getItemData(id_item) {
  let table = Item.table;
  let query = table.select(table.star()).from(table)
                   .where(table.id.equals(id_item))
                   .toQuery();

 return connector.execQuery(query)
   .then(r => r.rows[0]);
}

module.exports.getAll = function(params) {
  let legajos = [];
  let query = table.select(table.star()).from(table);
  query.where(table.tipo.notEquals(0)); // EVITAR LOS ANULADOS
  if (params.matricula) query.where(table.matricula.equals(params.matricula));

  if (params.limit) query.limit(+params.limit);
  if (params.limit && params.offset) query.offset(+params.offset);

  return connector.execQuery(query.toQuery())
    .then(r => {
      legajos = r.rows;
      return Promise.all(r.rows.map(m => getItems(m.id)))
    })
    .then(items => {
      legajos.forEach((legajo, i) => {
        legajo.items = items[i];
      });
      return legajos;
    })
}
