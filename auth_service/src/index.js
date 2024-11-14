const redis = require('redis');

// define two clients one for subscription mode the other for normal push operation
const subscribeClient = redis.createClient({ url: 'redis://redis:6379' });
const publishClient = redis.createClient({ url: 'redis://redis:6379' });

subscribeClient.on('error', (err) => console.log('Redis subscribeClient Error', err));
publishClient.on('error', (err) => console.log('Redis publishClient Error', err));

(async () => {
    await subscribeClient.connect();
    await publishClient.connect();
    await subscribeClient.subscribe('auth_requests', async (message) => {
        const { requestId, data } = JSON.parse(message);
        let isAuthenticated = false;
        let authToken = '';
        if (typeof data.username == 'string') {
            // Simulate authentication processing
            isAuthenticated = data.username.toLowerCase() === 'ahmad' && data.password === 'my-password';
            if (isAuthenticated) {
                authToken = "123456";
            }
        }

        const response = {
            requestId,
            status: isAuthenticated ? 'Authenticated' : 'Authentication failed',
            token: authToken
        };
        await publishClient.publish('auth_responses', JSON.stringify(response));
        console.log('Authentication processed:', response);
    });
})();
