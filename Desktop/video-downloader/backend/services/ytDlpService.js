const processStore = require("./downloadProcessStore");
const progressService = require("./progressService");
const { AppError } = require("../utils/errorHandler");

const ytDlp = require("yt-dlp-exec");

console.log("🔥 YT-DLP SERVICE FIXED V4");



// =====================================
// Execute yt-dlp JSON
// =====================================

const executeYtDlp = async (args) => {

    try {

        const output = await ytDlp(
            ...args
        );

        return output;


    } catch(err){

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

const getVideoMetadata = async(url)=>{


    const args = [

        "--dump-single-json",
        "--skip-download",
        "--no-playlist",
        "--no-warnings",
        "--no-check-certificates",
        "--user-agent",
        "Mozilla/5.0",
        url

    ];



    if(url.includes("youtube") || url.includes("youtu")){


        args.push(
            "--extractor-args",
            "youtube:player_client=android"
        );


    }



    const raw =
        await executeYtDlp(args);



    const data =
        JSON.parse(raw);



    let qualities=[];


    if(Array.isArray(data.formats)){


        qualities=[

            ...new Set(

                data.formats

                .filter(x=>x.height)

                .map(x=>`${x.height}p`)

            )

        ];

    }



    return {


        title:
        data.title || "Unknown",


        thumbnail:
        data.thumbnail || "",


        duration:
        data.duration || 0,


        uploader:
        data.uploader || "",


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


        formats:[
            "mp4",
            "mp3"
        ]


    };


};









// =====================================
// Download
// =====================================

const downloadMediaStream = (

    downloadId,
    url,
    format,
    quality,
    outputTemplate


)=>{


return new Promise(async(resolve,reject)=>{


try{


let formatSpec =
"bestvideo+bestaudio/best";



if(format==="mp3"){

formatSpec =
"bestaudio/best";

}




if(
quality &&
quality!=="best"
){

const h=parseInt(quality);


if(!isNaN(h)){

formatSpec =
`bestvideo[height<=${h}]+bestaudio/best`;

}


}




const args=[


"-f",
formatSpec,


"--newline",


"--progress",


"--no-playlist",


"--no-check-certificates",


"-o",
outputTemplate,


url


];






if(format==="mp3"){


args.splice(

args.length-1,

0,

"-x",

"--audio-format",

"mp3"

);


}
else{


args.splice(

args.length-1,

0,

"--merge-output-format",

"mp4"

);


}




console.log(
"YT-DLP DOWNLOAD ARGS",
args
);





const child =
ytDlp.exec(
    ...args
);



processStore.set(
downloadId,
child
);





child.stdout.on(
"data",
(data)=>{


const text =
data.toString();


console.log(text);



const match =
text.match(
/(\d+\.\d+)%/
);



if(match){


progressService.update(

downloadId,

{

percent:
Math.floor(
parseFloat(match[1])
),

status:
"Downloading..."

}

);


}



}

);






child.stderr.on(
"data",
data=>{

console.log(
"YT-DLP:",
data.toString()
);


}

);






child.on(
"close",
(code)=>{


processStore.remove(
downloadId
);



if(code!==0){


return reject(

new AppError(
"yt-dlp failed",
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







child.on(
"error",
err=>{


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

catch(err){

reject(err);

}



});


};









module.exports={

getVideoMetadata,

downloadMediaStream

};