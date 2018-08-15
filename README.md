# fastify-statsd

Add statsd logging for your endpoints in Fastify

**You need to use Fastify version 0.31 or newer, the hook used (onSend) was added in this version**

## Install
``
npm install --save fastify-statsd
``

## Usage

Add it to you project with `register` and you are done!

```javascript
// Register the plugin
fastify.register(require('fastify-statsd'), { host: 'localhost', port: 8125, metric_name: 'my_endpoint' });
```

## Options

This plugin allows you to specify the following options:

- `metric_name` is used when prefixing metric names sent to statsd
- `host` statsd host, defaults to 'localhost'
- `port` statsd port number, defaults to 8125 