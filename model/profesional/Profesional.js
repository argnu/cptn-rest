const config = require('../../config.private');
const connector = require('../../connector');
const Contacto = require('../Contacto');
const ProfesionalCajaPrevisional = require('./ProfesionalCajaPrevisional');
const Formacion = require('./Formacion');
const Beneficiario = require('./BeneficiarioCaja');
const Subsidiario = require('./Subsidiario');
const EntidadDomicilio = require('../EntidadDomicilio');
const Entidad = require('../Entidad');
const TipoSexo = require('../tipos/TipoSexo');
const TipoEstadoCivil = require('../tipos/TipoEstadoCivil');
const TipoCondicionAfip = require('../tipos/TipoCondicionAfip');
const utils = require(`${__base}/utils`);

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
      name: 'jubilado',
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
    table.jubilado.value(profesional.jubilado),
    table.empresa.value(profesional.empresa),
    table.serviciosPrestados.value(profesional.serviciosPrestados),
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
    condafip: profesional.condafip,
    domicilios: profesional.domicilios,
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
              return Formacion.add(f, client);
            }) : [];

            // let proms_beneficiarios = (profesional.beneficiarios && profesional.beneficiarios.length) ? profesional.beneficiarios.map(b => {
            //   b.profesional = profesional.id;
            //   return Beneficiario.add(b, client);
            // }) : [];

            let proms_subsidiarios = (profesional.subsidiarios && profesional.subsidiarios.length) ? profesional.subsidiarios.map(s => {
              s.profesional = profesional.id;
              return Subsidiario.add(s, client);
            }) : [];

            let proms_cajas = (profesional.cajas_previsionales && profesional.cajas_previsionales.length) ? profesional.cajas_previsionales.map(c => {
              return ProfesionalCajaPrevisional.add({
                profesional: profesional.id,
                caja: c
              })
            }) : [];


            return Promise.all(proms_contactos)
            .then(rs => Promise.all(proms_formaciones))
            // .then(rs => Promise.all(proms_beneficiarios))
            .then(rs => Promise.all(proms_subsidiarios))
            .then(rs => Promise.all(proms_cajas))
            .then(rs => profesional);
          });
  })
}

const select_atributes = [table.id,
Entidad.table.tipo, Entidad.table.cuit,
table.nombre, table.apellido, table.dni,
table.fechaNacimiento, table.lugarNacimiento, table.nacionalidad,
table.relacionDependencia, table.independiente, table.jubilado,
TipoSexo.table.valor.as('sexo'),
TipoEstadoCivil.table.valor.as('estadoCivil'),
TipoCondicionAfip.table.valor.as('condafip'),
table.observaciones, table.empresa,
table.serviciosPrestados,
table.foto, table.firma,
table.publicarAcervo, table.publicarCelular,
table.publicarDireccion, table.publicarEmail
];

const select_from = table.join(Entidad.table).on(table.id.equals(Entidad.table.id))
                         .leftJoin(TipoCondicionAfip.table).on(Entidad.table.condafip.equals(TipoCondicionAfip.table.id))
                         .leftJoin(TipoSexo.table).on(table.sexo.equals(TipoSexo.table.id))
                         .leftJoin(TipoEstadoCivil.table).on(table.estadoCivil.equals(TipoEstadoCivil.table.id));



