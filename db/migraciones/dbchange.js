const moment = require('moment');
const fs = require('fs');
const path = require('path');
const model = require(`../../model`);
const db = require(`../index`);
const argv = require('minimist')(process.argv.slice(2));

let creates = [];
let alters = {
    add: [],
    alter: [],
    keys: [],
    drop: []
}
let drops = [];

if (process.argv.slice(2).length == 0) {
    console.log(`Comando que funciona para ver los cambios del esquema en el proyecto con el esquema de la base de datos.

    Parámetros:

    * -f o --file para especificar el archivo .sql de la migración siguiente. Si están ambos, -f tiene prioridad.
    * -t para imprimir cambios directamente en la terminal. Tiene prioridad -f si están ambos.

    Ej.

    node dbchange.js -f archivo.sql
    
    o también

    npm run dbchange -- -f archivo.sql
    `)
}
else {
    let file_name = argv.f || (argv.file || null);
    init(file_name)
    .then(([file, tables_bd]) => {

        function checkTypes(column, column_bd) {
            if (column.dataType == 'serial' && !(column_bd.type == 'integer')) {
                alters.alter.push(`ALTER TABLE "${column.table._name}" ALTER COLUMN "${column.name}" TYPE integer USING "${column.name}"::integer`);
                alters.alter.push(`CREATE SEQUENCE "${column.table._name}_${column.name}_seq";`);
                return alters.alter.push(`ALTER SEQUENCE "${column.table._name}_${column.name}_seq" OWNED BY "${column.table._name}.${column.name}";`);
            }

            if (column.dataType == 'float' && !(column_bd.type == 'double precision'))
                return alters.alter.push(`ALTER TABLE "${column.table._name}" ALTER COLUMN "${column.name}" TYPE double precision USING "${column.name}"::double precision`);
            else if (column_bd.type == 'double precision') return;

            if (column.dataType == 'int' && !(column_bd.type == 'integer'))
                return alters.alter.push(`ALTER TABLE "${column.table._name}" ALTER COLUMN "${column.name}" TYPE integer USING "${column.name}"::integer`);
            else if (column_bd.type == 'integer') return;

            if (column.dataType.toLowerCase().includes('varchar') && !(column_bd.type == "character varying"))
                return alters.alter.push(`ALTER TABLE "${column.table._name}" ALTER COLUMN "${column.name}" TYPE ${column.dataType} USING "${column.name}"::${column.dataType}`);
            else if (column_bd.type == "character varying") {
                let longitud = +column.dataType.match(/\d+/)[0];
                if (longitud != column_bd.length)
                return alters.alter.push(`ALTER TABLE "${column.table._name}" ALTER COLUMN "${column.name}" TYPE ${column.dataType} USING "${column.name}"::${column.dataType}`);
                else return;
            }
            
            if (column.dataType == 'timestamptz' && !(column_bd.type == 'timestamp with time zone'))
                return alters.alter.push(`ALTER TABLE "${column.table._name}" ALTER COLUMN "${column.name}" TYPE ${column.dataType} USING "${column.name}"::${column.dataType}`);
            else if (column_bd.type == 'timestamp with time zone') return;

            if (column.dataType == 'timestamp' && !(column_bd.type == 'timestamp without time zone'))
                return alters.alter.push(`ALTER TABLE "${column.table._name}" ALTER COLUMN "${column.name}" TYPE ${column.dataType} USING "${column.name}"::${column.dataType}`);
            else if (column_bd.type == 'timestamp without time zone') return;

            if (column.dataType != column_bd.type) {
                return alters.alter.push(`ALTER TABLE "${column.table._name}" ALTER COLUMN "${column.name}" TYPE ${column.dataType} USING "${column.name}"::${column.dataType}`);
            }
        }

        function checkForeignKeys(tablename, foreignKeys, constraints_bd) {
            for(let fkey of foreignKeys) {
                let fkey_name = `${tablename}_${fkey.columns[0]}_fkey`;
                let constraint_fkey = constraints_bd.find(k => k.name == fkey_name);
                if (!constraint_fkey)
                    alters.keys.push(`ALTER TABLE "${tablename}" ADD FOREIGN KEY("${fkey.columns[0]}") REFERENCES ${fkey.table}("${fkey.refColumns[0]}")`
                        + (fkey.onDelete ? ` ON DELETE ${fkey.onDelete} ` : '')
                        + (fkey.onUpdate ? ` ON UPDATE ${fkey.onUpdate} ` : '')
                    );
                else if ((fkey.onDelete && fkey.onDelete.toUpperCase() != constraint_fkey.on_delete) || (fkey.onUpdate && fkey.onUpdate.toUpperCase() != constraint_fkey.on_update)){
                    let query_chg = `ALTER TABLE ${tablename} DROP CONSTRAINT "${constraint_fkey.name}";\n`;
                    query_chg += `ALTER TABLE ${tablename} ADD FOREIGN KEY ("${fkey.columns[0]}") REFERENCES ${fkey.table}("${fkey.refColumns[0]}")`;
                    if (fkey.onDelete && fkey.onDelete.toUpperCase() != constraint_fkey.on_delete) query_chg += ` ON DELETE ${fkey.onDelete.toUpperCase()} `;
                    if (fkey.onUpdate && fkey.onUpdate.toUpperCase() != constraint_fkey.on_update) query_chg += ` ON UPDATE ${fkey.onUpdate.toUpperCase()} `;
                    alters.keys.push(query_chg);
                }
            }
        }

        function checkUniqueKeys(table, constraints_bd) {
            for(let column of table.columns) {
                if (column.unique) {
                    let uniquekey_name = `${table._name}_${column.name}_key`;
                    let constraint_uniquekey = constraints_bd.find(k => k.name == uniquekey_name);
                    if (!constraint_uniquekey)
                        alters.keys.push(`ALTER TABLE "${table._name}" ADD CONSTRAINT "${uniquekey_name}" UNIQUE ("${column.name}")`);
                }
            }
        }

        function checkColumn(column, column_bd) {
            checkTypes(column, column_bd);

            if (column.notNull && column_bd.nullable)
                alters.alter.push(`ALTER TABLE "${column.table._name}" ALTER COLUMN "${column.name}" SET NOT NULL`);
            else if (!column.dataType == 'serial' && !column.notNull && !column_bd.nullable)
                alters.alter.push(`ALTER TABLE "${column.table._name}" ALTER COLUMN "${column.name}" DROP NOT NULL`);

            if (column.dataType != 'serial') {
                let def_value = column.defaultValue
                // typeof column.defaultValue == 'string' ? `'${column.defaultValue}'` : column.defaultValue;
                
                if (!column_bd.default) def_db_value = null;
                else if (column_bd.type == 'boolean') def_db_value = (column_bd.default === 'true');
                else if (column_bd.type == 'integer') def_db_value = parseInt(column_bd.default);
                else if (column_bd.type == 'double precision') def_db_value = parseFloat(column_bd.default);
                else if (column_bd.type.includes('character')) def_db_value = column_bd.default.replace(/\:\:.+$/, '');
                else if (column_bd.type.includes('timestamp')) {
                    def_db_value = column_bd.default.replace("('now'::text)::date", 'current_date');
                }


                if (column.defaultValue != undefined && column_bd.default == null) 
                    alters.alter.push(`ALTER TABLE "${column.table._name}" ALTER COLUMN "${column.name}" SET DEFAULT ${def_value}`);
                else if (column.defaultValue == undefined && column_bd.default != null)
                    alters.alter.push(`ALTER TABLE "${column.table._name}" ALTER COLUMN "${column.name}" DROP DEFAULT`);
                else if (column.defaultValue != undefined && column_bd.default != null && column.defaultValue != def_db_value) {
                    if (def_db_value != null && def_db_value.toString().toLowerCase() != column.defaultValue.toString().toLowerCase())
                        alters.alter.push(`ALTER TABLE "${column.table._name}" ALTER COLUMN "${column.name}" SET DEFAULT ${def_value}`);
                    else if (def_db_value == null) 
                        alters.alter.push(`ALTER TABLE "${column.table._name}" ALTER COLUMN "${column.name}" SET DEFAULT ${def_value}`);
                }
            }
        }

        function checkColumns(table, table_bd) {
            for (let column of table.columns) {
                let column_bd = table_bd.columns.find(c => c.name == column.name);
                if (!column_bd)  {
                    let query = table.alter().addColumn(column);
                    if (column.defaultValue) query += ` DEFAULT '${column.defaultValue}' `;
                    alters.add.push(query);
                }
                else {
                    checkColumn(column, column_bd);
                    column_bd.checked = true;
                }
            }
            for (let column_bd of table_bd.columns.filter(c => !c.checked)) {
                alters.drop.push(`ALTER TABLE "${table_bd.name}" DROP COLUMN "${column_bd.name}"`);
            }
        }

        function checkTable(table) {
            let table_bd = tables_bd.find(t => t.name == table._name);
            if (!table_bd) creates.push(table.create().ifNotExists().toQuery().text);
            else {
                checkColumns(table, table_bd);
                checkForeignKeys(table._name, table.foreignKeys, table_bd.constraints);
                checkUniqueKeys(table, table_bd.constraints);
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
            if (table_bd.name != 'migrations') drops.push(`DROP TABLE IF EXISTS "${table_bd.name}"`);
        }

        addQuerys(file, 'SENTENCIAS DE CREACION DE TABLAS', creates)
        .then(() => addQuerys(file, 'SENTENCIAS DE ALTERACION DE TABLAS: ALTERACION DE COLUMNAS', alters.alter))
        .then(() => addQuerys(file, 'SENTENCIAS DE ALTERACION DE TABLAS: NUEVAS COLUMNAS', alters.add))
        .then(() => addQuerys(file, 'SENTENCIAS DE ALTERACION DE TABLAS: FOREIGN KEYS', alters.keys))
        .then(() => addQuerys(file, 'SENTENCIAS DE ALTERACION DE TABLAS: ELIMINACION DE COLUMNAS', alters.drop))
        .then(() => addQuerys(file, 'SENTENCIAS DE ELIMINACION DE TABLAS', drops))
        .then(() => process.exit());
    })
    .catch(e => console.error(e));
}


function init(file_name) {
    function setFile(file_name) {
        if (!file_name) return Promise.resolve();
        else return openFile(file_name);

    }

    let file;

    return setFile(file_name)
    .then(open_file => {
        file = open_file
        return db.schema.getTables();
    })
    .then(tables => [file, tables]);
}


function openFile(file, content) {
    return new Promise(function(resolve, reject) {
        fs.open(file, 'a', (err, fd) => {
            if (err) reject(err);
            else {
                if (content) {
                    fs.appendFile(file, content, (err) => {
                        if (err) reject(err);
                        else resolve(fd);
                    });
                }
                else resolve(fd);
            }
        });
    })
}

function addQuerys(file, titulo, sentencias) {
    if (!sentencias.length) return Promise.resolve();
    let querys = `\n\n /*    ${titulo}   */\n\n` + sentencias.map(s => s+';').join('\n');

    if (!file) {
        console.log(querys);
        return Promise.resolve();
    }
    else return new Promise(function(resolve, reject) {
        fs.appendFile(file, querys, (err) => {
            if (err) reject(err);
            else resolve();
        });
    });
}