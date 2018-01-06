const moment = require('moment');
const fs = require('fs');
const path = require('path');
global.__base = path.join(__dirname, '..');
const connector = require(`${__base}/connector`);
const model = require(`${__base}/model`);

function getConstraints(tablename) {
    let sql = `SELECT constraint_name as name, constraint_type as type 
               FROM information_schema.table_constraints
               WHERE table_name = '${tablename}'`;

    return connector.execRawQuery(sql)
        .then(result => result.rows);
}

function getColumns(tablename) {
    let sql = `SELECT column_name as name, is_nullable, data_type as type, character_maximum_length as length, column_default as default
               FROM information_schema.COLUMNS
               WHERE table_name = '${tablename}'`;

    return connector.execRawQuery(sql)
    .then(result => result.rows);
}

function getTables() {
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


createDir(moment().format('YYYY-DD-MM'))
.then(dirname => Promise.all([openFile(path.join(dirname, 'cambios_bd.sql')), getTables()]))
.then(([file, tables_bd]) => {

    function checkTypes(column, column_bd) {
        if (column.dataType == 'serial') return; //POR EL MOMENTO LOS AUTOINCREMENT NO LOS TOCO
        
        if (column.dataType == 'float' && !column_bd.type == 'double precision') 
            addQuery(file, `ALTER TABLE "${column.table._name}" ALTER COLUMN "${column.name}" TYPE double precision USING "${column.name}"::double precision`);

        if (column.dataType == 'int' && !column_bd.type == 'integer') 
            addQuery(file, `ALTER TABLE "${column.table._name}" ALTER COLUMN "${column.name}" TYPE integer USING "${column.name}"::integer`);

        if (column.dataType.toLowerCase().includes('varchar') && !column_bd.type == "character varying")
            addQuery(file, `ALTER TABLE "${column.table._name}" ALTER COLUMN "${column.name}" TYPE ${column.dataType} USING "${column.name}"::${column.dataType}`);

        if (column.dataType.toLowerCase().includes('varchar') && column_bd.type == "character varying") {
            let longitud = +column.dataType.match(/\d+/)[0];
            if (longitud != column_bd.length) 
               addQuery(file, `ALTER TABLE "${column.table._name}" ALTER COLUMN "${column.name}" TYPE ${column.dataType} USING "${column.name}"::${column.dataType}`);
        }

        if (column.dataType != column_bd.type)
            addQuery(file, `ALTER TABLE "${column.table._name}" ALTER COLUMN "${column.name}" TYPE ${column.dataType} USING "${column.name}"::${column.dataType}`);
    }

    function checkForeignKeys(tablename, foreignKeys, constraints_bd) {
        for(let fkey of foreignKeys) {
            let fkey_name = `${tablename}_${fkey.columns[0]}_fkey`;
            if (!constraints_bd.find(k => k.name == fkey_name)) 
                addQuery(file, `ALTER TABLE "${tablename}" ADD FOREIGN KEY("${fkey.columns[0]}") REFERENCES ${fkey.table}("${fkey.refColumns[0]}")`);
        }
    }

    function checkColumn(column, column_bd) {
        checkTypes(column, column_bd);

        if (column.notNull && column_bd.nullable)
            addQuery(file, `ALTER TABLE "${column.table._name}" ALTER COLUMN "${column.name}" SET NOT NULL`);
        else if (!column.dataType == 'serial' && !column.notNull && !column_bd.nullable)
            addQuery(file, `ALTER TABLE "${column.table._name}" ALTER COLUMN "${column.name}" DROP NOT NULL`);
        
    }

    function checkColumns(table, table_bd) {
        for (let column of table.columns) {
            let column_bd = table_bd.columns.find(c => c.name == column.name);
            if (!column_bd) addQuery(file, table.alter().addColumn(column));
            else { 
                checkColumn(column, column_bd);
                column_bd.checked = true;
            }
        }
        for (let column_bd of table_bd.columns.filter(c => !c.checked)) {
            addQuery(file, `ALTER TABLE "${table_bd.name}" DROP COLUMN "${column_bd.name}"`);
        }        
    }

    function checkTable(table) {
        let table_bd = tables_bd.find(t => t.name == table._name);
        if (!table_bd) addQuery(file, table.create().toQuery().text);
        else {
            checkColumns(table, table_bd);
            checkForeignKeys(table._name, table.foreignKeys, table_bd.constraints);
            table_bd.checked = true;
        }
        
    }

    function checkModel(model) {
        for (let table in model) {
            if (typeof model[table].table == 'object') checkTable(model[table].table);
            else checkModel(model[table])
        }
    }

    checkModel(model);
    for(let table_bd of tables_bd.filter(t => !t.checked)) {
        addQuery(file, `DROP TABLE "${table_bd.name}"`);
    }
    process.exit();
})
.catch(e => console.error(e));


function createDir(name) {
    let newdir_name = path.join(__dirname, name);
    if (fs.existsSync(newdir_name)) return Promise.resolve(newdir_name);

    return new Promise(function(resolve, reject) {
        
        fs.mkdir(newdir_name, (err) => {
            if (err) reject(err);
            else resolve(newdir_name);
        });    
    })
}

function openFile(file) {
    return new Promise(function(resolve, reject) {
        fs.open(file, 'w+', (err, fd) => {
            if (err) reject(err);
            else resolve(fd);
        });            
    })
}

function addQuery(file, query) {
    return new Promise(function(resolve, reject) {
        fs.appendFile(file, query + ';\n', (err) => {
            if (err) reject(err);
            else resolve(query + ';\n');
        });
    });
}

