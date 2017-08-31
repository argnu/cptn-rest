//
// function processQuery(query) {
//   let sql_where = "";
//   for(let key in query) {
//     appendWhere(sql_where, `pais=${query}`)
//   }
// }

module.exports.appendWhere = function(query, condition) {
  return (query.includes('WHERE') || query.includes('where')) ?
         query += " AND " + condition :
         query += " WHERE " + condition;
}
