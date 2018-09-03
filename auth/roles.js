const { AbilityBuilder } = require('@casl/ability')

const admin = AbilityBuilder.define(can => {
  can('manage', 'all')
})

const anonimo = AbilityBuilder.define(can => {
  can('read', 'Matricula')
})

const usuario_cptn = AbilityBuilder.define(can => {
  can('read', 'all')
  can('manage', 'Solicitud')
  can('manage', 'Profesional')
  can('manage', 'Matricula')
  can('manage', 'Legajo')
  can('manage', 'Boleta')
  can('manage', 'Comprobante')
  can('manage', 'VolantePago'),
  can('manage', 'SolicitudSuspension')
})

module.exports = { admin, usuario_cptn, anonimo }
