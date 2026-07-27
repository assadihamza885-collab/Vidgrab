console.log("MAIN JS VERSION 5");


let currentMetaData = null;
let currentDownloadId = null;


document.addEventListener("DOMContentLoaded", () => {


const cancelBtn = document.getElementById("cancelBtn");


if(cancelBtn){
cancelBtn.style.display = "flex";}



// ==========================
// CANCEL DOWNLOAD
// ==========================

if(cancelBtn){

cancelBtn.addEventListener("click", async()=>{


    if(!currentDownloadId){
        return;
    }


    try{


        await fetch(
            `/api/cancel/${currentDownloadId}`,
            {
                method:"POST"
            }
        );


        document.getElementById(
            "progressStatus"
        ).innerText="Cancelled";


        resetDownloadState();



    }catch(err){

        console.error(err);

    }


});


}





const {
    elements,
    showAlert,
    hideAlert,
    setAnalyzeLoading,
    setDownloadLoading,
    renderPreview

} = UI;




HistoryManager.renderHistory();





// ==========================
// PASTE
// ==========================


elements.pasteBtn.addEventListener("click", async()=>{


try{


const text = await navigator.clipboard.readText();


elements.urlInput.value=text;



}catch{


showAlert(
"Unable to access clipboard",
"danger"
);


}


});






// ==========================
// FORMAT
// ==========================


elements.formatSelect.addEventListener("change",(e)=>{


if(e.target.value==="mp3"){


elements.qualityGroup.style.display="none";


}else{


elements.qualityGroup.style.display="flex";


}


});






// ==========================
// ANALYZE
// ==========================


elements.analyzeForm.addEventListener(
"submit",
async(e)=>{


e.preventDefault();


hideAlert();



const url =
elements.urlInput.value.trim();




if(!url){


showAlert(
"Please enter URL",
"danger"
);


return;


}



setAnalyzeLoading(true);



try{


const data =
await API.fetchMediaInfo(url);



currentMetaData=data;



resetDownloadState();



renderPreview(data);




}catch(err){


showAlert(
err.message || "Analyze error",
"danger"
);



}finally{


setAnalyzeLoading(false);


}



});

// ==========================
// DOWNLOAD
// ==========================


elements.downloadBtn.addEventListener(
"click",
async()=>{


console.log("DOWNLOAD CLICK");


hideAlert();



const url =
elements.urlInput.value.trim();



const format =
elements.formatSelect.value;



const quality =
elements.qualitySelect.value;





if(!url){


showAlert(
"URL required",
"danger"
);


return;


}





setDownloadLoading(true);





const btnText =
document.getElementById("downloadBtnText");


const icon =
document.getElementById("downloadIcon");


const spinner =
document.getElementById("downloadSpinner");





if(btnText){

btnText.innerText =
"Preparing Download...";

}



if(icon){

icon.style.display="none";

}



if(spinner){

spinner.style.display="inline-block";

}






try{



const result =
await API.triggerMediaDownload(
url,
format,
quality
);




currentDownloadId =
result.downloadId;




if(!result.downloadId){


throw new Error(
"No download id"
);


}




// SHOW CANCEL ONLY AFTER ID EXISTS

const cancelBtn =
document.getElementById("cancelBtn");


if(cancelBtn){

cancelBtn.style.display="block";

}






document.getElementById(
"progressContainer"
).style.display="block";






startProgressTracking(
result.downloadId
);






if(currentMetaData){



HistoryManager.addEntry({


title:
currentMetaData.title,


format,


quality



});



}






}catch(err){



showAlert(
err.message,
"danger"
);



resetDownloadState();



}



});


});

// =====================================
// PROGRESS TRACKING
// =====================================


function startProgressTracking(downloadId){


const interval =
setInterval(async()=>{


try{


const res =
await fetch(
`/api/progress/${downloadId}?t=${Date.now()}`,
{
cache:"no-store"
}
);





if(!res.ok){


console.log(
"Progress HTTP Error:",
res.status
);


return;


}






const progress =
await res.json();



console.log(
"PROGRESS",
progress
);






const percent =
Math.floor(progress.percent || 0);







const progressBar =
document.getElementById("progressBarFill");


const progressPercent =
document.getElementById("progressPercent");


const progressStatus =
document.getElementById("progressStatus");


const progressSpeed =
document.getElementById("progressSpeed");


const progressEta =
document.getElementById("progressEta");







if(progressBar){

progressBar.style.width =
percent + "%";

}



if(progressPercent){

progressPercent.innerText =
percent + "%";

}



if(progressStatus){

progressStatus.innerText =
progress.status || "";

}



if(progressSpeed){

progressSpeed.innerText =
progress.speed || "--";

}



if(progressEta){

progressEta.innerText =
progress.eta || "--";

}








// ==========================
// DOWNLOAD COMPLETE
// ==========================


if(percent >= 100){



clearInterval(interval);





const cancelBtn =
document.getElementById("cancelBtn");


if(cancelBtn){

cancelBtn.style.display="none";

}





if(progressStatus){

progressStatus.innerText =
"Completed";

}






const btn =
document.getElementById("downloadBtn");


const btnText =
document.getElementById("downloadBtnText");


const icon =
document.getElementById("downloadIcon");


const spinner =
document.getElementById("downloadSpinner");






if(btn){

btn.disabled=false;

}



if(btnText){

btnText.innerText =
"Download Ready ✓";

}



if(icon){

icon.style.display="inline";

}



if(spinner){

spinner.style.display="none";

}







setTimeout(()=>{


window.location.href =
`/api/download/file/${downloadId}?t=${Date.now()}`;



currentDownloadId = null;



},1500);




}





}catch(err){



console.error(
"TRACK ERROR:",
err
);



}




},1000);



}

// =====================================
// RESET DOWNLOAD STATE
// =====================================


function resetDownloadState(){



// Hide progress box

const progressContainer =
document.getElementById("progressContainer");


if(progressContainer){

    progressContainer.style.display="none";

}




// Reset progress bar

const progressBar =
document.getElementById("progressBarFill");


if(progressBar){

    progressBar.style.width="0%";

}





// Reset percentage

const progressPercent =
document.getElementById("progressPercent");


if(progressPercent){

    progressPercent.innerText="0%";

}





// Reset status

const progressStatus =
document.getElementById("progressStatus");


if(progressStatus){

    progressStatus.innerText="Ready";

}





// Reset speed

const progressSpeed =
document.getElementById("progressSpeed");


if(progressSpeed){

    progressSpeed.innerText="0 MB/s";

}





// Reset ETA

const progressEta =
document.getElementById("progressEta");


if(progressEta){

    progressEta.innerText="--";

}





// Reset Download Button

const btn =
document.getElementById("downloadBtn");


const btnText =
document.getElementById("downloadBtnText");


const icon =
document.getElementById("downloadIcon");


const spinner =
document.getElementById("downloadSpinner");





if(btn){

    btn.disabled=false;

}




if(btnText){

    btnText.innerText="Download Now";

}




if(icon){

    icon.style.display="inline";

}




if(spinner){

    spinner.style.display="none";

}





// Hide Cancel Button

const cancelBtn =
document.getElementById("cancelBtn");



if(cancelBtn){

    cancelBtn.style.display="none";

}




// Remove current download

currentDownloadId = null;



}