module.exports.getAll = function(params) {
  let profesionales = [];
  let query = table.select(...select_atributes)
  .from(select_from)

  if (params.dni) query.where(table.dni.equals(params.dni));
  if (params.limit) query.limit(+params.limit);
  if (params.limit && params.offset) query.offset(+params.offset);

  return connector.execQuery(query.toQuery())
  .then(r => {
    profesionales = r.rows;
    let proms = []
    for(let profesional of profesionales) {
      proms.push(getDatosProfesional(profesional));
    }
    return Promise.all(proms);
  })
  .then(rs => {
    rs.forEach((value, index) => {
      [ domicilios, contactos, formaciones, cajas_previsionales, subsidiarios ] = value;
      profesionales[index].domicilios = domicilios;
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
      Contacto.getAll(profesional.id),
      Formacion.getAll(profesional.id),
      ProfesionalCajaPrevisional.getByProfesional(profesional.id),
      // Beneficiario.getAll(profesional.id),
      Subsidiario.getAll(profesional.id)
    ]);
}

module.exports.get = function(id) {
  let query = table.select(...select_atributes)
  .from(select_from)
  .where(table.id.equals(id))
  .toQuery();

  let profesional;

  return connector.execQuery(query)
  .then(r => {
    profesional = r.rows[0];
    if (profesional.foto) {
      profesional.foto = `http://${config.entry.host}:${config.entry.port}/api/profesionales/${profesional.id}/foto`;
    }
    if (profesional.firma) {
      profesional.firma = `http://${config.entry.host}:${config.entry.port}/api/profesionales/${profesional.id}/firma`;
    }
    return getDatosProfesional(profesional);
  })
  .then(([
      domicilios, contactos, formaciones, cajas_previsionales, subsidiarios
    ]) => {
      profesional.domicilios = domicilios;
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
  return Entidad.edit(id, {
    cuit: profesional.cuit,
    condafip: profesional.condafip,
    domicilios: profesional.domicilios
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
      jubilado: profesional.jubilado,
      empresa: profesional.empresa,
      serviciosPrestados: profesional.serviciosPrestados,
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

    return connector.execQuery(query, client)
      .then(r => {
        let contactos_nuevos = profesional.contactos.filter(c => !c.id);
        let contactos_existentes = profesional.contactos.filter(c => !!c.id).map(c => c.id);
        let formaciones_nuevas = profesional.formaciones.filter(f => !f.id);
        let formaciones_existentes = profesional.formaciones.filter(f => !!f.id).map(f => f.id);
        // let beneficiarios_nuevos = profesional.beneficiarios.filter(b => !b.id);
        // let beneficiarios_existentes = profesional.beneficiarios.filter(b => !!b.id).map(b => b.id);  
        let subsidiarios_nuevos = profesional.subsidiarios.filter(s => !s.id);
        let subsidiarios_existentes = profesional.subsidiarios.filter(s => !!s.id).map(s => s.id);
        let cajas_nuevas = profesional.cajas_previsionales.filter(c => !c.id);
        let cajas_existentes = profesional.cajas_previsionales.filter(c => !!c.id).map(c => c.id);
        
        let proms = [
          connector.execQuery(
            Contacto.table.delete().where(
              Contacto.table.entidad.equals(id)
              .and(Contacto.table.id.notIn(contactos_existentes))
            ).toQuery(), client),

          connector.execQuery(
            Formacion.table.delete().where(
              Formacion.table.profesional.equals(id)
              .and(Formacion.table.id.notIn(formaciones_existentes))
            ).toQuery(), client),

          // connector.execQuery(
          //   Beneficiario.table.delete().where(
          //     Beneficiario.table.profesional.equals(id)
          //     .and(Beneficiario.table.id.notIn(beneficiarios_existentes))
          //   ).toQuery(), client), 

          connector.execQuery(
            Subsidiario.table.delete().where(
              Subsidiario.table.profesional.equals(id)
             .and(Subsidiario.table.id.notIn(subsidiarios_existentes))
          ).toQuery(), client),

          connector.execQuery(
            ProfesionalCajaPrevisional.table.delete().where(
              ProfesionalCajaPrevisional.table.profesional.equals(id)
             .and(ProfesionalCajaPrevisional.table.id.notIn(cajas_existentes))
          ).toQuery(), client)
        ];

        return Promise.all(proms)
        .then(r => {
          let proms_contactos = contactos_nuevos.map(c => { 
            c.entidad = id;
            return Contacto.add(c, client);
          });

          let proms_formaciones = formaciones_nuevas.map(f => {
            f.profesional = id;
            return Formacion.add(f, client);
          });


          // let proms_beneficiarios = beneficiarios_nuevos.map(b => {
          //   b.profesional = id;
          //   return Beneficiario.add(b, client)
          // });

          let proms_subsidiarios = subsidiarios_nuevos.map(s => {
            s.profesional = id;
            return Subsidiario.add(s, client);
          });

          let proms_cajas = cajas_nuevas.map(c => {
            return ProfesionalCajaPrevisional.add({
              profesional: id,
              caja: c
            }, client);
          });

          return Promise.all([
            Promise.all(proms_contactos),
            Promise.all(proms_formaciones),
            Promise.all(proms_subsidiarios),
            // Promise.all(proms_beneficiarios),
            Promise.all(proms_cajas)
          ])
          .then(rs => id);
        })
      })
  })
}

module.exports.patch = function (id, profesional, client) {
  let query = table.update(profesional)
    .where(table.id.equals(id))
    .returning(table.star())
    .toQuery();
    
  return connector.execQuery(query, client)
  .then(r => r.rows[0]);
}