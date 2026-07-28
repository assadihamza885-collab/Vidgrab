// ======================================
// Progress Service
// ======================================


const progressMap = new Map();

const cancelledMap = new Set();



// ======================================
// CREATE
// ======================================

function create(id) {


    cancelledMap.delete(id);



    progressMap.set(id, {


        percent: 0,


        speed: "0 MB/s",


        eta: "--",


        status: "Starting..."


    });


    return true;

}





// ======================================
// UPDATE
// ======================================

function update(id, data) {



    if (cancelledMap.has(id)) {


        return;

    }





    const current = progressMap.get(id);



    if (!current) {


        return;

    }




    progressMap.set(id, {


        ...current,


        ...data


    });



}







// ======================================
// GET
// ======================================

function get(id){


    return (

        progressMap.get(id)

        ||

        {

            percent:0,

            speed:"",

            eta:"--",

            status:"Not Found"

        }

    );


}







// ======================================
// REMOVE
// ======================================

function remove(id){


    progressMap.delete(id);


}







// ======================================
// CANCEL
// ======================================

function cancel(id){



    cancelledMap.add(id);




    const current =
        progressMap.get(id);




    if(current){


        progressMap.set(id,{


            ...current,


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







// ======================================
// EXISTS
// ======================================

function exists(id){


    return progressMap.has(id);


}







module.exports = {


    create,


    update,


    get,


    remove,


    cancel,


    isCancelled,


    exists


};