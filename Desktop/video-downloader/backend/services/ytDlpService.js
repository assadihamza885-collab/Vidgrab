const processStore = require("./downloadProcessStore");
const progressService = require("./progressService");

const { AppError } = require("../utils/errorHandler");

const ytDlp = require("yt-dlp-exec");

console.log("YT-DLP EXEC SERVICE LOADED");
console.log("🔥 NEW YTDLP SERVICE RUNNING V2");



// =====================================
// Execute yt-dlp JSON
// =====================================

const executeYtDlp = async (args) => {

    try {


        const output = await ytDlp.exec(...args);


        return output;


    } catch (err) {


        console.error(
            "YT-DLP JSON ERROR:",
            err
        );


        throw new AppError(
            err.message,
            400
        );


    }

};







// =====================================
// Metadata
// =====================================

const getVideoMetadata = async (url) => {


    const args = [

        "--dump-single-json",

        "--skip-download",

        "--no-playlist",

        "--no-warnings",

        "--ignore-errors",

        "--no-check-certificates",

        "--user-agent",

        "Mozilla/5.0 (Windows NT 10.0; Win64; x64)",

        url

    ];




    if (

        url.includes("youtube.com") ||

        url.includes("youtu.be")

    ) {


        args.push(

            "--extractor-args",

            "youtube:player_client=android"

        );


    }




    if (

        url.includes("instagram.com")

    ) {


        args.push(

            "--extractor-args",

            "instagram:api_version=v1"

        );


    }





    const raw =
        await executeYtDlp(args);




    const data =

        typeof raw === "string"

        ?

        JSON.parse(raw)

        :

        raw;






    let qualities = [];





    if(Array.isArray(data.formats)){


        qualities = [

            ...new Set(

                data.formats

                .filter(
                    f => f.height
                )

                .map(
                    f => `${f.height}p`
                )

            )

        ]

        .sort(

            (a,b)=>

            parseInt(b) -

            parseInt(a)

        );


    }






    return {


        title:
            data.title || "Untitled",


        thumbnail:
            data.thumbnail || "",


        duration:
            data.duration || 0,


        uploader:
            data.uploader || "Unknown",


        viewCount:
            data.view_count || 0,



        qualities:

            qualities.length

            ?

            qualities

            :

            [

                "1080p",

                "720p",

                "480p",

                "360p"

            ],




        formats:

            [

                "mp4",

                "mp3",

                "webm"

            ]



    };


};









// =====================================
// Download Stream
// =====================================

const downloadMediaStream = (

    downloadId,

    url,

    format,

    quality,

    outputTemplate

) => {



    return new Promise(async(resolve,reject)=>{


        try {



            if(

                progressService.isCancelled(
                    downloadId
                )

            ){

                return resolve(false);

            }







            let formatSpec =
                "bestvideo+bestaudio/best";






            if(format === "mp3"){


                formatSpec =
                    "bestaudio/best";


            }






            if(

                quality &&

                quality !== "best"

            ){


                const height =
                    parseInt(quality);




                if(!isNaN(height)){


                    formatSpec =

                    `bestvideo[height<=${height}]+bestaudio/best`;



                }


            }









            const args = [

                "-f",

                formatSpec,


                "--newline",


                "--progress",


                "--no-playlist",


                "--ignore-errors",


                "--no-check-certificates",



                "-o",

                outputTemplate,


                url


            ];







            if(format === "mp3"){


                args.splice(

                    args.length - 1,

                    0,

                    "-x",

                    "--audio-format",

                    "mp3"

                );


            }

            else {


                args.splice(

                    args.length - 1,

                    0,

                    "--merge-output-format",

                    "mp4"

                );


            }








            if(

                url.includes("youtube.com")

                ||

                url.includes("youtu.be")

            ){


                args.splice(

                    args.length - 1,

                    0,

                    "--extractor-args",

                    "youtube:player_client=android"

                );


            }






            if(

                url.includes("instagram.com")

            ){


                args.splice(

                    args.length - 1,

                    0,

                    "--extractor-args",

                    "instagram:api_version=v1"

                );


            }







            console.log(
                "YT-DLP DOWNLOAD START"
            );


            console.log(args);









            const process =

                ytDlp.exec(...args);







            processStore.set(

                downloadId,

                process

            );









            process.stdout.on(

                "data",

                (data)=>{


                    const text =
                        data.toString();




                    console.log(
                        text
                    );



                    const match =

                        text.match(
                            /(\d+\.\d+)%/
                        );





                    if(match){



                        const percent =

                            Math.floor(

                                parseFloat(
                                    match[1]
                                )

                            );





                        progressService.update(

                            downloadId,

                            {


                                percent,


                                status:

                                percent >= 100

                                ?

                                "Processing..."

                                :

                                "Downloading..."


                            }

                        );


                    }



                }

            );









            process.stderr.on(

                "data",

                (data)=>{


                    console.log(

                        "YT-DLP:",

                        data.toString()

                    );


                }

            );









            process.on(

                "close",

                (code)=>{


                    processStore.remove(

                        downloadId

                    );





                    if(

                        progressService.isCancelled(
                            downloadId
                        )

                    ){

                        return resolve(false);

                    }






                    if(code !== 0){


                        return reject(

                            new AppError(

                                "yt-dlp download failed",

                                500

                            )

                        );


                    }







                    progressService.update(

                        downloadId,

                        {


                            percent:100,


                            status:"Completed"


                        }

                    );






                    resolve(true);



                }

            );









            process.on(

                "error",

                (err)=>{


                    processStore.remove(

                        downloadId

                    );





                    reject(

                        new AppError(

                            err.message,

                            500

                        )

                    );


                }

            );




        }

        catch(error){


            reject(error);


        }


    });



};









// =====================================
// Export
// =====================================


module.exports = {


    getVideoMetadata,


    downloadMediaStream


};