## Deploy

### 1- Clonar repositorio

`git clone https://github.com/argnu/cptn-rest`

### 2- Instalar dependencias

`npm install`

### 3- Crear BD en Postgres

Crear una base de datos y en caso de tener los datos hacer un restore de los datos migrados:

`pg_restore --no-privileges --no-owner -n public  -d basededatos -U usuario archivodebackup`

### 4- Agregar datos extra (valores_globales, estados de boleta, etc.)

Ejecutar el script .sql denominado `add_values.sql`:

`psql -U argnu -d cptn -f add_values.sql`

También restaurar el backup de los valores predeterminados de items que quedó colgado:

`pg_restore --no-privileges --no-owner -n public  -d basededatos -U usuario backupItems?`

### 5- Configurar API

Crear un archivo en la carpeta raíz del proyecto con nombre `config.private` y
el siguiente contenido:

```javascript
 module.exports = {
  entry: {
    host: 'localhost',
    port: 3400
  },
  db: {
    user: '',
    host: '',
    database: '',
    password: '',
    port: 5432,
  },
  secret: 'frase secreta para token jwt'
}
```

### 5- Crear un servicio

Definir un servicio para systemd que ejecute la aplicación, que levante cuando se rompa y que se inicie con el sistema operativo.

Ver enlace: https://blog.codeship.com/running-node-js-linux-systemd/


## Desarrollo

#### Ejemplo archivo de configuración para desarrollo y migración
```javascript
 module.exports = {
  entry: {
    host: 'localhost',
    port: 3400
  },
  db: {
    user: '',
    host: '',
    database: '',
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
