const moment = require('moment');
const connector = require('../connector');
const Domicilio = require('./Domicilio');
const Entidad = require('./Entidad');
const Contacto = require('./Contacto');
const EmpresaRepresentante = require('./EmpresaRepresentante');
const EmpresaIncumbencia = require('./EmpresaIncumbencia');
const TipoEmpresa = require('./tipos/TipoEmpresa');
const TipoSociedad = require('./tipos/TipoSociedad');
const TipoCondicionAfip = require('./tipos/TipoCondicionAfip');
const sql = require('sql');
sql.setDialect('postgres');


const table = sql.define({
  name: 'empresa',
  columns: [
    {
      name: 'id',
      dataType: 'int',
      primaryKey: true
    },
    {
      name: 'nombre',
      dataType: 'varchar(100)',
      notNull: true
    },
    {
      name: 'fechaInicio',
      dataType: 'date'
    },
    {
      name: 'tipoEmpresa',
      dataType: 'int'
    },
    {
      name: 'tipoSociedad',
      dataType: 'int'
    },
    {
      name: 'fechaConstitucion',
      dataType: 'date'
    }
  ],

  foreignKeys: [
    {
      table: 'entidad',
      columns: [ 'id' ],
      refColumns: [ 'id' ]
    },
    {
      table: 't_empresa',
      columns: [ 'tipoEmpresa' ],
      refColumns: [ 'id' ]
    },
    {
      table: 't_sociedad',
      columns: [ 'tipoSociedad' ],
      refColumns: [ 'id' ]
    }
  ]
});

module.exports.table = table;


function addEmpresa(empresa, client) {

  function addDatosBasicos(empresa) {
    let query = table.insert(
      table.id.value(empresa.id),
      table.nombre.value(empresa.nombre),
      table.fechaInicio.value(empresa.fechaInicio),
      table.fechaConstitucion.value(empresa.fechaConstitucion),
      table.tipoEmpresa.value(empresa.tipoEmpresa),
      table.tipoSociedad.value(empresa.tipoSociedad)
    )
    .returning(
      table.id, table.nombre, table.fechaInicio,
      table.fechaConstitucion, table.tipoEmpresa,
      table.tipoSociedad
    )
    .toQuery();

    return connector.execQuery(query, client);
  }

  return Entidad.addEntidad({
    tipo: empresa.tipo,
    cuit: empresa.cuit,
    condafip: empresa.condafip,
    domicilioReal: empresa.domicilioReal,
    domicilioProfesional: empresa.domicilioProfesional,
    domicilioConstituido: empresa.domicilioConstituido
  }, client)
  .then(entidad => {
    empresa.id = entidad.id;
    return addDatosBasicos(empresa)
          .then(r => {
            let empresa_added = r.rows[0];

            let proms_contactos = empresa.contactos.map(c => {
              c.entidad = empresa_added.id;
              return Contacto.addContacto(c, client);
            });

            let proms_representantes = empresa.representantes ?
              empresa.representantes.map(r => EmpresaRepresentante.add({
                empresa: empresa_added.id,
                matricula: r,
                fechaInicio: r.fechaInicio ? r.fechaInicio : moment(),
                fechaFin: r.fechaFin ? r.fechaFin : null
              }, client))
              : [];

              let proms_incumbencias = empresa.incumbencias ? 
                empresa.incumbencias.map(i => EmpresaIncumbencia.add({
                  idEmpresa: empresa_added.id,
                  incumbencia: i
                }), client)
              : [];

            return Promise.all([
              Promise.all(proms_contactos),
              Promise.all(proms_representantes),
              Promise.all(proms_incumbencias)
            ])
            .then(([contactos, representantes, incumbencias]) => {
              empresa_added.contactos = contactos;
              empresa_added.representantes = representantes;
              empresa_added.incumbencias = incumbencias;
              return empresa_added;
            });
          });
  })
}

module.exports.addEmpresa = addEmpresa;

