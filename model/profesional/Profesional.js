const dot = require('dot-object');
const config = require('../../config.private');
const connector = require('../../db/connector');
const Contacto = require('../Contacto');
const ProfesionalCajaPrevisional = require('./ProfesionalCajaPrevisional');
const ProfesionalTitulo = require('./ProfesionalTitulo');
const Subsidiario = require('./Subsidiario');
const EntidadDomicilio = require('../EntidadDomicilio');
const EntidadCondicionAfip = require('../EntidadCondicionAfip');
const Entidad = require('../Entidad');
const TipoSexo = require('../tipos/TipoSexo');
const TipoEstadoCivil = require('../tipos/TipoEstadoCivil');
const TipoCondicionAfip = require('../tipos/TipoCondicionAfip');
const utils = require(`../../utils`);

const sql = require('sql');
sql.setDialect('postgres');


const table = sql.define({
  name: 'profesional',
  columns: [
    {
      name: 'id',
      dataType: 'int',
      primaryKey: true
    },
    {
      name: 'dni',
      dataType: 'varchar(10)',
      notNull: true
    },
    {
      name: 'apellido',
      dataType: 'varchar(100)',
      notNull: true
    },
    {
      name: 'nombre',
      dataType: 'varchar(100)',
      notNull: true
    },
    {
      name: 'fechaNacimiento',
      dataType: 'date'
    },
    {
      name: 'lugarNacimiento',
      dataType: 'varchar(100)'
    },
    {
      name: 'sexo',
      dataType: 'int'
    },
    {
      name: 'nacionalidad',
      dataType: 'varchar(45)'
    },
    {
      name: 'estadoCivil',
      dataType: 'int'
    },
    {
      name: 'observaciones',
      dataType: 'text'
    },
    {
      name: 'relacionDependencia',
      dataType: 'boolean'
    },
    {
      name: 'independiente',
      dataType: 'boolean'
    },
    {
      name: 'empresa',
      dataType: 'varchar(250)'
    },
    {
      name: 'serviciosPrestados',
      dataType: 'varchar(255)'
    },
    {
      name: 'jubilado',
      dataType: 'boolean'
    },
    {
      name: 'publicar',
      dataType: 'boolean'
    },
    {
      name: 'publicarEmail',
      dataType: 'boolean'
    },
    {
      name: 'publicarCelular',
      dataType: 'boolean'
    },
    {
      name: 'publicarAcervo',
      dataType: 'boolean'
    },
    {
      name: 'publicarDireccion',
      dataType: 'boolean'
    },
    {
      name: 'foto',
      dataType: 'varchar(255)',
    },
    {
      name: 'firma',
      dataType: 'varchar(255)',
    },
    {
      name: 'updated_at',
      dataType: 'timestamptz',
    },
    {
      name: 'updated_by',
      dataType: 'int',
    }
  ],

  foreignKeys: [
    {
      table: 'entidad',
      columns: [ 'id' ],
      refColumns: [ 'id' ]
    },
    {
      table: 't_estadocivil',
      columns: [ 'estadoCivil' ],
      refColumns: [ 'id' ]
    },
    {
      table: 'usuario',
      columns: [ 'updated_by' ],
      refColumns: [ 'id' ]
    }
  ]
});

module.exports.table = table;

function addDatosBasicos(profesional, client) {
  let query = table.insert(
    table.id.value(profesional.id),
    table.dni.value(profesional.dni), table.nombre.value(profesional.nombre),
    table.apellido.value(profesional.apellido),
    table.fechaNacimiento.value(utils.checkNull(profesional.fechaNacimiento)),
    table.lugarNacimiento.value(profesional.lugarNacimiento),
    table.sexo.value(profesional.sexo), table.estadoCivil.value(profesional.estadoCivil),
    table.nacionalidad.value(profesional.nacionalidad),
    table.observaciones.value(profesional.observaciones),
    table.relacionDependencia.value(profesional.relacionDependencia),
    table.independiente.value(profesional.independiente),
    table.empresa.value(profesional.empresa),
    table.serviciosPrestados.value(profesional.serviciosPrestados),
    table.jubilado.value(profesional.jubilado),
    table.publicar.value(profesional.publicar),
    table.publicarCelular.value(profesional.publicarCelular),
    table.publicarEmail.value(profesional.publicarEmail),
    table.publicarAcervo.value(profesional.publicarAcervo),
    table.publicarDireccion.value(profesional.publicarDireccion),
    table.foto.value(profesional.foto),
    table.firma.value(profesional.firma)
  ).toQuery();

  return connector.execQuery(query, client);
}

