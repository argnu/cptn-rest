const connector = require('../../connector');
const Contacto = require('./Contacto');
const Formacion = require('./Formacion');
const Beneficiario = require('./BeneficiarioCaja');
const Subsidiario = require('./Subsidiario');
const Domicilio = require('../Domicilio');
const sql = require('sql');
sql.setDialect('postgres');


const table = sql.define({
  name: 'profesional',
  columns: [
    {
      name: 'id',
      dataType: 'serial',
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
      dataType: 'varchar(45)'
    },
    {
      name: 'nacionalidad',
      dataType: 'varchar(45)'
    },
    {
      name: 'estadoCivil',
      dataType: 'varchar(45)'
    },
    {
      name: 'observaciones',
      dataType: 'text'
    },
    {
      name: 'cuit',
      dataType: 'varchar(20)'
    },
    {
      name: 'relacionLaboral',
      dataType: 'varchar(45)'
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
      name: 'cajaPrevisional',
      dataType: 'varchar(45)'
    },
    {
      name: 'publicar',
      dataType: 'boolean'
    },
    {
      name: 'domicilioReal',
      dataType: 'int',
      notNull: true
    },
    {
      name: 'domicilioLegal',
      dataType: 'int',
      notNull: true
    },
    {
      name: 'condafip',
      dataType: 'int'
    }
  ],

  foreignKeys: [
    {
      table: 'domicilio',
      columns: [ 'domicilioReal' ],
      refColumns: [ 'id' ]
    },
    {
      table: 'domicilio',
      columns: [ 'domicilioLegal' ],
      refColumns: [ 'id' ]
    },
    {
      table: 'condafip',
      columns: [ 'condafip' ],
      refColumns: [ 'id' ]
    }
  ]
});

module.exports.table = table;

function addProfesional(client, profesional) {

  function addDatosBasicos(profesional) {
    let query = table.insert(
      table.dni.value(profesional.dni), table.nombre.value(profesional.nombre),
      table.apellido.value(profesional.apellido), table.fechaNacimiento.value(profesional.fechaNacimiento),
      table.sexo.value(profesional.sexo), table.estadoCivil.value(profesional.estadoCivil),
      table.cuit.value(profesional.cuit), table.nacionalidad.value(profesional.nacionalidad),
      table.observaciones.value(profesional.observaciones),
      table.domicilioReal.value(profesional.idDomicilioReal),
      table.domicilioLegal.value(profesional.idDomicilioLegal),
      table.relacionLaboral.value(profesional.relacionLaboral),
      table.empresa.value(profesional.empresa),
      table.serviciosPrestados.value(profesional.serviciosPrestados),
      table.cajaPrevisional.value(profesional.cajaPrevisional)
    ).returning(table.id).toQuery();

    return connector.execQuery(query, client);
  }

  function addDomicilio(domicilio) {
    let query = Domicilio.table.insert(
      Domicilio.table.calle.value(domicilio.calle),
      Domicilio.table.numero.value(domicilio.numero),
      Domicilio.table.localidad.value(domicilio.localidad)
    ).returning(Domicilio.table.id).toQuery()

    return connector.execQuery(query, client);
  }

  return new Promise(function(resolve, reject) {
    Promise.all([
      addDomicilio(profesional.domicilioReal),
      addDomicilio(profesional.domicilioLegal)
    ])
    .then(rs => {
      profesional.idDomicilioReal = rs[0].rows[0].id;
      profesional.idDomicilioLegal = rs[1].rows[0].id;
      return addDatosBasicos(profesional)
        .then(r => {
          var id_profesional = r.rows[0].id;
          let proms_contactos = profesional.contactos.map(c => {
            c.profesional = id_profesional;
            return Contacto.addContacto(client, c);
          });

          let proms_formaciones = profesional.formaciones.map(f => {
            f.profesional = id_profesional;
            return Formacion.addFormacion(client, f);
          });

          let proms_beneficiarios = profesional.beneficiarios.map(b => {
            b.profesional = id_profesional;
            return Beneficiario.addBeneficiario(client, b);
          });

          let proms_subsidiarios = profesional.subsidiarios.map(s => {
            s.profesional = id_profesional;
            return Subsidiario.addSubsidiario(client, s);
          });


          return Promise.all(proms_contactos)
          .then(rs => Promise.all(proms_formaciones))
          .then(rs => Promise.all(proms_beneficiarios))
          .then(rs => Promise.all(proms_subsidiarios))
          .then(rs => resolve(id_profesional));
        })
      })
      .catch(e => reject(e));
  });
}

module.exports.addProfesional = addProfesional;

module.exports.add = function(profesional) {
  return new Promise(function(resolve, reject) {
    connector
    .beginTransaction()
    .then(connection => {
      addProfesional(connection.client, profesional)
        .then(r => {
          let id_profesional = r;
          connector
          .commit(connection.client)
          .then(r => {
            connection.done();
            resolve(id_profesional);
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


module.exports.getAll = function() {
  return new Promise(function(resolve, reject) {
    let profesionales = [];
    let query = table.select(table.star()).from(table).toQuery();
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
      rs.forEach((value, index) => fillDataProfesional(profesionales[index], value));
      resolve(profesionales);
    })
  });
}


function getDatosProfesional(profesional) {

  function getDomicilios(real, legal) {
    let query = Domicilio.table.select(Domicilio.table.star())
                               .from(Domicilio.table)
                               .where(Domicilio.table.id.equals(real))
                               .or(Domicilio.table.id.equals(legal))
                               .toQuery();
    return connector.execQuery(query);
  }

  return Promise.all([
      getDomicilios(profesional.domicilioreal, profesional.domiciliolegal),
      Contacto.getAll(profesional.id),
      Formacion.getAll(profesional.id),
      Beneficiario.getAll(profesional.id),
      Subsidiario.getAll(profesional.id)
    ]);
}

function fillDataProfesional(profesional, responses) {
  for(let domicilio of responses[0].rows) {
    if (domicilio.id == profesional.domiciliolegal) profesional.domiciliolegal = domicilio;
    else if (domicilio.id == profesional.domicilioreal) profesional.domicilioreal = domicilio;
  }
  profesional.contactos = responses[1].rows;
  profesional.formaciones = responses[2].rows;
  profesional.beneficiarios = responses[3].rows;
  profesional.subsidiarios = responses[4].rows;
}

module.exports.get = function(id) {
  return new Promise(function(resolve, reject) {
    let profesional = {};
    let query = table.select(table.star())
                     .from(table)
                     .where(table.id.equals(id))
                     .toQuery();

    connector.execQuery(query)
    .then(r => {
      profesional = r.rows[0];
      return getDatosProfesional(profesional);
    })
    .then(rs => {
      fillDataProfesional(profesional, rs);
      resolve(profesional)
    })
    .catch(e => reject(e));
  });
}
