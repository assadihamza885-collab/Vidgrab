const downloadService = require("../services/downloadService");
const downloadStore = require("../services/downloadStore");
const downloadQueue = require("../services/downloadQueue");

const { validateURL } = require("../utils/validators");
const { AppError } = require("../utils/errorHandler");

const downloadMedia = async (req, res, next) => {

    try {

        const {

            url,
            format = "mp4",
            quality = "best"

        } = req.body;

        if (!url) {

            return next(

                new AppError(

                    "URL parameter is strictly required.",

                    400

                )

            );

        }

        if (!validateURL(url)) {

            return next(

                new AppError(

                    "Invalid URL.",

                    400

                )

            );

        }

        const downloadId =
            downloadService.createDownloadId();

        console.log(
            "DOWNLOAD START:",
            downloadId
        );

        // Background Download
        (async () => {

            try {

                const result =
                    await downloadQueue.add(() =>

                        downloadService.processDownload(

                            url,

                            format.toLowerCase(),

                            quality,

                            downloadId

                        )

                    );

                console.log(
                    "PROCESS RESULT:",
                    result
                );

                if (
                    !result ||
                    !result.filePath
                ) {

                    throw new Error(
                        "No file path returned"
                    );

                }

                downloadStore.set(

                    downloadId,

                    {

                        filePath:
                            result.filePath,

                        fileName:
                            result.fileName

                    }

                );

                console.log(

                    "DOWNLOAD STORED:",

                    downloadId

                );

            } catch (err) {

                console.error(

                    "BACKGROUND DOWNLOAD ERROR:",

                    err

                );

            }

        })();

        return res.json({

            status: "started",

            downloadId

        });

    } catch (err) {

        next(err);

    }

};

module.exports = {

    downloadMedia

};