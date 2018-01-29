const connector = require(`./connector`);

function getConstraints(tablename) {
    let sql = `SELECT t.constraint_name as name, t.constraint_type as type, r.update_rule on_update, r.delete_rule on_delete
               FROM information_schema.table_constraints t JOIN information_schema.referential_constraints r
               ON t.constraint_name = r.constraint_name
               WHERE table_name = '${tablename}'`;

    return connector.execRawQuery(sql)
    .then(result => result.rows);
}

module.exports.getConstraints = getConstraints;

function getColumns(tablename) {
    let sql = `SELECT column_name as name, is_nullable, data_type as type, character_maximum_length as length, column_default as default
               FROM information_schema.COLUMNS
               WHERE table_name = '${tablename}'`;

    return connector.execRawQuery(sql)
    .then(result => result.rows);
}

module.exports.getColumns = getColumns;

module.exports.getTables = function() {
    let tables;
    let sql = `SELECT tablename FROM pg_catalog.pg_tables
               WHERE schemaname = 'public'
               ORDER BY tablename`;

    return connector.execRawQuery(sql)
    .then(result => {
        tables = result.rows.map(table => ({ name: table.tablename, columns: [] }));
        return Promise.all(tables.map(table => getColumns(table.name)));
    })
    .then(table_columns => {
        table_columns.forEach((columns, index) => {
            tables[index].checked = false;
            columns.forEach(c => c.checked = false);
            tables[index].columns = columns;
        });
        return Promise.all(tables.map(table => getConstraints(table.name)));
    })
    .then(table_constraints => {
        table_constraints.forEach((constraints, index) => {
            tables[index].constraints = constraints;
        });
        return tables;
    });
}