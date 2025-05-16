module.exports = (err, req, res, next) => {
  if (process.env.NODE_ENV !== 'test') {
    console.error(err.stack);
  }
  res.status(500).json({ message: "Internal server error" });
};
