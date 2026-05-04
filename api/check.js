module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  const { domain } = req.query;
  
  try {
    const r = await fetch(`https://rdap.org/domain/${encodeURIComponent(domain)}`);
    return res.status(200).json({ available: r.status === 404, status: r.status });
  } catch (e) {
    return res.status(200).json({ error: e.message, stack: e.stack });
  }
};
