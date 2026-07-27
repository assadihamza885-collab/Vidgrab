const express = require('express');
process.env.FFMPEG_BINARY = require("ffmpeg-static");

const path = require('path');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const fs = require('fs-extra');
const os = require('os');

require('dotenv').config();


// ===============================
// Routes
// ===============================

const infoRoutes = require('./backend/routes/infoRoutes');
const downloadRoutes = require('./backend/routes/downloadRoutes');
const progressRoutes = require('./backend/routes/progressRoutes');
const cancelRoutes =
require("./backend/routes/cancelRoutes");

// ===============================
// Utils
// ===============================

const {
    globalErrorHandler
} = require('./backend/utils/errorHandler');


const {
    initScheduledCleanup
} = require('./backend/utils/fileCleanup');




// ===============================
// App
// ===============================

const app = express();

const PORT =
process.env.PORT || 3000;


app.set(
    'trust proxy',
    1
);




// ===============================
// Directories
// ===============================

const tempDir =
path.resolve(
    process.env.TEMP_DIR || './temp'
);


const downloadsDir =
path.resolve(
    process.env.DOWNLOADS_DIR || './downloads'
);



fs.ensureDirSync(tempDir);

fs.ensureDirSync(downloadsDir);





// ===============================
// Security
// ===============================


app.use(
    helmet({

        contentSecurityPolicy:false,

        crossOriginEmbedderPolicy:false

    })
);



app.use(cors());



app.use(
    express.json()
);



app.use(
    express.urlencoded({
        extended:true
    })
);






// ===============================
// Rate Limit
// ===============================


const limiter =
rateLimit({

    windowMs:

    parseInt(
        process.env.WINDOW_MS
    )
    ||
    15 * 60 * 1000,


    max:

    parseInt(
        process.env.MAX_REQUESTS_PER_WINDOW
    )
    ||
    100,


    message:{

        status:"fail",

        message:
        "Too many requests"

    }


});



const progressLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 10000
});

app.use('/api/progress', progressLimiter, progressRoutes);
app.use(
    "/api/cancel",
    cancelRoutes
);




// ===============================
// Frontend
// ===============================


app.use(
    express.static(
        path.join(
            __dirname,
            'public'
        )
    )
);




// ===============================
// API Routes
// ===============================


app.use(
    '/api/progress',
    progressRoutes
);



app.use(
    '/api/info',
    infoRoutes
);



app.use(
    '/api/download',
    downloadRoutes
);






// ===============================
// Home
// ===============================


app.get(
'/',
(req,res)=>{


    res.sendFile(

        path.join(
            __dirname,
            'public',
            'index.html'
        )

    );


});






// ===============================
// Test
// ===============================


app.get(
'/test',
(req,res)=>{


    res.send(
        "SERVER IS WORKING"
    );


});






// ===============================
// Error Handler
// ===============================


app.use(
    globalErrorHandler
);







// ===============================
// Cleanup
// ===============================


initScheduledCleanup(

    [
        tempDir,
        downloadsDir
    ],


    parseInt(
        process.env.CLEANUP_INTERVAL_MINUTES
    )
    ||
    15,


    parseInt(
        process.env.MAX_FILE_AGE_MINUTES
    )
    ||
    30


);








// ===============================
// Get Local IP
// ===============================


function getLocalIP(){


    const interfaces =
    os.networkInterfaces();



    for(
        const name of Object.keys(interfaces)
    ){


        for(
            const net of interfaces[name]
        ){


            if(

                net.family === "IPv4"
                &&
                !net.internal

            ){

                return net.address;

            }


        }


    }



    return "localhost";

}








// ===============================
// Start Server
// ===============================


app.listen(

PORT,

"0.0.0.0",

()=>{


console.log(
`
====================================================

 Video Downloader Pro Server Running

 Local:
 http://localhost:${PORT}

 Network:
 http://${getLocalIP()}:${PORT}

 Progress API:
 http://localhost:${PORT}/api/progress/:id

 Download API:
 http://localhost:${PORT}/api/download

 Environment:
 ${process.env.NODE_ENV || "development"}

====================================================
`
);


});