module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  
  const { domain } = req.query;
  if (!domain) return res.status(400).json({ error: 'Dominio mancante' });

  try {
    const response = await fetch(`https://rdap.org/domain/${domain}`);
    if (response.status === 404) return res.json({ available: true });
    if (response.status === 200) return res.json({ available: false });
    return res.json({ available: null });
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
};
