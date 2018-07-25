const dot = require('dot-object');
const moment = require('moment');
const utils = require('../utils');
const connector = require('../db/connector');
const sql = require('sql');
sql.setDialect('postgres');

const Entidad = require('./Entidad');
const Solicitud = require('./Solicitud');
const Profesional = require('./profesional/Profesional');
const ProfesionalTitulo = require('./profesional/ProfesionalTitulo');
const Empresa = require('./empresa/Empresa');
const TipoEstadoMatricula = require('./tipos/TipoEstadoMatricula');
const TipoMatricula = require('./tipos/TipoMatricula');
const Boleta = require('./cobranzas/Boleta');
const ValoresGlobales = require('./ValoresGlobales');
const MatriculaHistorial = require('./MatriculaHistorial');
const Documento = require('./Documento');

const table = sql.define({
  name: 'matricula',
  columns: [{
      name: 'id',
      dataType: 'serial',
      primaryKey: true
    },
    {
      name: 'legajo',
      dataType: 'int',
    },
    {
      name: 'numeroMatricula',
      dataType: 'varchar(20)'
    },
    {
      name: 'numeroMatriculaCPAGIN',
      dataType: 'varchar(20)'
    },
    {
      name: 'entidad',
      dataType: 'int',
      notNull: true
    },
    {
      name: 'solicitud',
      dataType: 'int'
    },
    {
      name: 'fechaResolucion',
      dataType: 'date'
    },
    {
      name: 'numeroActa',
      dataType: 'varchar(50)'
    },
    {
      name: 'fechaBaja',
      dataType: 'date'
    },
    {
      name: 'observaciones',
      dataType: 'text'
    },
    {
      name: 'notasPrivadas',
      dataType: 'text'
    },
    {
      name: 'asientoBajaF',
      dataType: 'varchar(2)'
    },
    {
      name: 'codBajaF',
      dataType: 'varchar(20)'
    },
    {
      name: 'estado',
      dataType: 'int',
      notNull: true
    },
    {
      name: 'idMigracion',
      dataType: 'int'
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
      defaultValue: 'current_date'
    },
    {
      name: 'updated_at',
      dataType: 'timestamptz',
      defaultValue: 'current_date'
    },
    {
      name: 'eliminado',
      dataType: 'boolean',
      defaultValue: false
    }
  ],

  foreignKeys: [{
      table: 'entidad',
      columns: ['entidad'],
      refColumns: ['id']
    },
    {
      table: 'solicitud',
      columns: ['solicitud'],
      refColumns: ['id']
    },
    {
      table: 't_estadomatricula',
      columns: ['estado'],
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

function addMatriculaMigracion(matricula, client) {
  let query = table.insert(
    table.legajo.value(matricula.legajo),
    table.idMigracion.value(matricula.idMigracion),
    table.entidad.value(matricula.entidad),
    table.solicitud.value(matricula.solicitud),
    table.fechaResolucion.value(utils.checkNull(matricula.fechaResolucion)),
    table.numeroActa.value(matricula.numeroActa),
    table.numeroMatricula.value(matricula.numeroMatricula),
    table.fechaBaja.value(utils.checkNull(matricula.fechaBaja)),
    table.observaciones.value(matricula.observaciones),
    table.notasPrivadas.value(matricula.notasPrivadas),
    table.asientoBajaF.value(matricula.asientoBajaF),
    table.codBajaF.value(matricula.codBajaF),
    table.estado.value(matricula.estado)
  ).returning(table.id).toQuery()

  return connector.execQuery(query, client)
    .then(r => r.rows[0]);
}

module.exports.addMatriculaMigracion = addMatriculaMigracion;


function addMatricula(matricula, client) {
  let query = table.insert(
    table.created_by.value(matricula.operador),
    table.updated_by.value(matricula.operador),
    table.entidad.value(matricula.entidad),
    table.solicitud.value(matricula.solicitud),
    table.numeroMatricula.value(matricula.numeroMatricula),
    table.estado.value(matricula.estado),
    table.eliminado.value(false)
  )
  .returning(table.id, table.entidad, table.numeroMatricula, table.solicitud)
  .toQuery()

  return connector.execQuery(query, client)
    .then(r => r.rows[0]);
}

function existMatricula(solicitud) {
  let query = table.select(
    table.id
  )
  .where(table.solicitud.equals(solicitud).and(table.eliminado.equals(false)))
  .toQuery();

  return connector.execQuery(query)
  .then(r => r.rows.length != 0);
}


// NO SE SI CUATRO NUMS O CINCO
function completarConCeros(numero) {
    let result = numero.toString();
    let ceros = '0'.repeat(5 - result.length);
    return ceros + result;
}

function addBoletaInscripcion(id, fecha, delegacion, client) {
  //Obtengo el valor válido para el importe de matriculación(id=1) en la fecha correspondiente
  return ValoresGlobales.getValida(1, fecha)
  .then(importe => {
    let boleta = {
      matricula: id,
      tipo_comprobante: 18,  //18 ES PRI
      fecha: fecha,
      total: importe.valor,
      estado: 1,   //1 ES 'Pendiente de Pago'
      fecha_vencimiento: moment(fecha, 'DD/MM/YYYY').add(15, 'days'),
      fecha_update: fecha,
      delegacion: delegacion,
      items: [{
        item: 1,
        descripcion: `Derecho de inscripción profesional`,
        importe: importe
      }]
    }

    return Boleta.add(boleta, client);
  })
}


function addBoletasMensuales(id, delegacion, client) {
  //Obtengo el valor válido de derecho_anual (id=5) para la fecha actual
  //y el número de la próxima boleta
  return Promise.all([
    ValoresGlobales.getValida(5, new Date()),
    Boleta.getNumeroBoleta(null, client)
  ])
  .then(([importe_anual, numero_boleta]) => {
    let importe = importe_anual.valor / 12;
    let anio_actual = new Date().getFullYear();
    let mes_inicio = new Date().getMonth() + 1;
    let fecha_inicio = mes_inicio === 12 ? new Date(anio_actual + 1, 0, 1) : new Date(anio_actual, mes_inicio, 1);

    let promesas_boletas = [];

    for(let mes_inicio = fecha_inicio.getMonth(); mes_inicio < 12; mes_inicio++) {
      let fecha_primero_mes = new Date(anio_actual, mes_inicio, 1);
      let fecha_vencimiento = new Date(anio_actual, mes_inicio, 10);

      //SI EL VENCIMIENTO CAE SABADO O DOMINGO SE PASA AL LUNES
      if (fecha_vencimiento.getDay() === 0)
        fecha_vencimiento = moment(fecha_vencimiento).add(1, 'days');
      else if (fecha_vencimiento.getDay() === 6)
        fecha_vencimiento = moment(fecha_vencimiento).add(2, 'days');

      let boleta = {
        numero: numero_boleta,
        matricula: id,
        tipo_comprobante: 16,  //16 ES PRA
        fecha: fecha_primero_mes,
        total: importe,
        estado: 1,   //1 ES 'Pendiente de Pago'
        fecha_vencimiento: fecha_vencimiento,
        fecha_update: new Date(),
        delegacion: delegacion,
        items: [{
          item: 1,
          descripcion: `Derecho anual profesionales ${utils.getNombreMes(mes_inicio+1)} ${anio_actual}`,
          importe: importe
        }]
      }

      numero_boleta++;
      promesas_boletas.push(Boleta.add(boleta, client));
    }

    return Promise.all(promesas_boletas);
  })
}

function getDocumento(documento, client) {
  if (typeof document == 'number') return Promise.resolve({id: documento});
  return Documento.getAll(documento)
  .then(docs => {
    if (docs.length > 0) return Promise.resolve(docs[0]);
    else return Documento.add(documento, client);
  })
}

function getTipoMatricula(id_profesional) {
  return ProfesionalTitulo.getByProfesional(id_profesional)
  .then(p_titulos => Promise.all(p_titulos.map(t => TipoMatricula.get(t.titulo.tipo_matricula))))
  .then(tipos_mat => {
    tipos_mat.sort((a,b) => b.jerarquia_titulo - a.jerarquia_titulo);
    return tipos_mat[0].valor;
  });
}

// tipo_provisorio hasta que se determine automáticamente una vez validados los titulos
function getNumeroMatricula(tipo) {
  let query = `
    select max( NULLIF(regexp_replace("numeroMatricula", '\\D','','g'), '')::numeric ) as num
    from matricula
    where "numeroMatricula" LIKE '${tipo}%' AND length(regexp_replace("numeroMatricula", '\\D','','g'))=5`

  return connector.execRawQuery(query)
  .then(r => {
    let numero = r.rows[0] ? +r.rows[0].num + 1 : 1;
    return tipo + completarConCeros(numero);
  });
}

module.exports.getNumeroMatricula = getNumeroMatricula;

module.exports.aprobar = function(matricula) {
  let solicitud, matricula_added, connection;

  return existMatricula(matricula.solicitud)
  .then(exist => {
      if (!exist) {
        return Solicitud.get(matricula.solicitud)
        .then(solicitud_get => {
          solicitud = solicitud_get;
          let tipo_matricula = solicitud.tipoEntidad == 'empresa' ? 'EMP' : matricula.tipo;
          return getNumeroMatricula(tipo_matricula);
        })
        .then(numero_mat => {
          return connector.beginTransaction()
          .then(con => {
            connection = con;
            matricula.solicitud = solicitud.id;
            matricula.entidad = solicitud.entidad.id;
            matricula.estado = matricula.generar_boleta ? 12 : 13; // 12 es 'Pendiente de Pago', 13 es 'Habilitada'
            matricula.numeroMatricula = numero_mat;
            return Solicitud.patch(solicitud.id, { estado: 2 }, connection.client)  // 2 es 'Aprobada'
          })
          .then(r => addMatricula(matricula, connection.client))
          .then(r => {
            matricula_added = r;
            if (matricula.generar_boleta) {
              return addBoletaInscripcion(
                matricula_added.id,
                matricula.documento.fecha,
                matricula.delegacion,
                connection.client
              );
            }
            else return Promise.resolve(false);
          })
          .then(r => addBoletasMensuales(matricula_added.id, matricula.delegacion, connection.client))
          .then(r => getDocumento(matricula.documento, connection.client))
          .then(documento => MatriculaHistorial.add({
              matricula: matricula_added.id,
              documento: documento.id,
              estado: matricula.generar_boleta ? 12 : 13, // 12 es 'Pendiente de Pago', 13 es 'Habilitada'
              fecha: new Date(),
              usuario: matricula.operador
            }, connection.client)
          )
          .then(r => {
            return connector.commit(connection.client)
              .then(r => {
                connection.done();
                return matricula_added;
              })
          })
          .catch(e => {
            console.error(e)
            connector.rollback(connection.client);
            connection.done();
            return Promise.reject(e);
          });
        })
      }
      else return Promise.reject({ code: 409, message: "Ya existe una matrícula para dicha solicitud" });
  })
}

module.exports.cambiarEstado = function(nuevo_estado) {
  let connection;

  return connector.beginTransaction()
  .then(conx => {
    connection = conx;

    return getDocumento(nuevo_estado.documento, connection.client)
    .then(documento =>
      MatriculaHistorial.add({
        matricula: nuevo_estado.matricula,
        documento: documento.id,
        estado: nuevo_estado.estado,
        fecha: new Date(),
        usuario: nuevo_estado.operador
      }, connection.client)
    )
    .then(historial => {
      let query = table.update({
        estado: nuevo_estado.estado,
        updated_by: nuevo_estado.operador,
        updated_at: new Date()
      })
      .where(table.id.equals(nuevo_estado.matricula))
      .returning(table.id, table.estado)
      .toQuery();

      return connector.execQuery(query, connection.client)
      .then(r => r.rows[0]);
    })
    .then(matricula => {
      return connector.commit(connection.client)
        .then(r => {
          connection.done();
          return matricula;
        })
    })
    .catch(e => {
      connector.rollback(connection.client);
      connection.done();
      throw Error(e);
    });
  })
}

function filter(query, params) {
  if (params.entidad && !isNaN(+params.entidad)) query.where(table.entidad.equals(params.entidad));
  if (params.entidad.tipo) query.where(Entidad.table.tipo.equals(params.entidad.tipo));
  if (params.estado && !isNaN(+params.estado)) query.where(table.estado.equals(params.estado));

  if (params.filtros) {
    if (params.filtros.numeroMatricula) query.where(table.numeroMatricula.ilike(`%${params.filtros.numeroMatricula}%`));
    if (params.filtros['profesional.apellido']) query.where(Profesional.table.apellido.ilike(`%${params.filtros['profesional.apellido']}%`));
    if (params.filtros['profesional.dni']) query.where(Profesional.table.dni.ilike(`%${params.filtros['profesional.dni']}%`));
    if (params.filtros['empresa.nombre']) query.where(Empresa.table.nombre.ilike(`%${params.filtros['empresa.nombre']}%`));
    if (params.filtros['entidad.cuit']) query.where(Entidad.table.cuit.ilike(`%${params.filtros['entidad.cuit']}%`));
  }
}

module.exports.getAll = function (params) {
  let matriculas = [];
  let query = table.select([
    table.id,
    table.legajo,
    table.numeroMatricula,
    table.fechaResolucion.cast('varchar(10)'),
    table.numeroActa,
    table.entidad,
    Solicitud.table.numero.as('numero_solicitud'),
    table.fechaBaja.cast('varchar(10)'),
    table.observaciones,
    table.notasPrivadas,
    table.asientoBajaF,
    table.codBajaF,
    TipoEstadoMatricula.table.id.as('estado.id'),
    TipoEstadoMatricula.table.valor.as('estado.valor'),
    Entidad.table.tipo.as('tipoEntidad'),
    table.idMigracion
  ])
  .from(
    table.join(TipoEstadoMatricula.table).on(table.estado.equals(TipoEstadoMatricula.table.id))
    .join(Entidad.table).on(table.entidad.equals(Entidad.table.id))
    .leftJoin(Profesional.table).on(table.entidad.equals(Profesional.table.id))
    .leftJoin(Empresa.table).on(table.entidad.equals(Empresa.table.id))
    .leftJoin(Solicitud.table).on(table.solicitud.equals(Solicitud.table.id))
  )
  .where(table.eliminado.equals(false));

  filter(query, params);

  if (params.sort) {
    if (params.sort.numeroMatricula) query.order(table.numeroMatricula[params.sort.numeroMatricula]);
    else if (params.sort.estado) query.order(table.estado[params.sort.estado]);
    else if (params.sort.nombreEmpresa) query.order(Empresa.table.nombre[params.sort.nombreEmpresa]);
    else if (params.sort.nombre) query.order(Profesional.table.nombre[params.sort.nombre]);
    else if (params.sort.apellido) query.order(Profesional.table.apellido[params.sort.apellido]);
    else if (params.sort.dni) query.order(Profesional.table.dni[params.sort.dni]);
    else if (params.sort.cuit) query.order(Entidad.table.cuit[params.sort.cuit]);
  }

  if (params.limit) query.limit(+params.limit);
  if (params.limit && params.offset) query.offset(+params.offset);

  return connector.execQuery(query.toQuery())
  .then(r => {
    matriculas = r.rows.map(row => dot.object(row));
    let proms = matriculas.map(m => {
      if (m.tipoEntidad == 'profesional') return Profesional.get(m.entidad)
      else if (m.tipoEntidad == 'empresa') return Empresa.get(m.entidad);
    });

    return Promise.all(proms)
    .then(rs => {
      rs.forEach((r, i) => {
        matriculas[i].entidad = r;
        delete(matriculas[i].tipoEntidad);
      });

      return utils.getTotalQuery(
        table,
        table.join(TipoEstadoMatricula.table).on(table.estado.equals(TipoEstadoMatricula.table.id))
        .join(Entidad.table).on(table.entidad.equals(Entidad.table.id))
        .leftJoin(Profesional.table).on(table.entidad.equals(Profesional.table.id))
        .leftJoin(Empresa.table).on(table.entidad.equals(Empresa.table.id))
        .leftJoin(Solicitud.table).on(table.solicitud.equals(Solicitud.table.id)),
        (query) => {
          filter(query, params);
        })
      .then(totalQuery => ({ totalQuery, resultados: matriculas }))
    })
  })
}

module.exports.get = function (id) {
  let query = table.select([
    table.id,
    table.legajo,
    table.numeroMatricula,
    table.fechaResolucion.cast('varchar(10)'),
    table.numeroActa,
    table.entidad,
    Solicitud.table.numero.as('numero_solicitud'),
    table.fechaBaja.cast('varchar(10)'),
    table.observaciones,
    table.notasPrivadas,
    table.asientoBajaF,
    table.codBajaF,
    TipoEstadoMatricula.table.id.as('estado.id'),
    TipoEstadoMatricula.table.valor.as('estado.valor'),
    Entidad.table.tipo.as('tipoEntidad'),
    table.idMigracion
  ])
                    .from(
                      table.join(TipoEstadoMatricula.table).on(table.estado.equals(TipoEstadoMatricula.table.id))
                      .join(Entidad.table).on(table.entidad.equals(Entidad.table.id))
                      .leftJoin(Profesional.table).on(table.entidad.equals(Profesional.table.id))
                      .leftJoin(Empresa.table).on(table.entidad.equals(Empresa.table.id))
                      .leftJoin(Solicitud.table).on(table.solicitud.equals(Solicitud.table.id))
                    )
                    .where(table.id.equals(id))
                    .toQuery();

  return connector.execQuery(query)
    .then(r => {
      matricula = dot.object(r.rows[0]);
      if (!matricula) throw ({ code: 404, message: "No existe el recurso solicitado" });
      if (matricula.tipoEntidad == 'profesional') return Profesional.get(matricula.entidad)
      else if (matricula.tipoEntidad == 'empresa') return Empresa.get(matricula.entidad);
    })
    .then(r => {
      matricula.entidad = r;
      delete(matricula.tipoEntidad);
      return matricula;
    })
}

module.exports.getMigracion = function (id, empresa) {
  let query = table.select(table.star())
    .from(table.join(Entidad.table).on(table.entidad.equals(Entidad.table.id)))
    .where(
      table.idMigracion.equals(id)
      .and(Entidad.table.tipo.equals(empresa ? 'empresa' : 'profesional'))
    )
    .toQuery();

  return connector.execQuery(query)
    .then(r => {
      if (r.rows.length > 1) {
        if (r.rows[0].numeroMatricula.length > r.rows[1].numeroMatricula.length)
          return r.rows[0];
        else
          return r.rows[1];
      }
      else return r.rows[0];
    });
}

module.exports.patch = function (id, matricula, client) {
  matricula.updated_at = new Date();

  let query = table.update(matricula)
    .where(table.id.equals(id))
    .toQuery();

  return connector.execQuery(query, client);
}