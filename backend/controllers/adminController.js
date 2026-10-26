const storage = require('../services/storageService');

// @desc    Get Admin dashboard analytics
// @route   GET /api/admin/stats
// @access  Private/Admin
const getAdminStats = async (req, res, next) => {
  try {
    const stats = await storage.getAdminStats();
    res.json({
      success: true,
      stats,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { getAdminStats };
