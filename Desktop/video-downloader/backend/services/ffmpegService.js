const { execFile } = require('child_process');
const path = require('path');
const fs = require('fs-extra');
const { AppError } = require('../utils/errorHandler');

const checkFFmpeg = () => {
  return new Promise((resolve) => {
    execFile('ffmpeg', ['-version'], (error) => {
      if (error) {
        resolve(false);
      } else {
        resolve(true);
      }
    });
  });
};

const convertToMp3 = (inputFile, outputFile) => {
  return new Promise((resolve, reject) => {
    const args = [
      '-y',
      '-i', inputFile,
      '-vn',
      '-ar', '44100',
      '-ac', '2',
      '-b:a', '192k',
      outputFile
    ];

    execFile('ffmpeg', args, (error, stdout, stderr) => {
      if (error) {
        return reject(new AppError(`FFmpeg MP3 conversion failed: ${stderr || error.message}`, 500));
      }
      resolve(outputFile);
    });
  });
};

const mergeVideoAudio = (videoFile, audioFile, outputFile) => {
  return new Promise((resolve, reject) => {
    const args = [
      '-y',
      '-i', videoFile,
      '-i', audioFile,
      '-c:v', 'copy',
      '-c:a', 'aac',
      '-strict', 'experimental',
      outputFile
    ];

    execFile('ffmpeg', args, (error, stdout, stderr) => {
      if (error) {
        return reject(new AppError(`FFmpeg Merge failed: ${stderr || error.message}`, 500));
      }
      resolve(outputFile);
    });
  });
};

module.exports = {
  checkFFmpeg,
  convertToMp3,
  mergeVideoAudio
};