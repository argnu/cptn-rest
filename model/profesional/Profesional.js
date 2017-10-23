const connector = require('../../connector');
const Contacto = require('../Contacto');
const Formacion = require('./Formacion');
const Beneficiario = require('./BeneficiarioCaja');
const Subsidiario = require('./Subsidiario');
const Domicilio = require('../Domicilio');
const Entidad = require('../Entidad');
const TipoSexo = require('../tipos/TipoSexo');
const TipoEstadoCivil = require('../tipos/TipoEstadoCivil');
const TipoRelacionLaboral = require('../tipos/TipoRelacionLaboral');
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
      dataType: 'date',
      notNull: true
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
      dataType: 'varchar(100)'
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
      table.sexo.value(profesional.sexo), table.estadoCivil.value(profesional.estadoCivil),
      table.nacionalidad.value(profesional.nacionalidad),
      table.observaciones.value(profesional.observaciones),
      table.relacionDependencia.value(profesional.relacionDependencia),
      table.independiente.value(profesional.independiente),
      table.empresa.value(profesional.empresa),
      table.serviciosPrestados.value(profesional.serviciosPrestados),
      table.poseeCajaPrevisional.value(profesional.poseeCajaPrevisional),
      table.nombreCajaPrevisional.value(profesional.nombreCajaPrevisional)
    ).toQuery();

    return connector.execQuery(query, client);
  }

  return Entidad.addEntidad({
    tipo: profesional.tipo,
    cuit: profesional.cuit,
    condafip: profesional.condafip,
    domicilioReal: profesional.domicilioReal,
    domicilioLegal: profesional.domicilioLegal
  }, client)
  .then(entidad => {
    profesional.id = entidad.id;
    return addDatosBasicos(profesional)
          .then(r => {
            let proms_contactos = profesional.contactos.map(c => {
              c.entidad = entidad.id;
              return Contacto.addContacto(client, c);
            });

            let proms_formaciones = profesional.formaciones.map(f => {
              f.profesional = profesional.id;
              return Formacion.addFormacion(client, f);
            });

            let proms_beneficiarios = profesional.beneficiarios.map(b => {
              b.profesional = profesional.id;
              return Beneficiario.addBeneficiario(client, b);
            });

            let proms_subsidiarios = profesional.subsidiarios.map(s => {
              s.profesional = profesional.id;
              return Subsidiario.addSubsidiario(client, s);
            });


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
TipoSexo.table.valor.as('sexo'),
TipoEstadoCivil.table.valor.as('estadoCivil'),
// TipoRelacionLaboral.table.valor.as('relacionLaboral'),
table.observaciones, table.empresa,
table.serviciosPrestados, table.poseeCajaPrevisional,
table.nombreCajaPrevisional, table.publicar,
Entidad.table.domicilioReal.as('domicilioReal'),
Entidad.table.domicilioLegal.as('domicilioLegal')];
const select_from = table.join(Entidad.table).on(table.id.equals(Entidad.table.id))
                         .join(TipoSexo.table).on(table.sexo.equals(TipoSexo.table.id))
                         .join(TipoEstadoCivil.table).on(table.estadoCivil.equals(TipoEstadoCivil.table.id));
                         //.join(TipoRelacionLaboral.table).on(table.relacionLaboral.equals(TipoRelacionLaboral.table.id));

module.exports.getAll = function() {
  let profesionales = [];
  let query = table.select(...select_atributes)
  .from(select_from)
  .toQuery();
  connector.execQuery(query)
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
      [ domicilioReal, domicilioLegal, contactos,
        formaciones, beneficiarios, subsidiarios ] = value;
      profesionales[index].domicilioReal = domicilioReal;
      profesionales[index].domicilioLegal = domicilioLegal;
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
      Domicilio.getDomicilio(profesional.domicilioLegal),
      Contacto.getAll(profesional.id),
      Formacion.getAll(profesional.id),
      Beneficiario.getAll(profesional.id),
      Subsidiario.getAll(profesional.id)
    ]);
}

module.exports.get = function(id) {
  let profesional = {};
  let query = table.select(...select_atributes)
  .from(select_from)
  .where(table.id.equals(id))
  .toQuery();

  return connector.execQuery(query)
  .then(r => {
    profesional = r.rows[0];
    return getDatosProfesional(profesional);
  })
  .then(([
      domicilioReal, domicilioLegal, contactos,
      formaciones, beneficiarios, subsidiarios
    ]) => {
      profesional.domicilioReal = domicilioReal;
      profesional.domicilioLegal = domicilioLegal;
      profesional.contactos = contactos;
      profesional.formaciones = formaciones;
      profesional.beneficiarios = beneficiarios;
      profesional.subsidiarios = subsidiarios;
      return profesional;
    });
}
