const redis = require('redis');

// define two clients one for subscription mode the other for normal push operation
const subscribeClient = redis.createClient({ url: 'redis://redis:6379' });
const publishClient = redis.createClient({ url: 'redis://redis:6379' });

subscribeClient.on('error', (err) => console.log('Redis subscribeClient Error', err));
publishClient.on('error', (err) => console.log('Redis publishClient Error', err));

(async () => {
    await subscribeClient.connect();
    await publishClient.connect();
    await subscribeClient.subscribe('save_requests', async (message) => {
        const { requestId, data } = JSON.parse(message);

        let isSaved = false;
        let failedMessage = "Data saving failed";
        // Simulate data saving with required name and email
        if (typeof data !== 'undefined' && typeof data.name !== 'undefined' && typeof data.email !== 'undefined') {
            if (data.name.length && data.email.length) {
                isSaved = true;
            } else {
                failedMessage = failedMessage + ' One of the required fields is empty (name, email)!';
            }
        } else {
            failedMessage = failedMessage + ' One of the required fields is missing (name, email)!';
        }

        const response = {
            requestId,
            status: isSaved ? 'Data saved' : failedMessage,
            success: isSaved
        };
        await publishClient.publish('save_responses', JSON.stringify(response));
    });
})();
