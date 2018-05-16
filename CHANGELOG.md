# 1.5.0 (2018-04-03)

- Nuevas entidades y cambios para gestión de instituciones y títulos.
- Nuevas rutas para titulos, instituciones y usuarios.
- Nuevas entidades y cambios para registrar historial de matrícula.

# 1.4.0 (2018-02-14)

## Modificado

- **Formacion**: nuevo campo fechaEmision.

## Agregado:
 - Entidad nueva `EntidadCondicionAfip`.
 - Una `Entidad` puede contener múltiples condiciones impositivas.

## Solucionado

- **Solicitud**: no devolvía bien el objeto resultante del POST.
- Fix en migracion de domicilios (faltaban puntos y coma).

# 1.3.1 (2018-02-15)

## Solucionado
 
- **Legajo**: bug cuando creaba domicilio, chequeaba la `calle` que ya no existe.

# 1.3.0 (2018-02-05)

## Agregado

- **Formacion**: fechaEmision y fechaEgreso.

## Modificado
- **Usuario**: obtención de domicilios de las delegaciones del usuario.

# 1.3.0 (2018-02-05)

## Modificado

- **Solicitud**: edicion de contactos, formaciones, subsidiarios y domicilios existentes.
- **Direccion**: eliminado atributo `numero` y `calle`, cambio por campo generico `direccion`.

## Solucionado

- **PersonaJuridica**: require de `Persona`. 


# 1.2.2 (2018-01-29)

## Solucionado

- **Matricula**: aprobación de matricula setea atributo `eliminado` en `false`.

# 1.2.1 (2018-01-28)

## Solucionado

- **Solicitud**: getAll, filtros de paginación y retorno de `total` y `totalQuery`.


# 1.2.0 (2018-01-28)

## Agregado

-  **Nueva Entidad**: `TipoEstadoSolicitud`.
- **Delegacion**: agregado atributo domicilio, enlace con entidad Domicilio.
- Atributo **eliminado** para `TipoEstadoMatricula` y `Matricula`.

## Modificado

- **Solicitud**: estado es clave foránea a TipoEstadoSolicitud.



# 1.1.0 (2018-01-21)

## Agregado

- **Profesional**:  nuevo atributo booleano `jubilado`.    
- **Nuevas tablas**: `CajaPrevisional` y `ProfesionalCajaPrevisional`
- **Nuevas rutas**: PUT `/profesionales/:_id/(foto | firma)` para cambiar la foto o la firma.
