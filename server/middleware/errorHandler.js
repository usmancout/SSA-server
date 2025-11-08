const errorHandler = (err, req, res, next) => {
  console.error(err.stack);

  if (err.message === 'Not allowed by CORS') {
    return res.status(403).json({ message: 'CORS policy violation' });
  }

  res.status(500).json({ message: 'Internal Server Error' });
};

module.exports = errorHandler;
