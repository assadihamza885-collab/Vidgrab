const queue = [];

let running = 0;

const MAX_CONCURRENT = 3;
const MAX_RETRIES = 3;

async function executeWithRetry(task) {

    let lastError;

    for (let i = 1; i <= MAX_RETRIES; i++) {

        try {

            return await task();

        } catch (err) {

            lastError = err;

            console.log(`Retry ${i}/${MAX_RETRIES}`);

            if (i < MAX_RETRIES) {

                await new Promise(resolve =>
                    setTimeout(resolve, 3000)
                );

            }

        }

    }

    throw lastError;

}

async function processQueue() {

    if (running >= MAX_CONCURRENT) return;

    if (queue.length === 0) return;

    const item = queue.shift();

    running++;

    try {

        const result = await executeWithRetry(item.task);

        item.resolve(result);

    } catch (err) {

        item.reject(err);

    } finally {

        running--;

        processQueue();

    }

}

function add(task) {

    return new Promise((resolve, reject) => {

        queue.push({

            task,

            resolve,

            reject

        });

        processQueue();

    });

}

module.exports = {

    add

};