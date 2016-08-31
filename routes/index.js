const express = require('express');
const router = express.Router();

router.use('/', (req, res, next) => {
  res.send('This is from route index.');
});

module.exports = router;