const connector = require('../../connector');
const Contacto = require('../Contacto');
const Formacion = require('./Formacion');
const Beneficiario = require('./BeneficiarioCaja');
const Subsidiario = require('./Subsidiario');
const EntidadDomicilio = require('../EntidadDomicilio');
const Entidad = require('../Entidad');
const TipoSexo = require('../tipos/TipoSexo');
const TipoEstadoCivil = require('../tipos/TipoEstadoCivil');
const TipoCondicionAfip = require('../tipos/TipoCondicionAfip');
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
      name: 'poseeCajaPrevisional',
      dataType: 'boolean'
    },
    {
      name: 'nombreCajaPrevisional',
      dataType: 'varchar(45)'
    },
    {
      name: 'solicitaCajaPrevisional',
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

function addDatosBasicos(profesional) {
  let query = table.insert(
    table.id.value(profesional.id),
    table.dni.value(profesional.dni), table.nombre.value(profesional.nombre),
    table.apellido.value(profesional.apellido),
    table.fechaNacimiento.value(profesional.fechaNacimiento),
    table.lugarNacimiento.value(profesional.lugarNacimiento),
    table.sexo.value(profesional.sexo), table.estadoCivil.value(profesional.estadoCivil),
    table.nacionalidad.value(profesional.nacionalidad),
    table.observaciones.value(profesional.observaciones),
    table.relacionDependencia.value(profesional.relacionDependencia),
    table.independiente.value(profesional.independiente),
    table.empresa.value(profesional.empresa),
    table.serviciosPrestados.value(profesional.serviciosPrestados),
    table.poseeCajaPrevisional.value(profesional.poseeCajaPrevisional),
    table.nombreCajaPrevisional.value(profesional.nombreCajaPrevisional),
    table.solicitaCajaPrevisional.value(profesional.solicitaCajaPrevisional),
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
    return addDatosBasicos(profesional)
          .then(r => {
            let proms_contactos = (profesional.contactos && profesional.contactos.length) ? profesional.contactos.map(c => {
              c.entidad = entidad.id;
              return Contacto.add(c, client);
            }) : [];

            let proms_formaciones = (profesional.formaciones && profesional.formaciones.length) ? profesional.formaciones.map(f => {
              f.profesional = profesional.id;
              return Formacion.add(f, client);
            }) : [];

            let proms_beneficiarios = (profesional.beneficiarios && profesional.beneficiarios.length) ? profesional.beneficiarios.map(b => {
              b.profesional = profesional.id;
              return Beneficiario.add(b, client);
            }) : [];

            let proms_subsidiarios = (profesional.subsidiarios && profesional.subsidiarios.length) ? profesional.subsidiarios.map(s => {
              s.profesional = profesional.id;
              return Subsidiario.add(s, client);
            }) : [];


            return Promise.all(proms_contactos)
            .then(rs => Promise.all(proms_formaciones))
            .then(rs => Promise.all(proms_beneficiarios))
            .then(rs => Promise.all(proms_subsidiarios))
            .then(rs => profesional);
          });
  })
}

