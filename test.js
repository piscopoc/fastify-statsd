/* eslint-disable no-confusing-arrow */

"use strict";

const t = require('tap');
const test = t.test;
const Fastify = require('fastify');
const fastifyStatsD = require('./index');

const STATSD_HOST = 'localhost';
const STATSD_PORT = 8125;


test('Basic', t => {
    t.plan(2);

    const fastify = Fastify();
    fastify.register(fastifyStatsD, { host: 'localhost', port: 8125, telegraf: true, metric_name: 'my_endpoint' });

    const retPayload = 'ok';

    fastify.get('/:id', (req, reply) => {
        reply.send(retPayload);
    });

    fastify.inject('/123456', (err, res) => {
        t.error(err);
        t.deepEqual(res.payload, retPayload);
        t.end();
        fastify.close();
    });
});