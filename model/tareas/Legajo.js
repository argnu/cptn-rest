const moment = require('moment');
const connector = require(`${__base}/connector`);
const sql = require('sql');
sql.setDialect('postgres');
const LegajoItem = require('./LegajoItem')
const LegajoComitente = require('./LegajoComitente')
const Item = require('./Item')
const Domicilio = require(`${__base}/model/Domicilio`);
const Boleta = require(`${__base}/model/cobranzas/Boleta`);
const Persona = require(`${__base}/model/Persona`);
const utils = require(`${__base}/utils`);


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
            dataType: 'int',
        },
        {
            name: 'created_by',
            dataType: 'varchar(45)',
        },
        {
            name: 'updated_by',
            dataType: 'varchar(45)',
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
            refColumns: ['id']
        },
        {
            table: 'usuario',
            columns: ['updated_by'],
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


module.exports.getAll = function (params) {
    let legajos = [];
    let query = table.select(table.star()).from(table);
    query.where(table.tipo.notEquals(0)); // EVITAR LOS ANULADOS
    if (params.matricula) query.where(table.matricula.equals(params.matricula));

    if (params.limit) query.limit(+params.limit);
    if (params.limit && params.offset) query.offset(+params.offset);

    return connector.execQuery(query.toQuery())
        .then(r => {
            legajos = r.rows;
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
    let legajos;
    let query = table.select(table.star())
        .from(table)
        .where(table.id.equals(id));

    return connector.execQuery(query.toQuery())
        .then(r => {
            legajo = r.rows[0];
            return Promise.all([
                getItems(legajo.id),
                LegajoComitente.getByLegajo(legajo.id),
                Domicilio.getDomicilio(legajo.domicilio)
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
                    table.aporte_bruto.value(utils.checkNull(legajo.aporte_bruto)),
                    table.aporte_neto.value(legajo.aporte_neto),
                    table.aporte_neto_bonificacion.value(legajo.aporte_neto_bonificacion),
                    table.cantidad_planos.value(utils.checkNull(legajo.cantidad_planos)),
                    table.domicilio.value(legajo.domicilio),
                    table.delegacion.value(legajo.delegacion),
                    table.dependencia.value(legajo.dependencia),
                    table.estado.value(1), // 1 ES ESTADO PENDIENTE
                    table.fecha_solicitud.value(utils.checkNull(legajo.fecha_solicitud)),
                    table.finalizacion_tarea.value(utils.checkNull(legajo.finalizacion_tarea)),
                    table.forma_pago.value(legajo.forma_pago),
                    table.honorarios_presupuestados.value(utils.checkNull(legajo.honorarios_presupuestados)),
                    table.honorarios_reales.value(utils.checkNull(legajo.honorarios_reales)),
                    table.informacion_adicional.value(legajo.informacion_adicional),
                    table.nomenclatura.value(legajo.nomenclatura),
                    table.numero_legajo.value(numero_legajo),
                    table.solicitud.value(numero_legajo),
                    table.observaciones.value(legajo.observaciones),
                    table.plazo_cumplimiento.value(utils.checkNull(legajo.plazo_cumplimiento)),
                    table.porcentaje_cumplimiento.value(utils.checkNull(legajo.porcentaje_cumplimiento)),
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
        tipo_comprobante: 15,
        fecha: legajo.fecha_solicitud,
        total: legajo.aporte_neto,
        estado: 1,
        fecha_vencimiento: moment(legajo.fecha_solicitud, 'DD/MM/YYYY').add(15, 'days'),
        numero_solicitud: legajo.id,
        fecha_update: moment(),
        items: [{
            item: 1,
            descripcion: `Aportes profesional N° Legajo: ${legajo.numero_legajo} Comitente: ${legajo.comitente.apellido}, ${legajo.comitente.nombres}`,
            importe: legajo.aporte_neto
        }]
    }

    return Boleta.add(boleta);
}

module.exports.add = function (legajo) {
    let legajo_nuevo;
    let personas;

    return connector
        .beginTransaction()
        .then(connection => {
            return Domicilio.addDomicilio(legajo.domicilio, connection.client)
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
                    connector.rollback(connection.client);
                    connection.done();
                    throw Error(e);
                });
        });
}

module.exports.patch = function (id, legajo, client) {
    let query = table.update(legajo)
        .where(table.id.equals(id))
        .toQuery();

    return connector.execQuery(query, client);
}