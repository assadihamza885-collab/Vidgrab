const processStore = require("../services/downloadProcessStore");
const progressService = require("../services/progressService");
const { exec } = require("child_process");
const fs = require("fs");
const path = require("path");

const cancelDownload = (req, res) => {


    const { id } = req.params;


    const child = processStore.get(id);



    if (!child) {

        return res.status(404).json({

            success:false,

            message:"Download not found"

        });

    }



    try {


        console.log(
            "CANCELLING DOWNLOAD:",
            id
        );



        // منع أي progress update جديد
        progressService.cancel(id);



        if(child.pid){


            exec(
                `taskkill /pid ${child.pid} /T /F`,
                (err)=>{


                    if(err){

                        console.log(
                            "TASKKILL ERROR:",
                            err.message
                        );

                    }else{

                        console.log(
                            "PROCESS TREE KILLED"
                        );

                    }


                }
            );


        }else{


            child.kill("SIGKILL");


        }




        processStore.remove(id);

const downloadsDir = path.resolve("./downloads");


if(fs.existsSync(downloadsDir)){

    const files = fs.readdirSync(downloadsDir);


    files.forEach(file=>{


        if(file.startsWith(id)){


            try{

                fs.unlinkSync(
                    path.join(
                        downloadsDir,
                        file
                    )
                );


                console.log(
                    "TEMP FILE DELETED:",
                    file
                );


            }catch(err){

                console.log(
                    "DELETE ERROR:",
                    err.message
                );

            }


        }


    });


}

        return res.json({

            success:true,

            message:"Download cancelled"

        });



    }catch(err){


        console.log(
            "CANCEL ERROR:",
            err
        );



        return res.status(500).json({

            success:false,

            message:err.message

        });


    }


};



module.exports = {

    cancelDownload

};
