const path = require("path");
const fs = require("fs-extra");
const { v4: uuidv4 } = require("uuid");

const ytDlpService = require("./ytDlpService");
const ffmpegService = require("./ffmpegService");
const progressService = require("./progressService");

const { AppError } = require("../utils/errorHandler");




// ===============================
// Create Download ID
// ===============================

const createDownloadId = () => {

    return uuidv4();

};






// ===============================
// Wait until final file exists
// ===============================

const waitForFile = async (

    downloadsDir,

    downloadId

) => {


    const timeout =
        10 * 60 * 1000;


    const start =
        Date.now();



    while (

        Date.now() - start < timeout

    ) {



        if (

            progressService.isCancelled(
                downloadId
            )

        ) {


            return null;

        }




        const files =
            await fs.readdir(
                downloadsDir
            );





        const targetFile =

            files.find(file =>


                file.startsWith(downloadId)

                &&

                !file.endsWith(".part")

                &&

                !file.endsWith(".ytdl")


            );






        if(targetFile){


            return targetFile;


        }






        await new Promise(resolve =>

            setTimeout(resolve,1000)

        );



    }





    return null;


};







// ===============================
// Main Download Process
// ===============================


const processDownload = async (

    url,

    format,

    quality,

    downloadId

)=>{


    const downloadsDir =

        path.resolve(

            process.env.DOWNLOADS_DIR ||

            "./downloads"

        );




    await fs.ensureDir(
        downloadsDir
    );







    const outputTemplate =

        path.join(

            downloadsDir,

            `${downloadId}.%(ext)s`

        );







    console.log(
        "=================================="
    );

    console.log(
        "DOWNLOAD ID:",
        downloadId
    );

    console.log(
        "OUTPUT:",
        outputTemplate
    );

    console.log(
        "=================================="
    );







    const downloadResult =

        await ytDlpService.downloadMediaStream(

            downloadId,

            url,

            format,

            quality,

            outputTemplate

        );







    // Cancelled

    if(downloadResult === false){


        return null;


    }







    if(

        progressService.isCancelled(
            downloadId
        )

    ){

        return null;

    }








    progressService.update(

        downloadId,

        {

            percent:99,

            speed:"",

            eta:"",

            status:"Finalizing..."

        }

    );








    const targetFile =

        await waitForFile(

            downloadsDir,

            downloadId

        );







    console.log(

        "TARGET FILE:",

        targetFile

    );







    if(!targetFile){


        throw new AppError(

            "Downloaded file not found",

            500

        );


    }







    let fullPath =

        path.join(

            downloadsDir,

            targetFile

        );






    let ext =

        path.extname(targetFile)

        .replace(".","");







    console.log(
        "FULL PATH:",
        fullPath
    );








    // ===============================
    // MP3 Conversion
    // ===============================


    if(

        format === "mp3"

        &&

        ext !== "mp3"

    ){



        progressService.update(

            downloadId,

            {

                status:
                "Converting to MP3..."

            }

        );






        const convertedPath =

            path.join(

                downloadsDir,

                `${downloadId}.mp3`

            );







        await ffmpegService.convertToMp3(

            fullPath,

            convertedPath

        );






        await fs.remove(
            fullPath
        );







        fullPath =
            convertedPath;


        ext =
            "mp3";


    }








    if(

        !(await fs.pathExists(fullPath))

    ){


        throw new AppError(

            "Final file does not exist",

            500

        );


    }








    const result = {


        downloadId,


        filePath:
            fullPath,


        fileName:

            `media_${downloadId.substring(0,8)}.${ext}`


    };







    console.log(

        "FINAL RESULT:",

        result

    );








    return result;


};







module.exports = {


    createDownloadId,


    processDownload


};