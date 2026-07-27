const ytDlpService = require('../services/ytDlpService');
const { validateURL } = require('../utils/validators');
const { AppError } = require('../utils/errorHandler');

const getMediaInfo = async (req, res, next) => {
  try {
    const { url } = req.body;

    if (!url) {
      return next(new AppError('URL parameter is strictly required.', 400));
    }

    if (!validateURL(url)) {
      return next(new AppError('The provided URL is invalid or from an unsupported platform.', 400));
    }

    const metadata = await ytDlpService.getVideoMetadata(url);

    res.status(200).json({
      status: 'success',
      data: metadata
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getMediaInfo
};