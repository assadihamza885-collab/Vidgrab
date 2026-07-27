const progressMap = new Map();

const cancelledMap = new Set();


// ======================================
// CREATE
// ======================================

function create(id) {

    console.log("CREATE:", id);


    cancelledMap.delete(id);


    progressMap.set(id, {

        percent: 0,

        speed: "0 MB/s",

        eta: "--",

        status: "Starting..."

    });

}




// ======================================
// UPDATE
// ======================================

function update(id, data) {


    console.log(
        "UPDATE:",
        id,
        data
    );



    // Stop updates after cancel

    if(cancelledMap.has(id)){


        console.log(
            "IGNORED UPDATE - CANCELLED:",
            id
        );


        return;

    }




    if(!progressMap.has(id)){


        console.log(
            "NOT FOUND:",
            id
        );


        return;

    }




    progressMap.set(id, {


        ...progressMap.get(id),


        ...data


    });





    console.log(

        "CURRENT:",
        progressMap.get(id)

    );


}




// ======================================
// GET
// ======================================

function get(id){

    return progressMap.get(id);

}





// ======================================
// REMOVE
// ======================================

function remove(id){


    progressMap.delete(id);


    cancelledMap.delete(id);


}





// ======================================
// CANCEL
// ======================================

function cancel(id){


    console.log(
        "MARK CANCELLED:",
        id
    );


    cancelledMap.add(id);



    if(progressMap.has(id)){


        progressMap.set(id, {


            ...progressMap.get(id),


            percent:0,


            speed:"",


            eta:"--",


            status:"Cancelled"


        });


    }



}




// ======================================
// CHECK CANCEL
// ======================================

function isCancelled(id){


    return cancelledMap.has(id);


}




module.exports = {


    create,

    update,

    get,

    remove,

    cancel,

    isCancelled


};