const db = require('../../db');

db.schema.getTables()
.then(tables => {
    let querys = tables.map(t => `DROP TABLE IF EXISTS ${t.name} CASCADE;`)
    return db.connector.execRawQuerys(querys);
})
.then(r => {
    console.log('Todas las tablas han sido eliminadas!');
    process.exit();
})
.catch(e => {
    console.error(e);
    process.exit();
})