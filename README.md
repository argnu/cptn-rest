## TODO
* Ajustar correctamente los id's en table condafip.
* Ver cómo guardar imagenes en postgres:
  - Profesional: fotoarchivo, firma.

## Examples

### config.private

```javascript
 module.exports = {
  entry: {
    host: 'localhost',
    port: 3400
  },
  db: {
    user: '',
    host: '',
    database: 'cptn',
    password: '',
    port: 5432,
  },
  dbMssql: {
    user: '',
    password: '',
    server: '',
    database: '',
    port: 1433,
    requestTimeout: 190000,
    stream: true,
  }
}

```
