const {createClient} = require('redis')
require('dotenv').config({ quiet: true });

const redisClient = createClient({
    username: 'default',
    password: process.env.REDIS_PASS,
    socket: {
        host: 'redis-15097.crce295.us-east-1-1.ec2.cloud.redislabs.com',
        port: 15097,
        reconnectStrategy: retries => {
            return Math.min(retries * 50, 500);
        }
    }
});

module.exports = redisClient;