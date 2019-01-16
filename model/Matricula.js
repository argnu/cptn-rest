const dot = require('dot-object');
const moment = require('moment');
const utils = require('../utils');
const connector = require('../db/connector');
const sql = require('node-sql-2');
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
const ComprobanteExencion = require('./cobranzas/ComprobanteExencion');

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
  )
  .returning(table.id).toQuery()

  return connector.execQuery(query, client)
    .then(r => r.rows[0]);
}

module.exports.addMatriculaMigracion = addMatriculaMigracion;


function addMatricula(matricula, client) {
  let query = table.insert(
    table.created_by.value(matricula.created_by),
    table.updated_by.value(matricula.created_by),
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

function getTipoDom(domicilios) {
  let tipo = 'otras';
  for(let domicilio of domicilios) {
    let provincia = domicilio.domicilio.provincia.id;
    if (provincia === 14) return 'neuquen';
    else if (provincia === 7 || provincia === 8 || provincia === 23) tipo = 'limitrofes';
  }
  return tipo;
}

function getImporteInscripcion(id_matricula, fecha, client) {
  return module.exports.get(id_matricula, client)
  .then(matricula => {
    let id_var;
    if (matricula.tipoEntidad == 'profesional') id_var = 1;
    else {
      let tipo_dom = getTipoDom(matricula.entidad.domicilios);
      if (tipo_dom == 'neuquen') id_var = 7;
      else if (tipo_dom == 'limitrofes') id_var = 8;
      else id_var = 9;
    }

    return ValoresGlobales.getValida(id_var, fecha);
  })
}

module.exports.getDerechoAnual = function(id_matricula, fecha, client) {
  return module.exports.get(id_matricula, client)
  .then(r => {
    let id_var;
    if (r.tipoEntidad == 'profesional') id_var = 5;
    else {
      let tipo_dom = getTipoDom(matricula.entidad.domicilios);
      if (tipo_dom == 'neuquen') id_var = 10;
      else if (tipo_dom == 'limitrofes') id_var = 11;
      else id_var = 12;
    }

    return ValoresGlobales.getValida(id_var, fecha);
  })
}

function addBoletaInscripcion(id, tipoEntidad, documento, delegacion, client) {
  let fecha = new Date();

  //Obtengo el valor válido para el importe de matriculación(id=1) en la fecha correspondiente
  return Promise.all([
    getImporteInscripcion(id, fecha, client),
    ValoresGlobales.getValida(6, fecha),
  ])
  .then(valores => {
    let importe = valores[0].valor;
    let dias_vencimiento = valores[1].valor;

    let boleta = {
      matricula: id,
      tipo_comprobante: tipoEntidad == 'profesional' ? 18 : 3, //18 es PRI, 3 es EMI
      fecha: fecha,
      total: importe,
      estado: 1,   //1 ES 'Pendiente de Pago'
      fecha_vencimiento: moment(fecha, 'DD/MM/YYYY').add(dias_vencimiento, 'days'),
      delegacion: delegacion,
      items: [{
        item: 1,
        descripcion: `Derecho de inscripción de ${tipoEntidad == 'profesional' ? 'profesional' : 'empresa'}`,
        importe: importe
      }]
    }

    return Boleta.add(boleta, client);
  })
}


function addBoletasMensuales(id, tipoEntidad, delegacion, client) {
  function* itBoleta(boletas) {
    for(let b of boletas) yield Boleta.add(b, client);
  }

  //Obtengo el valor válido de derecho_anual (id=5) para la fecha actual
  //y el número de la próxima boleta
  return Promise.all([
    module.exports.getDerechoAnual(id, new Date(), client),
    ValoresGlobales.getValida(6, new Date())
  ])
  .then(([importe_anual, dias_vencimiento]) => {
    let importe = importe_anual.valor / 12;
    let anio_actual = new Date().getFullYear();

    let boletas_creadas = [];
    let primera_boleta = true;


    for(let mes_inicio = new Date().getMonth(); mes_inicio < 12; mes_inicio++) {
      let fecha_primero_mes = primera_boleta ? new Date() : new Date(anio_actual, mes_inicio, 1);
      let fecha_vencimiento = moment(fecha_primero_mes).add(dias_vencimiento.valor, 'days');
      primera_boleta = false;

      //SI EL VENCIMIENTO CAE SABADO O DOMINGO SE PASA AL LUNES
      if (fecha_vencimiento.day() === 0)
        fecha_vencimiento = fecha_vencimiento.add(1, 'days');
      else if (fecha_vencimiento.day() === 6)
        fecha_vencimiento = fecha_vencimiento.add(2, 'days');

      let boleta = {
        matricula: id,
        tipo_comprobante: tipoEntidad == 'profesional' ? 16 : 10,  //16 ES PRA, 10 EMD
        fecha: fecha_primero_mes,
        total: importe,
        estado: 1,   //1 ES 'Pendiente de Pago'
        fecha_vencimiento: fecha_vencimiento.format('YYYY-MM-DD'),
        fecha_update: new Date(),
        delegacion: delegacion,
        items: [{
          item: 1,
          descripcion: `Derecho anual ${tipoEntidad == 'profesional' ? 'profesionales' : 'empresas'} ${utils.getNombreMes(mes_inicio+1)} ${anio_actual}`,
          importe: importe
        }]
      }

      boletas_creadas.push(boleta);
    }

    let it = itBoleta(boletas_creadas);

    function crearBoletas() {
      let p = it.next().value;
      if (p) return p.then(r => crearBoletas())
      else return Promise.resolve();
    }

    crearBoletas();
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
module.exports.getNumeroMatricula = function(tipo) {
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

function crearBonificaciones(matricula, client) {
  let anio = new Date().getFullYear();
  let mes = new Date().getMonth();
  let promesas_bonifs = [];

  for(let cantidad = 0; cantidad < 12; cantidad++) {
    let bonificacion = {
      fecha: new Date(anio, mes, 1),
      matricula: matricula.id,
      tipo: 21, //BONIFICACION DE APORTES
      descripcion: 'Jóvenes Profesionales',
      documento: 3284, //FALTA CARGAR EL ACTA 83
      created_by: matricula.created_by,
      delegacion: matricula.delegacion
    }

    promesas_bonifs.push(ComprobanteExencion.add(bonificacion, client));

    mes++;

    if (mes === 12) {
      mes = 0;
      anio++;
    }
  }

  return Promise.all(promesas_bonifs);
}

//Devuelve si es joven profesional
function esJovenProfesional(entidad, client) {
  return Profesional.get(entidad, client)
  .then(profesional => {
    let anios = moment().diff(profesional.fechaNacimiento, 'years');

    //Si no tiene menos de 25 años, no es jóven profesional
    if (anios >= 25) return false;

    let titulo_principal = profesional.formaciones.find(f => f.principal === true);

    //Si no tiene título principal o el mismo no tiene fecha de emisión, no se puede determinar
    //false por defecto
    if (!titulo_principal || !titulo_principal.fechaEmision) return false;

    let meses_dif = moment().diff(titulo_principal.fechaEmision, 'months');

    //Si es Nivel Secundario y hace menos de 24 meses
    if (titulo_principal.titulo.nivel.id === 1 && meses_dif < 24) return true;

    //Si es Técnico o Nivel Universitario y hace menos de 12 meses
    if (titulo_principal.titulo.nivel.id > 1
      && titulo_principal.titulo.nivel.id < 5
      && meses_dif < 12) return true;

    //Cualquier otro caso no es jóven profesional
    return false;
  })
}

module.exports.aprobar = function(matricula) {
  let solicitud, matricula_added, conexion;

  return existMatricula(matricula.solicitud)
  .then(exist => {
      if (!exist) {
        return Solicitud.get(matricula.solicitud)
        .then(solicitud_get => {
          solicitud = solicitud_get;
          let tipo_matricula = solicitud.tipoEntidad == 'empresa' ? 'EMP' : matricula.tipo;
          return module.exports.getNumeroMatricula(tipo_matricula);
        })
        .then(numero_mat => {
          return connector.beginTransaction()
          .then(con => {
            conexion = con;
            matricula.solicitud = solicitud.id;
            matricula.entidad = solicitud.entidad.id;
            matricula.estado = matricula.generar_boleta ? 12 : 13; // 12 es 'Pendiente de Pago', 13 es 'Habilitada'
            matricula.numeroMatricula = numero_mat;
            return Solicitud.patch(solicitud.id, { estado: 2 }, conexion.client)  // 2 es 'Aprobada'
          })
          .then(r => addMatricula(matricula, conexion.client))
          .then(r => {
            matricula_added = r;
            matricula.id = matricula_added.id;
            if (matricula.generar_boleta) {
              return addBoletaInscripcion(
                matricula_added.id,
                solicitud.tipoEntidad,
                matricula.documento,
                matricula.delegacion,
                conexion.client
              );
            }
            else return Promise.resolve(false);
          })
          .then(r => solicitud.tipoEntidad == 'profesional' ? esJovenProfesional(solicitud.entidad.id, conexion.client): Promise.resolve(false))
          .then(es_joven => {
            if (!es_joven) return Promise.resolve();
            else return crearBonificaciones(matricula, conexion.client);
          })
          .then(r => addBoletasMensuales(matricula_added.id, solicitud.tipoEntidad, matricula.delegacion, conexion.client))
          .then(() => MatriculaHistorial.add({
              matricula: matricula_added.id,
              documento: matricula.documento,
              estado: matricula.generar_boleta ? 12 : 13, // 12 es 'Pendiente de Pago', 13 es 'Habilitada'
              fecha: new Date(),
              usuario: matricula.created_by
            }, conexion.client)
          )
          .then(r => {
            return connector.commit(conexion.client)
              .then(r => {
                conexion.done();
                return matricula_added;
              })
          })
          .catch(e => {
            console.error(e)
            connector.rollback(conexion.client);
            conexion.done();
            return Promise.reject(e);
          });
        })
      }
      else return Promise.reject({ http_code: 409, mensaje: "Ya existe una matrícula para dicha solicitud" });
  })
}

module.exports.cambiarEstado = function(id, nuevo_estado) {
  let conexion;

  return connector.beginTransaction()
  .then(conx => {
    conexion = conx;

    return MatriculaHistorial.add({
        matricula: id,
        documento: nuevo_estado.documento,
        estado: nuevo_estado.estado,
        fecha: new Date(),
        usuario: nuevo_estado.updated_by
      }, conexion.client
    )
    .then(() => {
      let query = table.update({
        estado: nuevo_estado.estado,
        updated_by: nuevo_estado.updated_by,
        updated_at: new Date()
      })
      .where(table.id.equals(id))
      .returning(table.id, table.estado)
      .toQuery();

      return connector.execQuery(query, conexion.client)
      .then(r => r.rows[0]);
    })
    .then(matricula => {
      return connector.commit(conexion.client)
        .then(r => {
          conexion.done();
          return matricula;
        })
    })
    .catch(e => {
      connector.rollback(conexion.client);
      conexion.done();
      return Promise.reject(e);
    });
  })
}

function filter(query, params) {
  if (params.entidad) {
    // if (params.entidad && !isNaN(+params.entidad)) query.where(table.entidad.equals(params.entidad));
    if (params.entidad.tipo) query.where(Entidad.table.tipo.equals(params.entidad.tipo));
  }
  if (params.estado && !isNaN(+params.estado)) query.where(table.estado.equals(params.estado));

  if (params.tipo)
    if (Array.isArray(params.tipo)) {
      let q_or = params.tipo.map(t => ` "numeroMatricula" ILIKE '${t}%' `).join('OR');
      query.where(q_or);
    }
    else query.where(table.numeroMatricula.ilike(`${params.tipo}%`));


  if (params.solicitud) {
    if (params.solicitud.id) query.where(table.solicitud.equals(params.solicitud.id));
    if (params.solicitud.publicarEmail) query.where(Profesional.table.publicarEmail.equals(params.solicitud.publicarEmail));
    if (params.solicitud.publicarAcervo) query.where(Profesional.table.publicarAcervo.equals(params.solicitud.publicarAcervo));
    if (params.solicitud.publicarDireccion) query.where(Profesional.table.publicarDireccion.equals(params.solicitud.publicarDireccion));
    if (params.solicitud.publicarCelular) query.where(Profesional.table.publicarCelular.equals(params.solicitud.publicarCelular));
  }

  if (params.filtros) {
    if (params.filtros.numeroMatricula) query.where(table.numeroMatricula.ilike(`%${params.filtros.numeroMatricula}%`));
    if (params.filtros['profesional.apellido']) query.where(Profesional.table.apellido.ilike(`%${params.filtros['profesional.apellido']}%`));
    if (params.filtros['profesional.dni']) query.where(Profesional.table.dni.ilike(`%${params.filtros['profesional.dni']}%`));
    if (params.filtros['empresa.nombre']) query.where(Empresa.table.nombre.ilike(`%${params.filtros['empresa.nombre']}%`));
    if (params.filtros['entidad.cuit']) query.where(Entidad.table.cuit.ilike(`%${params.filtros['entidad.cuit']}%`));
  }
}

module.exports.getAll = function (params, rol) {
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
      if (m.tipoEntidad == 'profesional') return Profesional.get(m.entidad, rol)
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

module.exports.get = function (id, client) {
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

  return connector.execQuery(query, client)
    .then(r => {
      matricula = dot.object(r.rows[0]);
      if (!matricula) throw ({ http_code: 404, mensaje: "No existe el recurso solicitado" });
      if (matricula.tipoEntidad == 'profesional') return Profesional.get(matricula.entidad)
      else if (matricula.tipoEntidad == 'empresa') return Empresa.get(matricula.entidad);
    })
    .then(r => {
      matricula.entidad = r;
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

module.exports.verificarSuspension = function(id) {
  let check_boletas_anio = false;

  return module.exports.get(id)
  .then(matricula => {
    let table = Boleta.table;
    let query = table.select(table.count().as('cantidad_sin_pagar'))
    .where(
        table.estado.equals(1),
        table.tipo_comprobante.in([10,16]),
        table.matricula.equals(matricula.id),
        table.fecha_vencimiento.lt(new Date())
    )
    .toQuery();

    return connector.execQuery(query)
    .then(r => {
        let cantidad_sin_pagar = +r.rows[0].cantidad_sin_pagar;
        let nuevo_estado = {
          updated_by: 25,   // Procesos de Sistema
          documento: 3299    //Resolución 008/18
        }

        //Tiene 4 o más cuotas sin abonar y está habilitado
        if (matricula.estado.id === 13 && cantidad_sin_pagar >= 4) {
          nuevo_estado.estado = 24; // Suspendido por mora cuatrimestral
        }
        else if (matricula.estado.id === 24 && cantidad_sin_pagar < 4) {
          nuevo_estado.estado = 13; // Suspendido por mora cuatrimestral
          check_boletas_anio = true;
        }
        else return Promise.resolve();

        return module.exports.cambiarEstado(id, nuevo_estado)
        .then(() => check_boletas_anio ? module.exports.verificarBoletasAnio(matricula.id, new Date().getFullYear()) : Promise.resolve());
    });
  });
}

module.exports.verificarInscripcion = function(id) {
  return module.exports.get(id)
  .then(matricula => {
    //Si está como pendiente de pago de inscripcion, habilito, sino no
    if (matricula.estado.id === 12) {
      return MatriculaHistorial.getByMatricula(id)
      .then(historial => {
        let documento = historial.find(h => h.estado.id === 12).documento.id;
        let nuevo_estado = {
          updated_by: 25,   // Procesos de Sistema
          documento,
          estado: 13 //Habilitado
        }

        return module.exports.cambiarEstado(id, nuevo_estado);
      })
    }
    else return Promise.resolve(false);
  })
}

module.exports.verificarBoletasAnio = function(id, anio) {
  let fecha_anio_verficiar = `${anio}-01-01`;
  let table = Boleta.table;
  let query = table.select(table.count().as('boletas_anio'))
    .where(
      table.tipo_comprobante.in([10, 16]),
      table.matricula.equals(id),
      table.fecha.gte(fecha_anio_verficiar)
    )
    .toQuery();

  return connector.execQuery(query)
  .then(r => {
    let boletas_anio = +r.rows[0].boletas_anio;

    //La matrícula no tiene cargadas boletas en el año en cuestión, hay que cargarlas
    if (boletas_anio == 0) return module.exports.get(id).then(matricula => addBoletasMensuales(id, matricula.entidad.tipo, 1));
    else return Promise.resolve(false);
  })
  .catch(e => console.error(e))
}