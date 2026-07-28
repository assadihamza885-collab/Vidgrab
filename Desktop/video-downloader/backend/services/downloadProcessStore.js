// =====================================
// Download Process Store
// =====================================

const processes = new Map();


// Save process
function set(id, process) {

    processes.set(id, process);

}


// Get process
function get(id) {

    return processes.get(id);

}


// Remove process
function remove(id) {

    processes.delete(id);

}


// Cancel / Kill process
function cancel(id) {

    const process = processes.get(id);


    if (!process) {

        return false;

    }


    try {


        // yt-dlp-wrap emitter
        if (typeof process.kill === "function") {

            process.kill();

        }


        // child process fallback
        else if (process.process) {

            process.process.kill();

        }


        processes.delete(id);


        return true;


    }

    catch(error) {


        console.error(
            "PROCESS CANCEL ERROR:",
            error
        );


        return false;

    }

}




// Check exists
function has(id) {

    return processes.has(id);

}



module.exports = {

    set,

    get,

    remove,

    cancel,

    has

};