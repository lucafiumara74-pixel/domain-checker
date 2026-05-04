// api/check.js
// Backend serverless Vercel - verifica disponibilità dominio via RDAP/WHOIS

export default async function handler(req, res) {
  // Permetti CORS per chiamate dal frontend
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET');

  const { domain } = req.query;

  if (!domain) {
    return res.status(400).json({ error: 'Parametro domain mancante' });
  }

  // Validazione base del dominio
  const domainClean = domain.toLowerCase().trim();
  if (!/^[a-z0-9][a-z0-9\-]{0,61}(\.[a-z]{2,})+$/i.test(domainClean)) {
    return res.status(400).json({ error: 'Dominio non valido' });
  }

  try {
    const available = await isDomainAvailable(domainClean);
    return res.status(200).json({ domain: domainClean, available });
  } catch (err) {
    console.error('Errore verifica dominio:', err);
    return res.status(500).json({ error: 'Errore durante la verifica' });
  }
}

async function isDomainAvailable(domain) {
  // Lista di endpoint RDAP da provare in ordine
  const endpoints = [
    `https://rdap.org/domain/${domain}`,
    `https://rdap.verisign.com/com/v1/domain/${domain}`,
    `https://rdap.nic.it/domain/${domain}`,
  ];

  for (const url of endpoints) {
    try {
      const response = await fetch(url, {
        method: 'GET',
        headers: { 'Accept': 'application/json' },
        signal: AbortSignal.timeout(6000),
      });

      // 404 = dominio NON trovato nel registro = DISPONIBILE
      if (response.status === 404) return true;

      // 200 = dominio trovato nel registro = NON DISPONIBILE
      if (response.status === 200) return false;

    } catch (err) {
      // Timeout o errore di rete: prova il prossimo endpoint
      continue;
    }
  }

  // Fallback: prova a risolvere il DNS
  // Se non risolve, probabilmente è libero
  try {
    const dnsRes = await fetch(`https://dns.google/resolve?name=${domain}&type=A`);
    const dnsData = await dnsRes.json();
    // Se ci sono record A, il dominio è registrato
    if (dnsData.Answer && dnsData.Answer.length > 0) return false;
    return true;
  } catch {
    throw new Error('Impossibile verificare il dominio');
  }
}
