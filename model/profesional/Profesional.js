const connector = require('../../connector');
const Contacto = require('../Contacto');
const Formacion = require('./Formacion');
const Beneficiario = require('./BeneficiarioCaja');
const Subsidiario = require('./Subsidiario');
const Domicilio = require('../Domicilio');
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
      name: 'localidadNacimiento',
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
      name: 'publicar',
      dataType: 'boolean'
    },
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

function addProfesional(profesional, client) {

  function addDatosBasicos(profesional) {
    let query = table.insert(
      table.id.value(profesional.id),
      table.dni.value(profesional.dni), table.nombre.value(profesional.nombre),
      table.apellido.value(profesional.apellido),
      table.fechaNacimiento.value(profesional.fechaNacimiento),
      table.localidadNacimiento.value(profesional.localidadNacimiento),
      table.sexo.value(profesional.sexo), table.estadoCivil.value(profesional.estadoCivil),
      table.nacionalidad.value(profesional.nacionalidad),
      table.observaciones.value(profesional.observaciones),
      table.relacionDependencia.value(profesional.relacionDependencia),
      table.independiente.value(profesional.independiente),
      table.empresa.value(profesional.empresa),
      table.serviciosPrestados.value(profesional.serviciosPrestados),
      table.poseeCajaPrevisional.value(profesional.poseeCajaPrevisional),
      table.nombreCajaPrevisional.value(profesional.nombreCajaPrevisional),
      table.publicar.value(profesional.publicar)
    ).toQuery();

    return connector.execQuery(query, client);
  }

  return Entidad.addEntidad({
    tipo: profesional.tipo,
    cuit: profesional.cuit,
    condafip: profesional.condafip,
    domicilioReal: profesional.domicilioReal,
    domicilioProfesional: profesional.domicilioProfesional,
    domicilioConstituido: profesional.domicilioConstituido
  }, client)
  .then(entidad => {
    profesional.id = entidad.id;
    return addDatosBasicos(profesional)
          .then(r => {
            let proms_contactos = (profesional.contactos && profesional.contactos.length) ? profesional.contactos.map(c => {
              c.entidad = entidad.id;
              return Contacto.addContacto(c, client);
            }) : [];

            let proms_formaciones = (profesional.formaciones && profesional.formaciones.length) ? profesional.formaciones.map(f => {
              f.profesional = profesional.id;
              return Formacion.addFormacion(f, client);
            }) : [];

            let proms_beneficiarios = (profesional.beneficiarios && profesional.beneficiarios.length) ? profesional.beneficiarios.map(b => {
              b.profesional = profesional.id;
              return Beneficiario.addBeneficiario(b, client);
            }) : [];

            let proms_subsidiarios = (profesional.subsidiarios && profesional.subsidiarios.length) ? profesional.subsidiarios.map(s => {
              s.profesional = profesional.id;
              return Subsidiario.addSubsidiario(s, client);
            }) : [];


            return Promise.all(proms_contactos)
            .then(rs => Promise.all(proms_formaciones))
            .then(rs => Promise.all(proms_beneficiarios))
            .then(rs => Promise.all(proms_subsidiarios))
            .then(rs => profesional);
          });
  })
}

module.exports.addProfesional = addProfesional;

module.exports.add = function(profesional) {
  return new Promise(function(resolve, reject) {
    connector
    .beginTransaction()
    .then(connection => {
      addProfesional(profesional, connection.client)
        .then(profesional_added => {
          connector
          .commit(connection.client)
          .then(r => {
            connection.done();
            resolve(profesional_added);
          });
        })
        .catch(e => {
          connector.rollback(connection.client);
          connection.done();
          reject(e);
        });
    })
  });
}