module.exports.add = function (profesional, client) {
  return Entidad.add({
    tipo: profesional.tipo,
    cuit: profesional.cuit,
    domicilios: profesional.domicilios,
    condiciones_afip: profesional.condiciones_afip,
  }, client)
  .then(entidad => {
    profesional.id = entidad.id;
    return addDatosBasicos(profesional, client)
    .then(r => {
      let proms_contactos = (profesional.contactos && profesional.contactos.length) ? profesional.contactos.map(c => {
        c.entidad = entidad.id;
        return Contacto.add(c, client);
      }) : [];

      let proms_formaciones = (profesional.formaciones && profesional.formaciones.length) ? profesional.formaciones.map(f => {
        f.profesional = profesional.id;
        return ProfesionalTitulo.add(f, client);
      }) : [];

      let proms_subsidiarios = (profesional.subsidiarios && profesional.subsidiarios.length) ? profesional.subsidiarios.map(s => {
        s.profesional = profesional.id;
        return Subsidiario.add(s, client);
      }) : [];

      let proms_cajas = (profesional.cajas_previsionales && profesional.cajas_previsionales.length) ? profesional.cajas_previsionales.map(c => {
        return ProfesionalCajaPrevisional.add({
          profesional: profesional.id,
          caja: c
        }, client)
      }) : [];


      return Promise.all(proms_contactos)
      .then(rs => Promise.all(proms_formaciones))
      .then(rs => Promise.all(proms_subsidiarios))
      .then(rs => Promise.all(proms_cajas))
      .then(rs => profesional);
    });
  })
}

const select = [
  table.id,
  Entidad.table.tipo,
  Entidad.table.cuit,
  table.nombre,
  table.apellido,
  table.dni,
  table.fechaNacimiento.cast('varchar(10)'),
  table.lugarNacimiento,
  table.nacionalidad,
  table.relacionDependencia,
  table.independiente,
  TipoSexo.table.id.as('sexo.id'),
  TipoSexo.table.valor.as('sexo.valor'),
  TipoEstadoCivil.table.id.as('estadoCivil.id'),
  TipoEstadoCivil.table.valor.as('estadoCivil.valor'),
  table.observaciones,
  table.empresa,
  table.serviciosPrestados,
  table.foto,
  table.firma,
  table.publicarAcervo,
  table.publicarCelular,
  table.publicarDireccion,
  table.publicarEmail,
  table.jubilado
];

const from = table.join(Entidad.table).on(table.id.equals(Entidad.table.id))
.leftJoin(TipoSexo.table).on(table.sexo.equals(TipoSexo.table.id))
.leftJoin(TipoEstadoCivil.table).on(table.estadoCivil.equals(TipoEstadoCivil.table.id));



module.exports.getAll = function(params) {
  let profesionales = [];
  let query = table.select(select)
  .from(from)


  if (params.dni) query.where(table.dni.equals(params.dni));
  if (params.limit) query.limit(+params.limit);
  if (params.limit && params.offset) query.offset(+params.offset);

  return connector.execQuery(query.toQuery())
  .then(r => {
    profesionales = r.rows.map(row => dot.object(row));
    let proms = []
    for(let profesional of profesionales) {
      proms.push(getDatosProfesional(profesional));
    }
    return Promise.all(proms);
  })
  .then(rs => {
    rs.forEach((value, index) => {
      [ domicilios, condiciones_afip, contactos, formaciones, cajas_previsionales, subsidiarios ] = value;
      profesionales[index].domicilios = domicilios;
      profesionales[index].condiciones_afip = condiciones_afip;
      profesionales[index].contactos = contactos;
      profesionales[index].formaciones = formaciones;
      profesionales[index].cajas_previsionales = cajas_previsionales;
      profesionales[index].subsidiarios = subsidiarios;
      if (profesionales[index].foto) {
        profesionales[index].foto = `http://${config.entry.host}:${config.entry.port}/api/profesionales/${profesionales[index].id}/foto`;
      }
      if (profesionales[index].firma) {
        profesionales[index].firma = `http://${config.entry.host}:${config.entry.port}/api/profesionales/${profesionales[index].id}/firma`;
      }
    });
    return profesionales;
  })
}


function getDatosProfesional(profesional) {
  return Promise.all([
      EntidadDomicilio.getByEntidad(profesional.id),
      EntidadCondicionAfip.getByEntidad(profesional.id),
      Contacto.getAll(profesional.id),
      ProfesionalTitulo.getByProfesional(profesional.id),
      ProfesionalCajaPrevisional.getByProfesional(profesional.id),
      Subsidiario.getAll(profesional.id)
    ]);
}

module.exports.get = function(id) {
  let query = table.select(select)
  .from(from)
  .where(table.id.equals(id))
  .toQuery();

  let profesional;
  return connector.execQuery(query)
  .then(r => {
    profesional = dot.object(r.rows[0]);
    if (profesional.foto) {
      profesional.foto = `http://${config.entry.host}:${config.entry.port}/api/profesionales/${profesional.id}/foto`;
    }
    if (profesional.firma) {
      profesional.firma = `http://${config.entry.host}:${config.entry.port}/api/profesionales/${profesional.id}/firma`;
    }
    return getDatosProfesional(profesional);
  })
  .then(([
      domicilios, condiciones_afip, contactos, formaciones, cajas_previsionales, subsidiarios
    ]) => {
      profesional.domicilios = domicilios;
      profesional.condiciones_afip = condiciones_afip;
      profesional.contactos = contactos;
      profesional.formaciones = formaciones;
      profesional.cajas_previsionales = cajas_previsionales;
      profesional.subsidiarios = subsidiarios;
      return profesional;
    });
}

