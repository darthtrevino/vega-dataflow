import Transform from './Transform';
import {indexarray} from '../util/Arrays';

// Collects all data tuples that pass through this operator.
// The 'index' parameter control annotation of tuples by array index.
// If truthy, a zero-based '_index' field will be added to tuples.
export default function Collect(params) {
  Transform.call(this, [], params);
}

var prototype = (Collect.prototype = Object.create(Transform.prototype));
prototype.constructor = Collect;

prototype._transform = function(_, pulse) {
  var index = _.index || false,
      data = this.value,
      n = 0, j = 0, reindex, map;

  if (_.modified('index') && data.length) {
    throw Error('Collector index parameter can not be modified.');
  }

  // process removed tuples
  if (pulse.rem.length) {
    // build id map to filter data array
    map = {};
    pulse.visit(pulse.REM, function(t) { map[t._id] = 1; ++n; });

    if (index) {
      // if indexed, construct reindex map while filtering
      reindex = pulse.reindex = indexarray(n = (data.length - n), n);
      data = data.filter(function(t, i) {
        return map[t._id] ? 0 : (reindex[j] = i, t._index = j++, 1);
      });
      pulse.reindex = reindex;
    } else {
      // otherwise, simply filter the data
      data = data.filter(function(t) { return !map[t._id]; });
    }
  }

  // process added tuples
  n = data.length;
  pulse.visit(pulse.ADD, index
    ? function(t) { data.push(t); t._index = n++; }
    : function(t) { data.push(t); });

  this.value = data;
};
