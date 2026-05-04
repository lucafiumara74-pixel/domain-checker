const https = require('https');

module.exports = (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  const domain = req.query.domain || '';

  https.get('https://rdap.org/domain/' + domain, function(r) {
    if (r.statusCode === 404) return res.json({ available: true });
    if (r.statusCode === 200) return res.json({ available: false });
    return res.json({ available: null, status: r.statusCode });
  }).on('error', function(e) {
    res.status(200).json({ error: e.message });
  });
};
