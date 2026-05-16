function checkAccessToken(req, res, next) {
  const accessToken = req.query.access_token || req.query.accessToken;

  if (!accessToken || String(accessToken).trim() === '') {
    return res.status(401).json({
      error: 'Access token is required in the query string',
    });
  }

  req.accessToken = accessToken;
  next();
}

module.exports = checkAccessToken;
