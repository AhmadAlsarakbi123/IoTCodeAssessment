const express = require('express');
const redis = require('redis');
const { v4: uuidv4 } = require('uuid');

const app = express();
app.use(express.json());

const client = redis.createClient({ url: 'redis://redis:6379' });

client.on('error', (err) => console.log('Redis Client Error', err));

(async () => {
    await client.connect();
})();

async function waitForResponse(channel, requestId, timeout = 3000) {
    return new Promise((resolve, reject) => {
        const timeoutId = setTimeout(() => {
            client.unsubscribe(channel);
            reject(new Error('Timeout waiting for response'));
        }, timeout);

        client.subscribe(channel, (message) => {
            const response = JSON.parse(message);
            if (response.requestId === requestId) {
                clearTimeout(timeoutId);
                client.unsubscribe(channel);
                resolve(response);
            }
        });
    });
}

app.post('/auth', async (req, res) => {
    const authRequestId = uuidv4();
    const message = { requestId: authRequestId, data: req.body };

    // Publish the authentication request
    await client.publish('auth_requests', JSON.stringify(message));

    // Wait for the response from `auth-service`
    try {
        const {status, token} = await waitForResponse('auth_responses', authRequestId);
        if (token.length) {
            res.send({ status, token });
        } else {
            res.status(401).send({ status });
        }
    } catch (error) {
        res.status(500).send({ error: 'Authentication service did not respond in time' });
    }
});

app.post('/save', async (req, res) => {
    const saveRequestId = uuidv4();
    const message = { requestId: saveRequestId, data: req.body };

    // Publish the data-saving request
    await client.publish('save_requests', JSON.stringify(message));

    // Wait for the response from `save-service`
    try {
        const {status, success} = await waitForResponse('save_responses', saveRequestId);
        if (success) {
            res.send({ status });
        } else {
            res.status(500).send({ status });
        }
    } catch (error) {
        res.status(500).send({ error: 'Data save service did not respond in time' });
    }
});

app.listen(3000, () => {
    console.log('API service running on port 3000');
});
