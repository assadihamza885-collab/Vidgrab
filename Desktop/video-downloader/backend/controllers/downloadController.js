const downloadService = require("../services/downloadService");
const downloadStore = require("../services/downloadStore");
const downloadQueue = require("../services/downloadQueue");

const progressService = require("../services/progressService");

const { validateURL } = require("../utils/validators");
const { AppError } = require("../utils/errorHandler");



// ======================================
// Start Download
// ======================================

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





        const allowedFormats = [

            "mp4",

            "mp3",

            "webm"

        ];




        const selectedFormat =

            format.toLowerCase();




        if (

            !allowedFormats.includes(
                selectedFormat
            )

        ) {


            return next(

                new AppError(

                    "Unsupported format.",

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







        // Create progress

        progressService.create(

            downloadId

        );








        // Background process

        (async()=>{


            try {



                const result =

                    await downloadQueue.add(

                        () =>

                        downloadService.processDownload(

                            url,

                            selectedFormat,

                            quality,

                            downloadId

                        )

                    );







                if (

                    !result ||

                    !result.filePath

                ) {


                    throw new Error(

                        "Download failed: file missing"

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






                progressService.update(

                    downloadId,

                    {


                        percent:100,


                        status:"Ready"


                    }

                );







                console.log(

                    "DOWNLOAD READY:",

                    downloadId

                );





            }

            catch(error){



                console.error(

                    "DOWNLOAD ERROR:",

                    error

                );





                progressService.update(

                    downloadId,

                    {


                        percent:0,


                        status:"Failed",


                        error:

                            error.message


                    }

                );


            }



        })();








        return res.json({

            status:"started",

            downloadId


        });






    }

    catch(error){


        next(error);


    }


};






module.exports = {


    downloadMedia


};