module.exports.add = function(empresa) {
  return new Promise(function(resolve, reject) {
    connector
    .beginTransaction()
    .then(connection => {
      addEmpresa(empresa, connection.client)
        .then(empresa_added => {
          connector
          .commit(connection.client)
          .then(r => {
            connection.done();
            resolve(empresa_added);
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
table.nombre, table.fechaInicio,
table.fechaConstitucion,
TipoEmpresa.table.valor.as('tipoEmpresa'),
TipoSociedad.table.valor.as('tipoSociedad'),
TipoCondicionAfip.table.valor.as('condafip'),
Entidad.table.cuit,
Entidad.table.domicilioReal.as('domicilioReal'),
Entidad.table.domicilioProfesional.as('domicilioProfesional'),
Entidad.table.domicilioConstituido.as('domicilioConstituido')
];
const select_from = table.join(Entidad.table).on(table.id.equals(Entidad.table.id))
                         .join(TipoCondicionAfip.table).on(Entidad.table.condafip.equals(TipoCondicionAfip.table.id))
                         .join(TipoEmpresa.table).on(table.tipoEmpresa.equals(TipoEmpresa.table.id))
                         .join(TipoSociedad.table).on(table.tipoSociedad.equals(TipoSociedad.table.id))

module.exports.getAll = function() {
  let empresas = [];
  let query = table.select(...select_atributes)
  .from(select_from)
  .toQuery();

  return connector.execQuery(query)
  .then(r => {
    empresas = r.rows;
    let proms = []
    for(let empresa of empresas) {
      proms.push(getDatosEmpresa(empresa));
    }
    return Promise.all(proms);
  })
  .then(rs => {
    rs.forEach((value, index) => {
      [ domicilioReal, domicilioProfesional, domicilioConstituido, 
        contactos, incumbencias, representantes ] = value;
      empresas[index].domicilioReal = domicilioReal;
      empresas[index].domicilioProfesional = domicilioProfesional;
      empresas[index].domicilioConstituido = domicilioConstituido;
      empresas[index].contactos = contactos;
      empresas[index].incumbencias = incumbencias;
      empresas[index].representantes = representantes;
    });
    return empresas;
  })
}


function getDatosEmpresa(empresa) {
  return Promise.all([
      Domicilio.getDomicilio(empresa.domicilioReal),
      Domicilio.getDomicilio(empresa.domicilioProfesional),
      Domicilio.getDomicilio(empresa.domicilioConstituido),
      Contacto.getAll(empresa.id),
      EmpresaIncumbencia.getAll(empresa.id),
      EmpresaRepresentante.getAll(empresa.id)
    ]);
}

module.exports.get = function(id) {
  let empresa = {};
  let query = table.select(...select_atributes)
  .from(select_from)
  .where(table.id.equals(id))
  .toQuery();

  return connector.execQuery(query)
  .then(r => {
    empresa = r.rows[0];
    return getDatosEmpresa(empresa);
  })
  .then(([ domicilioReal, domicilioProfesional, domicilioConstituido, 
           contactos, incumbencias, representantes ]) => {
      empresa.domicilioReal = domicilioReal;
      empresa.domicilioProfesional = domicilioProfesional;
      empresa.domicilioConstituido = domicilioConstituido;
      empresa.contactos = contactos;
      empresa.incumbencias = incumbencias;
      empresa.representantes = representantes;
      return empresa;
  });
}


module.exports.edit = function (id, empresa, client) {
  return Entidad.edit(id, {
    cuit: empresa.cuit,
    condafip: empresa.condafip,
    domicilioReal: empresa.domicilioReal,
    domicilioProfesional: empresa.domicilioProfesional,
    domicilioConstituido: empresa.domicilioConstituido
  }, client)
    .then(r => {
      let query = table.update({
        nombre: empresa.nombre,
        fechaInicio: empresa.fechaInicio,
        fechaConstitucion: empresa.fechaConstitucion,
        tipoEmpresa: empresa.tipoEmpresa,
        tipoSociedad: empresa.tipoSociedad
      })
      .where(table.id.equals(id))
      .toQuery();

      return Promise.all([
        Contacto.getAll(empresa.id),
        EmpresaRepresentante.getAll(empresa.id),
        EmpresaIncumbencia.getAll(empresa.id)
      ])
        .then(([contactos, representantes, incumbencias]) => {
          return connector.execQuery(query, client)
            .then(r => {

              let proms_contactos = [];
              for (let c of empresa.contactos) {
                if (!c.id) {
                  c.entidad = id;
                  proms_contactos.push(Contacto.addContacto(c, client));
                }
              }

              //BUSCO LOS CONTACTOS QUE YA NO ESTAN EN LA LISTA PARA BORRARLOS
              for (let contacto of contactos) {
                if (!empresa.contactos.find(c => c.id && c.id == contacto.id))
                  proms_contactos.push(Contacto.delete(contacto.id, client));
              }

              let proms_representantes = [];
              for (let r of empresa.representantes) {
                if (!r.id) {
                  proms_representantes.push(EmpresaRepresentante.add({ 
                    idEmpresa: id, 
                    idMatricula: r.matricula,
                    fechaInicio: r.fechaInicio ? r.fechaInicio : moment(),
                    fechaFin: r.fechaFin ? r.fechaFin : null                    
                   }, client));
                }
              }

              for (let representante of representantes) {
                if (!empresa.representantes.find(c => c.id && c.id == representante.id))
                  proms_representantes.push(EmpresaRepresentante.delete(representante.id, client));
              }

              let proms_incumbencias = [];
              for (let i of empresa.incumbencias) {
                if (!i.id) {
                  proms_incumbencias.push(EmpresaIncumbencia.add({ 
                    empresa: id, 
                    incumbencia: i,
                   }, client));
                }
              }

              for (let incumbencia of incumbencias) {
                if (!empresa.incumbencias.find(c => c.id && c.id == incumbencia.id))
                  proms_incumbencias.push(EmpresaIncumbencia.delete(incumbencia.id, client));
              }


              return Promise.all([
                Promise.all(proms_formaciones),
                Promise.all(proms_representantes),
                Promise.all(proms_incumbencias)
              ])
                .then(rs => id);
            })
        })
    })
}