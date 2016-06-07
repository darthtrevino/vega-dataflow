// Hash that tracks modifications to assigned values
// Callers *must* use the set method to update values
export default function Parameters() {
  Object.defineProperty(this, '__mod__', {writable:true, value: {}});
}

var prototype = Parameters.prototype;

function key(name, index) {
  return (index >= 0 ? index + ':' : '') + name;
}

prototype.set = function(name, index, value, force) {
  var o = this,
      v = o[name],
      mod = o.__mod__;

  if (index >= 0) {
    if (v[index] !== value || force) {
      v[index] = value;
      mod[key(name, index)] = 1;
      mod[name] = 1;
    }
  } else if (v !== value || force) {
    o[name] = value;
    mod[name] = 1;
  }
};

prototype.modified = function(name, index) {
  var mod = this.__mod__, k;
  if (!arguments.length) {
    for (k in mod) { if (mod[k]) return 1; }
    return 0;
  } else if (Array.isArray(name)) {
    for (k=0; k<name.length; ++k) {
      if (mod[name[k]]) return 1;
    }
    return 0;
  }
  return mod[key(name, index)];
};

prototype.clear = function() {
  this.__mod__ = {};
};
