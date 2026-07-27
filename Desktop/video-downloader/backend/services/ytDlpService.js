const processStore = require("./downloadProcessStore");
const progressService = require("./progressService");
const { AppError } = require("../utils/errorHandler");
const ytDlp = require("yt-dlp-exec");
const { spawn } = require("child_process");

console.log("YT-DLP SERVICE LOADED");


// ======================================
// Execute yt-dlp JSON
// ======================================

const executeYtDlp = async (args) => {

    try {

        console.log("YT-DLP ARGS:", args);

        const output = await ytDlp(args);

        return output;


    } catch(error){

        console.log(
            "YT-DLP EXEC ERROR:",
            error
        );

        throw new AppError(
            error.message,
            400
        );

    }

};




// ======================================
// Metadata
// ======================================

const getVideoMetadata = async (url)=>{


try{


const args = [

    "--dump-single-json",

    "--skip-download",

    "--no-playlist",

    "--no-warnings",

    "--ignore-errors",

    "--no-check-certificates",

    "--user-agent",

    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120 Safari/537.36",

    url

];



// Instagram support

if(url.includes("instagram.com")){

    args.push(
        "--extractor-args",
        "instagram:api_version=v1"
    );

}



const rawOutput =
await executeYtDlp(args);



let data;


if(typeof rawOutput === "string"){

    data = JSON.parse(rawOutput);

}else{

    data = rawOutput;

}




let qualities=[];



if(data.formats){


qualities =
data.formats

.filter(f=>f.height)

.map(f=>`${f.height}p`);



qualities =
[
...new Set(qualities)
]
.sort(
(a,b)=>
parseInt(b)-parseInt(a)
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


formats:[

"mp4",
"webm",
"mp3"

]


};



}catch(error){


console.log(
"METADATA FULL ERROR:",
error
);



throw new AppError(
error.message,
500
);



}



};







// ======================================
// Download Stream
// ======================================


const downloadMediaStream = async(

downloadId,
url,
format,
quality,
outputTemplate

)=>{

if(progressService.isCancelled(downloadId)){

    console.log(
        "CANCELLED BEFORE START"
    );

    return false;

}

let formatSpec =
"bestvideo[ext=mp4][vcodec^=avc1]+bestaudio[ext=m4a]/best[ext=mp4]/best";


if(format==="mp3"){

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
`best[height<=${height}]/best`;



}


}






const args=[


"--newline",

"--progress",

"--no-playlist",

"--no-check-certificates",

"--ignore-errors",


"--progress-template",

"%(progress._percent_str)s|speed:%(progress._speed_str)s|eta:%(progress._eta_str)s"



];



// Convert HEVC (H265) to H264 for compatibility
// Force MP4 H264 conversion for TikTok HEVC videos
if(format !== "mp3"){

    args.push(
        "--merge-output-format",
        "mp4"
    );

    args.push(
        "--recode-video",
        "mp4"
    );

    args.push(
        "--postprocessor-args",
        "ffmpeg:-c:v libx264 -preset fast -crf 23 -c:a aac -b:a 128k"
    );

}

// Youtube

if(
url.includes("youtube.com") ||
url.includes("youtu.be")
){


args.push(

"--extractor-args",

"youtube:player_client=android"

);


}




// Instagram

if(url.includes("instagram.com")){


args.push(

"--extractor-args",

"instagram:api_version=v1"

);


}







args.push(

"-f",

formatSpec,

"-o",

outputTemplate,

url

);







return new Promise((resolve,reject)=>{


console.log(
"STARTING DOWNLOAD"
);



const child =
spawn(

"yt-dlp",

args,

{

windowsHide:true

}

);




processStore.set(
downloadId,
child
);






const readProgress=(buffer)=>{


const text =
buffer.toString();


console.log(text);



const percentMatch =
text.match(/(\d+(?:\.\d+)?)%/);



if(!percentMatch){

return;

}



const percent =
Math.floor(
parseFloat(percentMatch[1])
);




const speedMatch =
text.match(/speed:\s*([^|]+)/i);



const etaMatch =
text.match(/eta:\s*([^\s|]+)/i);



if(progressService.isCancelled(downloadId)){

    return;

}


progressService.update(

    downloadId,

    {

        percent,

        speed:

        speedMatch
        ? speedMatch[1].trim()
        : "--",

        eta:

        etaMatch
        ? etaMatch[1].trim()
        : "--",

        status:

        percent >= 100
        ? "Processing..."
        : "Downloading..."

    }

);



};






child.stdout.on(
"data",
readProgress
);



child.stderr.on(
"data",
readProgress
);







child.on(
"close",
(code)=>{
if(progressService.isCancelled(downloadId)){

    console.log(
        "DOWNLOAD WAS CANCELLED - IGNORING CLOSE"
    );

    return;

}

console.log(
"YT-DLP CLOSED:",
code
);





if(code!==0){


progressService.update(

downloadId,

{

percent:0,

speed:"",

eta:"",

status:"Failed"

}

);



processStore.remove(
downloadId
);



return reject(

new AppError(
"Download failed",
500
)

);



}






progressService.update(

downloadId,

{

percent:99,

speed:"",

eta:"",

status:"Processing..."

}

);




processStore.remove(
downloadId
);



resolve(true);



}

);






child.on(
"error",
(err)=>{


console.log(err);



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



});



};






module.exports={


getVideoMetadata,

downloadMediaStream


};