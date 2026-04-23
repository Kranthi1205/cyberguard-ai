const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const {
  getThreats, getThreat, createThreat, updateThreat,
  analyzeThreat, autoRespond, getThreatStats,
} = require('../controllers/threatController');

router.use(protect);
router.get('/stats', getThreatStats);
router.get('/', getThreats);
router.get('/:id', getThreat);
router.post('/', createThreat);
router.put('/:id', updateThreat);
router.post('/:id/analyze', analyzeThreat);
router.post('/:id/respond', autoRespond);

module.exports = router;