const select_atributes = [table.id,
Entidad.table.tipo,
table.nombre, table.apellido, table.dni,
table.fechaNacimiento, table.nacionalidad,
table.relacionDependencia, table.independiente,
TipoSexo.table.valor.as('sexo'),
TipoEstadoCivil.table.valor.as('estadoCivil'),
TipoCondicionAfip.table.valor.as('condafip'),
table.observaciones, table.empresa,
table.serviciosPrestados, table.poseeCajaPrevisional,
table.nombreCajaPrevisional, table.publicar,
Entidad.table.domicilioReal.as('domicilioReal'),
Entidad.table.domicilioProfesional.as('domicilioProfesional'),
Entidad.table.domicilioConstituido.as('domicilioConstituido')
];
const select_from = table.join(Entidad.table).on(table.id.equals(Entidad.table.id))
                         .join(TipoCondicionAfip.table).on(Entidad.table.condafip.equals(TipoCondicionAfip.table.id))
                         .leftJoin(TipoSexo.table).on(table.sexo.equals(TipoSexo.table.id))
                         .join(TipoEstadoCivil.table).on(table.estadoCivil.equals(TipoEstadoCivil.table.id));
                         




module.exports.getAll = function(params) {
  let profesionales = [];
  let query = table.select(...select_atributes)
  .from(select_from)

  if (params.limit) query.limit(+params.limit);
  if (params.limit && params.offset) query.offset(+params.offset);

  connector.execQuery(query.toQuery)
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
      [ domicilioReal, domicilioProfesional, domicilioConstituido,
        contactos, formaciones, beneficiarios, subsidiarios ] = value;
      profesionales[index].domicilioReal = domicilioReal || null;
      profesional.domicilioProfesional = domicilioProfesional || null;
      profesional.domicilioConstituido = domicilioConstituido || null;
      profesionales[index].contactos = contactos;
      profesionales[index].formaciones = formaciones;
      profesionales[index].beneficiarios = beneficiarios;
      profesionales[index].subsidiarios = subsidiarios;
    });
    return profesionales;
  })
}


function getDatosProfesional(profesional) {
  return Promise.all([
      Domicilio.getDomicilio(profesional.domicilioReal),
      Domicilio.getDomicilio(profesional.domicilioProfesional),
      Domicilio.getDomicilio(profesional.domicilioConstituido),
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
    return getDatosProfesional(profesional);
  })
  .then(([
      domicilioReal, domicilioProfesional, domicilioConstituido,
      contactos, formaciones, beneficiarios, subsidiarios
    ]) => {
      profesional.domicilioReal = domicilioReal || null;
      profesional.domicilioProfesional = domicilioProfesional || null;
      profesional.domicilioConstituido = domicilioConstituido || null;
      profesional.contactos = contactos;
      profesional.formaciones = formaciones;
      profesional.beneficiarios = beneficiarios;
      profesional.subsidiarios = subsidiarios;
      return profesional;
    });
}


module.exports.edit = function(id, profesional, client) {
  return Entidad.edit(id, {
    cuit: profesional.cuit,
    condafip: profesional.condafip,
    domicilioReal: profesional.domicilioReal,
    domicilioProfesional: profesional.domicilioProfesional,
    domicilioConstituido: profesional.domicilioConstituido
  }, client)
  .then(r => {
    let query = table.update({
      dni: profesional.dni,
      apellido: profesional.apellido,
      nombre: profesional.nombre,
      fechaNacimiento: profesional.fechaNacimiento,
      // localidadNacimiento: profesional.localidadNacimiento,
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
              proms_contactos.push(Contacto.addContacto(c, client));
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
              f.entidad = id;
              proms_formaciones.push(Formacion.addFormacion(f, client));
            }
          }
          
          for (let formacion of formaciones) {
            if (!profesional.formaciones.find(c => c.id && c.id == formacion.id))
              proms_formaciones.push(Formacion.delete(formacion.id, client));
          }


          
          let proms_beneficiarios = [];
          for (let b of profesional.beneficiarios) {
            if (!b.id) {
              b.entidad = id;
              proms_beneficiarios.push(Beneficiario.addBeneficiario(b, client));
            }
          }
          
          for (let beneficiario of beneficiarios) {
            if (!profesional.beneficiarios.find(c => c.id && c.id == beneficiario.id))
              proms_beneficiarios.push(Beneficiario.delete(formacion.id, client));
          }


          
          let proms_subsidiarios = [];
          for (let s of profesional.subsidiarios) {
            if (!s.id) {
              s.entidad = id;
              proms_subsidiarios.push(Subsidiario.addSubsidiario(s, client));
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