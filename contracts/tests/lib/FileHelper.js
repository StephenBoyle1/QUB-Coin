function FileHelper(){
}

FileHelper.prototype.readFile = function(fileName) {
  var fs = require('fs');
  return fs.readFileSync(fileName, 'utf8');
};

module.exports = FileHelper;