const select_atributes = [table.id,
Entidad.table.tipo, Entidad.table.cuit,
table.nombre, table.apellido, table.dni,
table.fechaNacimiento, table.lugarNacimiento, table.nacionalidad,
table.relacionDependencia, table.independiente,
TipoSexo.table.valor.as('sexo'),
TipoEstadoCivil.table.valor.as('estadoCivil'),
TipoCondicionAfip.table.valor.as('condafip'),
table.observaciones, table.empresa,
table.serviciosPrestados, table.poseeCajaPrevisional,
table.solicitaCajaPrevisional,
table.nombreCajaPrevisional, table.publicar,
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
      [ domicilios, contactos, formaciones, beneficiarios, subsidiarios ] = value;
      profesionales[index].domicilios = domicilios;
      profesionales[index].contactos = contactos;
      profesionales[index].formaciones = formaciones;
      profesionales[index].beneficiarios = beneficiarios;
      profesionales[index].subsidiarios = subsidiarios;
      if (profesionales[index].foto) {
        profesionales[index].foto = `http://localhost:3400/api/profesionales/${profesionales[index].id}/foto`;
      }
      if (profesionales[index].firma) {
        profesionales[index].firma = `http://localhost:3400/api/profesionales/${profesionales[index].id}/firma`;
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
      Beneficiario.getAll(profesional.id),
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
      profesional.foto = `http://localhost:3400/api/profesionales/${profesional.id}/foto`;
    }
    if (profesional.firma) {
      profesional.firma = `http://localhost:3400/api/profesionales/${profesional.id}/firma`;
    }
    return getDatosProfesional(profesional);
  })
  .then(([
      domicilios, contactos, formaciones, beneficiarios, subsidiarios
    ]) => {
      profesional.domicilios = domicilios;
      profesional.contactos = contactos;
      profesional.formaciones = formaciones;
      profesional.beneficiarios = beneficiarios;
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
    let query = table.update({
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
      poseeCajaPrevisional: profesional.poseeCajaPrevisional,
      nombreCajaPrevisional: profesional.nombreCajaPrevisional,
      solicitaCajaPrevisional: profesional.solicitaCajaPrevisional,
      publicarAcervo: profesional.publicarAcervo,
      publicarCelular: profesional.publicarCelular,
      publicarDireccion: profesional.publicarDireccion,
      publicarEmail: profesional.publicarEmail
    })
      .where(table.id.equals(id))
      .toQuery();

    return Promise.all([
      Contacto.getAll(profesional.id),
      Formacion.getAll(profesional.id),
      Beneficiario.getAll(profesional.id),
      Subsidiario.getAll(profesional.id)      
    ])
    .then(([contactos, formaciones, beneficiarios, subsidiarios]) => {
      return connector.execQuery(query, client)
        .then(r => {
          let proms_contactos = [];
          for(let c of profesional.contactos) {
            if (!c.id) {
              c.entidad = id;
              proms_contactos.push(Contacto.add(c, client));
            }
          }
          
          //BUSCO LOS CONTACTOS QUE YA NO ESTAN EN LA LISTA PARA BORRARLOS
          for(let contacto of contactos) {
            if (!profesional.contactos.find(c => c.id && c.id == contacto.id))
              proms_contactos.push(Contacto.delete(contacto.id, client));
          }


          
          let proms_formaciones = [];
          for (let f of profesional.formaciones) {
            if (!f.id) {
              f.profesional = id;
              proms_formaciones.push(Formacion.add(f, client));
            }
          }
          
          for (let formacion of formaciones) {
            if (!profesional.formaciones.find(c => c.id && c.id == formacion.id))
              proms_formaciones.push(Formacion.delete(formacion.id, client));
          }


          
          let proms_beneficiarios = [];
          for (let b of profesional.beneficiarios) {
            if (!b.id) {
              b.profesional = id;
              proms_beneficiarios.push(Beneficiario.add(b, client));
            }
          }
          
          for (let beneficiario of beneficiarios) {
            if (!profesional.beneficiarios.find(c => c.id && c.id == beneficiario.id))
              proms_beneficiarios.push(Beneficiario.delete(beneficiario.id, client));
          }


          
          let proms_subsidiarios = [];
          for (let s of profesional.subsidiarios) {
            if (!s.id) {
              s.profesional = id;
              proms_subsidiarios.push(Subsidiario.add(s, client));
            }
          }
          
          for (let subsidiario of subsidiarios) {
            if (!profesional.subsidiarios.find(c => c.id && c.id == subsidiario.id))
              proms_subsidiarios.push(Subsidiario.delete(subsidiario.id, client));
          }

          return Promise.all([
            Promise.all(proms_formaciones),
            Promise.all(proms_beneficiarios),
            Promise.all(proms_subsidiarios)
          ])
          .then(rs => id);
        })
    })
  })
}