const express = require('express');
const fs = require('fs-extra');

const downloadController = require('../controllers/downloadController');
const progressService = require('../services/progressService');
const downloadStore = require('../services/downloadStore');

const router = express.Router();


// Start download
router.post(
  '/',
  downloadController.downloadMedia
);



// Progress
router.get(
  '/progress/:id',
  (req,res)=>{

    const progress =
    progressService.get(
      req.params.id
    );


    if(!progress){

      return res.json({
        percent:0,
        status:"Waiting..."
      });

    }


    return res.json(progress);

  }
);





// Download finished file
router.get(
'/file/:id',
async (req,res)=>{


    const id = req.params.id;


    const data =
    downloadStore.get(id);



    if(!data){

        return res.status(404).json({
            error:"File not found"
        });

    }



    // check physical file
    if(!await fs.pathExists(data.filePath)){


        return res.status(404).json({
            error:"Physical file missing"
        });


    }



    console.log(
        "START DOWNLOAD:",
        data.filePath
    );



    res.download(
        data.filePath,
        data.fileName,
        (err)=>{


            if(err){

                console.error(
                    "SEND FILE ERROR:",
                    err.message
                );


                // ما نمسحش هنا
                return;

            }



            console.log(
                "DOWNLOAD FINISHED SUCCESS"
            );



            // مسح بعد النجاح فقط
            setTimeout(async()=>{


                try{


                    await fs.remove(
                        data.filePath
                    );


                    downloadStore.remove(id);



                    console.log(
                        "FILE DELETED:",
                        data.filePath
                    );


                }catch(e){

                    console.error(
                        "DELETE ERROR:",
                        e.message
                    );

                }


            },5000);



        }

    );



});



module.exports = router;