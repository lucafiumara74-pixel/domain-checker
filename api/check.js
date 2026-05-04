const https = require('https');

module.exports = function(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  var domain = req.query.domain || '';

  https.get('https://rdap.org/domain/' + domain, function(r) {
    var data = '';
    r.on('data', function(c) { data += c; });
    r.on('end', function() {
      if (r.statusCode === 404) return res.json({ available: true });
      return res.json({ available: false });
    });
  }).on('error', function(e) {
    return res.json({ available: null, error: e.message });
  });
};
