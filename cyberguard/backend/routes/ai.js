const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { chat, analyzeLog, threatIntel } = require('../controllers/aiController');

router.use(protect);
router.post('/chat', chat);
router.post('/analyze-log', analyzeLog);
router.get('/threat-intel/:query', threatIntel);

module.exports = router;
