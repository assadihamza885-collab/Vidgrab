const fs = require("fs-extra");
const path = require("path");


function initScheduledCleanup(
    folders,
    intervalMinutes = 15,
    maxAgeMinutes = 30
) {


    console.log("FILE CLEANUP STARTED");


    setInterval(async () => {


        console.log("RUNNING FILE CLEANUP");


        const now = Date.now();


        for (const folder of folders) {


            try {


                if (!await fs.pathExists(folder)) {
                    continue;
                }


                const files = await fs.readdir(folder);


                for (const file of files) {


                    const filePath = path.join(
                        folder,
                        file
                    );


                    const stats = await fs.stat(
                        filePath
                    );


                    const age =
                        (now - stats.mtimeMs)
                        /
                        (1000 * 60);



                    if (age > maxAgeMinutes) {


                        await fs.remove(
                            filePath
                        );


                        console.log(
                            "DELETED:",
                            file
                        );


                    }


                }


            } catch(err) {


                console.error(
                    "CLEANUP ERROR:",
                    err.message
                );


            }


        }


    }, intervalMinutes * 60 * 1000);


}


module.exports = {
    initScheduledCleanup
};