const jwt = require('jsonwebtoken');

const verifyToken = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'No token provided' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    // ✅ Attach decoded user info to the request
    req.user = { id: decoded.userId, isAdmin: decoded.isAdmin };
    next();
  } catch (err) {
    console.error('JWT verification failed:', err);
    return res.status(403).json({ error: 'Invalid token' });
  }
};



module.exports = (verifyToken);