module.exports.getFoto = function(id) {
  let query = table.select(table.foto).where(table.id.equals(id)).toQuery();
  return connector.execQuery(query).then(r => r.rows[0].foto);
}

module.exports.getFirma = function(id) {
  let query = table.select(table.firma).where(table.id.equals(id)).toQuery();
  return connector.execQuery(query).then(r => r.rows[0].firma);
}


module.exports.edit = function(id, profesional, client) {
  let contactos_nuevos = profesional.contactos.filter(c => !c.id);
  let contactos_existentes = profesional.contactos.filter(c => !!c.id);
  let formaciones_nuevas = profesional.formaciones.filter(f => !f.id);
  let formaciones_existentes = profesional.formaciones.filter(f => !!f.id);
  let subsidiarios_nuevos = profesional.subsidiarios.filter(s => !s.id);
  let subsidiarios_existentes = profesional.subsidiarios.filter(s => !!s.id);
  let cajas_nuevas = profesional.cajas_previsionales.filter(c => !c.id);
  let cajas_existentes = profesional.cajas_previsionales.filter(c => !!c.id);

  return Entidad.edit(id, {
    cuit: profesional.cuit,
    domicilios: profesional.domicilios,
    condiciones_afip: profesional.condiciones_afip
  }, client)
  .then(r => {
    let obj_update = {
      dni: profesional.dni,
      apellido: profesional.apellido,
      nombre: profesional.nombre,
      fechaNacimiento: profesional.fechaNacimiento,
      lugarNacimiento: profesional.lugarNacimiento,
      sexo: profesional.sexo,
      estadoCivil: profesional.estadoCivil,
      nacionalidad: profesional.nacionalidad,
      observaciones: profesional.observaciones,
      relacionDependencia: profesional.relacionDependencia,
      independiente: profesional.independiente,
      empresa: profesional.empresa,
      serviciosPrestados: profesional.serviciosPrestados,
      jubilado: profesional.jubilado,
      publicarAcervo: profesional.publicarAcervo,
      publicarCelular: profesional.publicarCelular,
      publicarDireccion: profesional.publicarDireccion,
      publicarEmail: profesional.publicarEmail
    };

    if (profesional.foto) obj_update.foto = profesional.foto;
    if (profesional.firma) obj_update.firma = profesional.firma;

    let query = table.update(obj_update)
    .where(table.id.equals(id))
    .toQuery();

    return connector.execQuery(query, client);
  })
  .then(r => {
    let proms = [
      connector.execQuery(
        Contacto.table.delete().where(
          Contacto.table.entidad.equals(id)
          .and(Contacto.table.id.notIn(contactos_existentes.map(c => c.id)))
        ).toQuery(), client),

      connector.execQuery(
        ProfesionalTitulo.table.delete().where(
          ProfesionalTitulo.table.profesional.equals(id)
          .and(ProfesionalTitulo.table.id.notIn(formaciones_existentes.map(f => f.id)))
        ).toQuery(), client),

      connector.execQuery(
        Subsidiario.table.delete().where(
          Subsidiario.table.profesional.equals(id)
          .and(Subsidiario.table.id.notIn(subsidiarios_existentes.map(s => s.id)))
      ).toQuery(), client),

      connector.execQuery(
        ProfesionalCajaPrevisional.table.delete().where(
          ProfesionalCajaPrevisional.table.profesional.equals(id)
          .and(ProfesionalCajaPrevisional.table.id.notIn(cajas_existentes.map(c => c.id)))
      ).toQuery(), client)
    ];

    return Promise.all(proms)
    .catch(e => {
      console.error(e);
      return Promise.reject(e)
    })    
  })
  .then(r => {
    let proms = [];

    contactos_nuevos.forEach(c => {
      c.entidad = id;
      proms.push(Contacto.add(c, client));
    });

    contactos_existentes.forEach(c => proms.push(Contacto.edit(c.id, c, client)));

    formaciones_nuevas.forEach(f => {
      f.profesional = id;
      proms.push(ProfesionalTitulo.add(f, client));
    });

    formaciones_existentes.forEach(f => proms.push(ProfesionalTitulo.edit(f.id, f, client)));

    subsidiarios_nuevos.forEach(s => {
      s.profesional = id;
      proms.push(Subsidiario.add(s, client));
    });

    subsidiarios_existentes.forEach(s => proms.push(Subsidiario.edit(s.id, s, client)));

    cajas_nuevas.forEach(c => {
      proms.push(ProfesionalCajaPrevisional.add({
        profesional: id,
        caja: c
      }, client));
    });

    return Promise.all(proms)
    .catch(e => {
      console.error(e);
      return Promise.reject(e)
    })
  })
}

module.exports.patch = function (id, profesional, client) {
  let query = table.update(profesional)
    .where(table.id.equals(id))
    .returning(table.star())
    .toQuery();

  return connector.execQuery(query, client)
}