const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { getLogs, ingestLog, getLogStats } = require('../controllers/siemController');

router.use(protect);
router.get('/logs', getLogs);
router.get('/stats', getLogStats);
router.post('/ingest', ingestLog);

module.exports = router;
