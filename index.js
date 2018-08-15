"use strict";

const fp = require("fastify-plugin");
const symbolRequestTime = Symbol("RequestTimer");
const StatsD = require('hot-shots');

const fastifyStatsd = (fastify, options, next) => {

    const host = options.host || 'localhost',
        port = options.port || 8125,
        metric_name = options.metric_name || process.title,
        digits = 4;

    const client = new StatsD({
        host: host,
        port: port,
        errorHandler: function(error) {
            fastify.log.error(`error connecting to ${host}:${port}`, error);
        }
    });

    const onRequest = (req, res, next) => {
        // Store the start timer in nanoseconds resolution
        req[symbolRequestTime] = process.hrtime();
        next();
    };

    const onSend = (request, reply, payload, next) => {

        // Calculate the duration, in nanoseconds...
        const hrDuration = process.hrtime(request.req[symbolRequestTime]);
        // … convert it to milliseconds...
        const duration = (hrDuration[0] * 1e3 + hrDuration[1] / 1e6).toFixed(digits);

        const tags = {
            request_method: request.raw.method,
            request_url: request.raw.url,
            request_endpoint: reply.context.config.url
        };

        const tagString = Object.keys(tags).map(t => `${t}:${tags[t]}`);

        // log the metrics
        client.increment(`${metric_name}_processed`, tagString);
        client.timing(`${metric_name}_execution_time`, duration, tagString);
        client.gauge(`${metric_name}_payload`, getBinarySize(payload), tagString);

        next();
    };

    const getBinarySize = (obj) => {
        let strPayload = obj;

        if (typeof obj !== 'string') {
            strPayload = JSON.stringify(s);
        }

        return Buffer.byteLength(strPayload, 'utf8')
    };

    // Hook to be triggered on request (start time) 
    fastify.addHook('onRequest', onRequest);
    // Hook to be triggered just before response to be send
    fastify.addHook('onSend', onSend);

    next();
};


module.exports = fp(fastifyStatsd, {
    fastify: '>=1.0.0',
    name: 'fastify-statsd'
});