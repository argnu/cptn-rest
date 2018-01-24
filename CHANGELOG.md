# UNRELEASED

## Agregado

-  **Nueva Entidad**: `TipoEstadoSolicitud`.
- **Delegacion**: agregado atributo domicilio, enlace con entidad Domicilio.

## Modificado

- **Solicitud**: estado es clave foránea a TipoEstadoSolicitud.



# 1.1.0 (2018-01-21)

## Agregado

- **Profesional**:  nuevo atributo booleano `jubilado`.    
- **Nuevas tablas**: `CajaPrevisional` y `ProfesionalCajaPrevisional`
- **Nuevas rutas**: PUT `/profesionales/:_id/(foto | firma)` para cambiar la foto o la firma.