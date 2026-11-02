module.exports = {
  JWT_SECRET: process.env.JWT_SECRET || 'hellomoto',
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '1h',
  RESET_TOKEN_EXPIRES_IN: process.env.RESET_TOKEN_EXPIRES_IN || '15m'
};
