const processes = new Map();

function set(id, process) {
    processes.set(id, process);
}

function get(id) {
    return processes.get(id);
}

function remove(id) {
    processes.delete(id);
}

module.exports = {
    set,
    get,
    remove
};