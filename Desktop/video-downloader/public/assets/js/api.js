const API = (() => {


  const fetchMediaInfo = async (url) => {


    const response = await fetch('/api/info', {

      method: 'POST',

      headers: {
        'Content-Type': 'application/json'
      },

      body: JSON.stringify({
        url
      })

    });



    const data = await response.json();



    if(!response.ok){

      throw new Error(
        data.message ||
        'Failed to fetch media information.'
      );

    }



    return data.data;


  };







  const triggerMediaDownload = async (
    url,
    format,
    quality
  ) => {



    const response = await fetch('/api/download', {


      method:'POST',


      headers:{
        'Content-Type':'application/json'
      },


      body:JSON.stringify({

        url,

        format,

        quality

      })


    });





    const data = await response.json();





    if(!response.ok){


      throw new Error(
        data.message ||
        'Download request failed.'
      );


    }





    return data;





  };







  const downloadFile = async(downloadId)=>{


    const response =
    await fetch(
      `/api/download/file/${downloadId}`
    );




    if(!response.ok){

      throw new Error(
        "File not found"
      );

    }





    const blob =
    await response.blob();





    const url =
    window.URL.createObjectURL(blob);




    const a =
    document.createElement("a");



    a.href=url;



    a.download=
    `video_${Date.now()}.mp4`;



    document.body.appendChild(a);



    a.click();



    a.remove();



    window.URL.revokeObjectURL(url);



  };





  return {


    fetchMediaInfo,

    triggerMediaDownload,

    downloadFile


  };



})();