const https = require('https');

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');

  const { domain } = req.query;
  if (!domain) return res.status(400).json({ error: 'Dominio mancante' });

  const domainClean = domain.toLowerCase().trim();

  try {
    const available = await checkRDAP(domainClean);
    return res.status(200).json({ domain: domainClean, available });
  } catch (err) {
    return res.status(500).json({ error: 'Errore verifica' });
  }
};

function checkRDAP(domain) {
  return new Promise((resolve, reject) => {
    const url = `https://rdap.org/domain/${domain}`;
    https.get(url, { headers: { 'Accept': 'application/json' } }, (res) => {
      if (res.statusCode === 404) resolve(true);
      else if (res.statusCode === 200) resolve(false);
      else checkDNS(domain).then(resolve).catch(reject);
    }).on('error', () => {
      checkDNS(domain).then(resolve).catch(reject);
    });
  });
}

function checkDNS(domain) {
  return new Promise((resolve, reject) => {
    const url = `https://dns.google/resolve?name=${domain}&type=A`;
    https.get(url, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          resolve(!(json.Answer && json.Answer.length > 0));
        } catch { reject(new Error('DNS parse error')); }
      });
    }).on('error', reject);
  });
}
  } catch {
    throw new Error('Impossibile verificare il dominio');
  }
}
