module.exports.clone = function(obj) {
  return JSON.parse(JSON.stringify(obj));
}

module.exports.checkNull = function(value) {
  return value && value.length ? value : null;
}
