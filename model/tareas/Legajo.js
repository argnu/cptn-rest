const dot = require('dot-object');
const moment = require('moment');
const connector = require(`../../db/connector`);
const sql = require('sql');
sql.setDialect('postgres');
const TipoLegajo = require('../tipos/TipoLegajo')
const LegajoItem = require('./LegajoItem')
const LegajoComitente = require('./LegajoComitente')
const Item = require('./Item')
const Domicilio = require(`../Domicilio`);
const Boleta = require(`../cobranzas/Boleta`);
const Persona = require(`../Persona`);
const PersonaFisica = require(`../PersonaFisica`);
const PersonaJuridica = require(`../PersonaJuridica`);
const utils = require(`../../utils`);


const table = sql.define({
    name: 'legajo',
    columns: [{
            name: 'id',
            dataType: 'serial',
            primaryKey: true
        },
        {
            name: 'solicitud',
            dataType: 'int'
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
            name: 'domicilio',
            dataType: 'int',
        },
        {
            name: 'nomenclatura',
            dataType: 'varchar(255)',
        },
        {
            name: 'estado',
            dataType: 'int',
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
            name: 'aporte_neto_bonificacion',
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
            dataType: 'int',
        },
        {
            name: 'created_by',
            dataType: 'int',
        },
        {
            name: 'updated_by',
            dataType: 'int',
        },
        {
          name: 'created_at',
          dataType: 'timestamptz',
          defaultValue: 'now'
        },
        {
          name: 'updated_at',
          dataType: 'timestamptz',
          defaultValue: 'now'
        }        
    ],

    foreignKeys: [
        {
            table: 'matricula',
            columns: ['matricula'],
            refColumns: ['id'],
            onDelete: 'cascade'
        },
        {
            table: 't_legajo',
            columns: ['tipo'],
            refColumns: ['id']
        },
        {
            table: 'delegacion',
            columns: ['delegacion'],
            refColumns: ['id']
        },
        {
            table: 'tarea_subcategoria',
            columns: ['subcategoria'],
            refColumns: ['id']
        },
        {
            table: 't_incumbencia',
            columns: ['incumbencia'],
            refColumns: ['id']
        },
        {
            table: 'domicilio',
            columns: ['domicilio'],
            refColumns: ['id']
        },
        {
            table: 'usuario',
            columns: ['created_by'],
            refColumns: ['id'],
            onUpdate: 'CASCADE'
        },
        {
            table: 'usuario',
            columns: ['updated_by'],
            refColumns: ['id'],
            onUpdate: 'CASCADE'
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


const select = [
    table.id,
    table.solicitud,
    table.numero_legajo,
    TipoLegajo.table.id.as('tipo.id'),
    TipoLegajo.table.valor.as('tipo.valor'),
    table.matricula,
    table.fecha_solicitud.cast('varchar(10)'),
    table.domicilio,
    table.nomenclatura,
    table.estado,
    table.subcategoria,
    table.incumbencia,
    table.honorarios_presupuestados,
    table.forma_pago,
    table.plazo_cumplimiento.cast('varchar(10)'),
    table.honorarios_reales,
    table.porcentaje_cumplimiento,
    table.finalizacion_tarea.cast('varchar(10)'),
    table.tarea_publica,
    table.dependencia,
    table.aporte_bruto,
    table.aporte_neto,
    table.aporte_neto_bonificacion,
    table.cantidad_planos,
    table.observaciones,
    table.observaciones_internas,
    table.informacion_adicional,
    table.evaluador,
    table.delegacion,
    table.numero_acta,
    table.operador_carga,
    table.operador_aprobacion,
    table.created_by,
    table.updated_by
]

const from = table.join(TipoLegajo.table).on(table.tipo.equals(TipoLegajo.table.id))
.join(LegajoComitente.table).on(table.id.equals(LegajoComitente.table.legajo))
.join(Persona.table).on(LegajoComitente.table.persona.equals(Persona.table.id))
.leftJoin(PersonaFisica.table).on(LegajoComitente.table.persona.equals(PersonaFisica.table.id))


module.exports.getAll = function (params) {
    let legajos = [];
    let query = table.select(select).distinctOn(table.id).from(from);

    if (params.matricula) query.where(table.matricula.equals(params.matricula));
    if (params.tipo) query.where(table.tipo.equals(params.tipo));
    
    if (params.numero) query.where(table.numero_legajo.cast('text').ilike(`%${params.numero}%`));
    if (params.nomenclatura) query.where(table.nomenclatura.ilike(`%${params.nomenclatura}%`));
    
    if (params.comitente) {
        if (params.comitente.nombre) query.where(Persona.table.nombre.ilike(`%${params.comitente.nombre}%`));
        if (params.comitente.cuit) query.where(Persona.table.cuit.like(`%${params.comitente.cuit}%`));
        if (params.comitente.apellido) query.where(PersonaFisica.table.apellido.ilike(`%${params.comitente.apellido}%`));
        if (params.comitente.dni) query.where(PersonaFisica.table.dni.ilike(`%${params.comitente.dni}%`));
    }

    if (params.sort) {
        if (params.sort.fecha) query.order(table.fecha_solicitud[params.sort.fecha]);
        if (params.sort.tipo) query.order(TipoLegajo.table.valor[params.sort.tipo]);
        if (params.sort.numero) query.order(table.numero[params.sort.numero]);
        if (params.sort.nomenclatura) query.order(table.nomenclatura[params.sort.nomenclatura]);
    }

    if (params.limit) query.limit(+params.limit);
    if (params.limit && params.offset) query.offset(+params.offset);

    return connector.execQuery(query.toQuery())
        .then(r => {
            legajos = r.rows.map(row => dot.object(row));
            return Promise.all([
                Promise.all(r.rows.map(legajo => LegajoComitente.getByLegajo(legajo.id))),
                Promise.all(r.rows.map(legajo => getItems(legajo.id)))
            ]);
        })
        .then(([comitentes, items]) => {
            legajos.forEach((legajo, i) => {
                legajo.comitentes = comitentes[i];
                legajo.items = items[i];
            });
            return legajos;
        })
}

module.exports.get = function (id) {
    let legajo;
    let query = table.select(select)
    .from(from)
    .where(table.id.equals(id));

    return connector.execQuery(query.toQuery())
    .then(r => {
        if (r.rows.length == 0) 
            return Promise.reject({ code: 404, message: "No existe el recurso" });
        legajo = dot.object(r.rows[0]);
        return Promise.all([
            getItems(legajo.id),
            LegajoComitente.getByLegajo(legajo.id),
            Domicilio.get(legajo.domicilio)
        ])
    })
    .then(([items, comitentes, domicilio]) => {
        legajo.items = items;
        legajo.comitentes = comitentes;
        legajo.domicilio = domicilio;
        return legajo;
    })
}


function getNumeroLegajo(numero_legajo) {
    if (!numero_legajo) {
        let query = table.select(table.numero_legajo.max().as('numero'))
            .where(table.fecha_solicitud.gt(moment('2017-01-01', 'YYYY-MM-DD')))
            .toQuery();
        return connector.execQuery(query)
            .then(r => r.rows[0].numero + 1);
    } else return Promise.resolve(numero_legajo);
}


function addLegajo(legajo, client) {
    return getNumeroLegajo(legajo.numero_legajo)
        .then(numero_legajo => {
            let query = table.insert(
                    table.created_by.value(legajo.operador),
                    table.updated_by.value(legajo.operador),
                    table.matricula.value(legajo.matricula),
                    table.aporte_bruto.value(utils.getFloat(legajo.aporte_bruto)),
                    table.aporte_neto.value(utils.getFloat(legajo.aporte_neto)),
                    table.aporte_neto_bonificacion.value(utils.getFloat(legajo.aporte_neto_bonificacion)),
                    table.cantidad_planos.value(utils.checkNull(legajo.cantidad_planos)),
                    table.domicilio.value(legajo.domicilio),
                    table.delegacion.value(legajo.delegacion),
                    table.dependencia.value(legajo.dependencia),
                    table.estado.value(1), // 1 ES ESTADO PENDIENTE
                    table.fecha_solicitud.value(utils.checkNull(legajo.fecha_solicitud)),
                    table.finalizacion_tarea.value(utils.checkNull(legajo.finalizacion_tarea)),
                    table.forma_pago.value(legajo.forma_pago),
                    table.honorarios_presupuestados.value(utils.getFloat(legajo.honorarios_presupuestados)),
                    table.honorarios_reales.value(utils.getFloat(legajo.honorarios_reales)),
                    table.informacion_adicional.value(legajo.informacion_adicional),
                    table.nomenclatura.value(legajo.nomenclatura),
                    table.numero_legajo.value(numero_legajo),
                    table.solicitud.value(numero_legajo),
                    table.observaciones.value(legajo.observaciones),
                    table.plazo_cumplimiento.value(utils.checkNull(legajo.plazo_cumplimiento)),
                    table.porcentaje_cumplimiento.value(utils.getFloat(legajo.porcentaje_cumplimiento)),
                    table.subcategoria.value(legajo.subcategoria),
                    table.tarea_publica.value(legajo.tarea_publica),
                    table.tipo.value(legajo.tipo)
                )
                .returning(table.id, table.numero_legajo, table.fecha_solicitud,
                    table.estado, table.tipo)
                .toQuery()

            return connector.execQuery(query, client)
                .then(r => r.rows[0]);
        })
}

function addBoleta(legajo) {
    if (legajo.tipo != 3) return Promise.resolve();

    let boleta = {
        delegacion: legajo.delegacion,
        matricula: legajo.matricula,
        tipo_comprobante: 20,    //TIPO DE COMPROBANTE LEG
        fecha: legajo.fecha_solicitud,
        total: legajo.aporte_neto,
        estado: 1,
        fecha_vencimiento: moment(legajo.fecha_solicitud, 'DD/MM/YYYY').add(15, 'days'),
        numero_solicitud: legajo.id,
        fecha_update: moment(),
        items: [{
            item: 1,
            descripcion: `Aportes profesional N° Legajo: ${legajo.numero_legajo}`,
            importe: legajo.aporte_neto
        }]
    }

    return Boleta.add(boleta);
}

module.exports.add = function (legajo) {
    let legajo_nuevo;
    let personas;
    let connection;

    return connector
        .beginTransaction()
        .then(con => {
            connection = con;
            if (legajo.domicilio.localidad && legajo.domicilio.direccion.length) {
                return Domicilio.add(legajo.domicilio, connection.client)
            }
            else return Promise.resolve(null)
        })
        .then(domicilio_nuevo => {
            legajo.domicilio = domicilio_nuevo ? domicilio_nuevo.id : null;
            let proms = legajo.comitentes.map(c => {
                if (!c.persona.id) return Persona.add(c.persona, connection.client);
                else return Promise.resolve(c.persona);
            })
            return Promise.all(proms);
        })
        .then(comitentes => {
            personas = comitentes;
            return addLegajo(legajo, connection.client);
        })
        .then(legajo_added => {
            legajo_nuevo = legajo_added;
            let proms_comitentes = legajo.comitentes.map((comitente, index) => {
                comitente.legajo = legajo_nuevo.id;
                comitente.persona = personas[index].id;
                return LegajoComitente.add(comitente, connection.client);
            })
            return Promise.all(proms_comitentes);
        })
        .then(comitentes => {
            let proms_items = legajo.items.map(item => {
                item.legajo = legajo_nuevo.id;
                return LegajoItem.add(item, connection.client);
            })
            return Promise.all(proms_items);
        })
        .then(items => {
            legajo.id = legajo_nuevo.id;
            legajo.numero_legajo = legajo_nuevo.numero_legajo;
            legajo_nuevo.items = items;
            return addBoleta(legajo);
        })
        .then(r => {
            return connector.commit(connection.client)
                .then(r => {
                    connection.done();
                    return legajo_nuevo;
                });
        })
        .catch(e => {
            console.log(e);
            connector.rollback(connection.client);
            connection.done();
            throw Error(e);
        });
}

module.exports.patch = function (id, legajo, client) {
    legajo.updated_at = new Date();

    let query = table.update(legajo)
        .where(table.id.equals(id))
        .toQuery();

    return connector.execQuery(query, client);
}