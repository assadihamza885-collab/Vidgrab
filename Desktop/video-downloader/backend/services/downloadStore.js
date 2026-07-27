const downloads = new Map();

function set(id, data) {
    console.log("STORE SET:", id);

    downloads.set(id, data);

    console.log("MAP SIZE:", downloads.size);
}

function get(id) {
    console.log("STORE GET:", id);

    const item = downloads.get(id);

    console.log("FOUND:", item);

    return item;
}

function remove(id) {
    downloads.delete(id);
}

module.exports = {
    set,
    get,
    remove
};