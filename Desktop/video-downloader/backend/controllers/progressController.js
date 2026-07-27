const progressService = require('../services/progressService');

const getProgress = (req, res) => {
  const { id } = req.params;

  const progress = progressService.get(id);

  if (!progress) {
    return res.json({
      percent: 0,
      status: "Waiting..."
    });
  }

  res.json(progress);
};

module.exports = {
  getProgress
};