## Deploy

### 1- Clonar repositorio

`git clone https://github.com/argnu/cptn-rest`

### 2- Instalar dependencias

`npm install`

### 3- Configurar Base de datos PostgreSQL

#### a) Si la base de datos no existe crearla y restaurar backup:

* `pg_restore --no-privileges --no-owner -n public  -d basededatos -U usuario archivodebackup`

* En caso de que la base sea una migración de la base de datos CPAGIN, es necesario configurar 
valores iniciales:

`psql -d basededatos -U usuario -f add_values.sql`

`npm run addinvitado`

`node tasks/addusuarios.js`


#### b) Si la base de datos existe es necesario realizar los cambios de esquema:

* `npm run genchange`:  para generar el script .sql de cambios. Se creará una nueva carpeta dentro de 
la carpeta **esquema_cambios** con la fecha del día y cuyo contenido será el script .sql.

* `psql -d basededatos -U usuario -f script.sql`: para ejecutar los cambios de esquema en la base de datos.


### 4- Configurar API

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


## Backup

`pg_dump -d $DB -U $USUARIO -F c -f "./backup"`


## Migraciones

Para que funcionen las migraciones de esquema debe existir una archivo llamado `database.json`en la carpeta `db/migraciones/database.json`, con el siguiente contenido:

`{
    "sql-file": true,
    "migrations-dir": "db/migraciones/files",
    "defaultEnv": "dev",
    "dev": "postgres://mweingart:mwei090@localhost/cptn"
}`