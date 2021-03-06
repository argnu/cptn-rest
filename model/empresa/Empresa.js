const dot = require('dot-object');
const moment = require('moment');
const sql = require('node-sql-2');
sql.setDialect('postgres');

const utils = require(`../../utils`);
const connector = require(`../../db/connector`);
const EntidadDomicilio = require(`../EntidadDomicilio`);
const EntidadCondicionAfip = require('../EntidadCondicionAfip');
const Entidad = require(`../Entidad`);
const Contacto = require(`../Contacto`);
const TipoEmpresa = require(`../tipos/TipoEmpresa`);
const TipoSociedad = require(`../tipos/TipoSociedad`);
const TipoCondicionAfip = require(`../tipos/TipoCondicionAfip`);
const EmpresaRepresentante = require('./EmpresaRepresentante');
const EmpresaIncumbencia = require('./EmpresaIncumbencia');


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

module.exports.add = function(empresa, client) {
  function addDatosBasicos(empresa) {
    let query = table.insert(
      table.id.value(empresa.id),
      table.nombre.value(empresa.nombre),
      table.fechaInicio.value(utils.checkNull(empresa.fechaInicio)),
      table.fechaConstitucion.value(utils.checkNull(empresa.fechaConstitucion)),
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

  return Entidad.add({
    tipo: empresa.tipo,
    cuit: empresa.cuit,
    domicilios: empresa.domicilios,
    condiciones_afip: empresa.condiciones_afip
  }, client)
  .then(entidad => {
    empresa.id = entidad.id;
    return addDatosBasicos(empresa, client)
          .then(r => {
            let empresa_added = r.rows[0];

            let proms_contactos = empresa.contactos.map(c => {
              c.entidad = empresa_added.id;
              return Contacto.add(c, client);
            });

            let proms_incumbencias =  empresa.incumbencias.map(i => EmpresaIncumbencia.add({
              empresa: empresa_added.id,
              incumbencia: i
            }, client));

            let proms_representantes = empresa.representantes
            .map(r => { 
              r.empresa = empresa_added.id;
              EmpresaRepresentante.add(r, client)
            });

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


const select = [
  table.id,
  table.nombre,
  table.fechaInicio.cast('varchar(10)'),
  table.fechaConstitucion.cast('varchar(10)'),
  Entidad.table.tipo,
  TipoEmpresa.table.id.as('tipoEmpresa.id'),
  TipoEmpresa.table.valor.as('tipoEmpresa.valor'),
  TipoSociedad.table.id.as('tipoSociedad.id'),
  TipoSociedad.table.valor.as('tipoSociedad.valor'),
  Entidad.table.cuit
];

const from = table.join(Entidad.table).on(table.id.equals(Entidad.table.id))
.leftJoin(TipoEmpresa.table).on(table.tipoEmpresa.equals(TipoEmpresa.table.id))
.leftJoin(TipoSociedad.table).on(table.tipoSociedad.equals(TipoSociedad.table.id))

module.exports.getAll = function(params) {
  let empresas = [];
  let query = table.select(select).from(from)

  if (params.limit) query.limit(+params.limit);
  if (params.limit && params.offset) query.offset(+params.offset);

  return connector.execQuery(query.toQuery())
  .then(r => {
    empresas = r.rows.map(row => dot.object(row));
    let proms = []
    for(let empresa of empresas) {
      proms.push(getDatosEmpresa(empresa));
    }
    return Promise.all(proms);
  })
  .then(rs => {
    rs.forEach((value, index) => {
      [ domicilios, condiciones_afip, contactos, incumbencias, representantes ] = value;
      empresas[index].domicilios = domicilios;
      empresas[index].contactos = contactos;
      empresas[index].incumbencias = incumbencias;
      empresas[index].condiciones_afip = condiciones_afip;
      empresas[index].representantes = representantes;
    });
    return empresas;
  })
}


function getDatosEmpresa(empresa) {
  return Promise.all([
      EntidadDomicilio.getByEntidad(empresa.id),
      EntidadCondicionAfip.getByEntidad(empresa.id),
      Contacto.getAll(empresa.id),
      EmpresaIncumbencia.getByEmpresa(empresa.id),
      EmpresaRepresentante.getAll(empresa.id)
    ]);
}

module.exports.get = function(id) {
  let empresa;
  let query = table.select(select)
                  .from(from)
                  .where(table.id.equals(id))
                  .toQuery();

  return connector.execQuery(query)
  .then(r => {
    empresa = dot.object(r.rows[0]);
    return getDatosEmpresa(empresa);
  })
  .then(([ domicilios, condiciones_afip, contactos, incumbencias, representantes ]) => {
      empresa.domicilios = domicilios;
      empresa.contactos = contactos;
      empresa.condiciones_afip = condiciones_afip;
      empresa.incumbencias = incumbencias;
      empresa.representantes = representantes;
      return empresa;
  })
  .catch(e => {
    console.error(e);
    return Promise.reject(e);
  })
}


module.exports.edit = function (id, empresa, client) {
  return Entidad.edit(id, {
    cuit: empresa.cuit,
    domicilios: empresa.domicilios,
    condiciones_afip: empresa.condiciones_afip
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

      return connector.execQuery(query, client)
        .then(r => {
          let contactos_nuevos = empresa.contactos.filter(c => !c.id);
          let contactos_existentes = empresa.contactos.filter(c => !!c.id);
          let representantes_nuevos = empresa.representantes.filter(r => !r.id);
          let representantes_existentes = empresa.representantes.filter(r => !!r.id);

          return Promise.all([
            connector.execQuery(
              Contacto.table.delete().where(
                Contacto.table.entidad.equals(id)
                .and(Contacto.table.id.notIn(contactos_existentes.map(c => c.id)))
              ).toQuery(), client),

            connector.execQuery(
              EmpresaRepresentante.table.delete().where(
                EmpresaRepresentante.table.empresa.equals(id)
                .and(EmpresaRepresentante.table.id.notIn(representantes_existentes.map(r => r.id)))
            ).toQuery(), client),

            connector.execQuery(
              EmpresaIncumbencia.table.delete().where(EmpresaIncumbencia.table.empresa.equals(id)).toQuery(),
              client
            )
          ])
          .then(r => {
            let proms_contactos_nuevos = contactos_nuevos.map(c => {
              c.entidad = id;
              return Contacto.add(c, client);
            });

            let proms_contactos_edit = contactos_existentes.map(c => Contacto.edit(c.id, c, client));

            let proms_incumbencias =  empresa.incumbencias.map(i => EmpresaIncumbencia.add({
              empresa: id,
              incumbencia: i
            }, client));

            let proms_representantes = representantes_nuevos.map(r => {
              r.empresa = id;
              return  EmpresaRepresentante.add(r, client);
            });

            let proms_representantes_existentes = representantes_existentes.map(r => {
              return  EmpresaRepresentante.edit(r.id, r, client)
            });

            return Promise.all([
              Promise.all(proms_contactos_nuevos),
              Promise.all(proms_contactos_edit),
              Promise.all(proms_incumbencias),
              Promise.all(proms_representantes),
              Promise.all(proms_representantes_existentes)
            ])
            .then(rs => id);
          })
        })
    })
}