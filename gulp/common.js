config = require('../config.json');
buildDir = './build';

Array.prototype.contains = function(obj) {
  var i = this.length;
  while (i--) {
    if (this[i] === obj) {
      return true;
    }
  }
  return false;
};

Array.prototype.cmd = function() {
  if (Object.keys(config.paths).contains(this[0])) {
    this[0] = config.paths[this[0]];
  }
  return this.join(' ');
};

getFolders = function(dir) {
  return fs.readdirSync(dir).filter(function(file) {
    return fs.statSync(path.join(dir, file)).isDirectory();
  });
};

savefile = function(filename, string) { fs.writeFileSync(filename, string); };
