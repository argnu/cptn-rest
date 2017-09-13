const config = require('../config.private');
const sql = require('mssql');

module.exports.consultaSql = function (consulta, offset, limit) {
    return sql.connect(config.dbMssql)
           .then(r => {
             return new sql.Request()
                 .input('offset', offset)
                 .input('limit', limit)
                 .query(consulta)
                 .then(listaRow => {
                     sql.close();
                     return listaRow;
                 })
                 .catch(error => {
                     sql.close();
                     console.log('Error en sql server', error);
                     throw Error(error);
                 });
           });
};


module.exports.countSql = function (query) {
   return sql.connect(config.dbMssql)
           .then(r => {
              return new sql.Request()
                .query(query)
                .then(res => {
                    sql.close();
                    if (res && res.recordset && res.recordset.length) {
                        return res.recordset;
                    } else {
                        return [];
                    }
                })
                .catch(error => {
                    console.log('Error', error);
                    sql.close();
                    throw Error(error);
                })
        });
};
