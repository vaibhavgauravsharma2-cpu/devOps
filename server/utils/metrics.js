const client = require('prom-client');

// Create a Registry to register the metrics
const register = new client.Registry();

// Add a default label to all metrics
register.setDefaultLabels({ app: 'mern-ecommerce' });

// Enable default metrics (CPU, memory, event loop, GC etc.)
client.collectDefaultMetrics({ register });

// ─── Custom Metrics ──────────────────────────────────────────────────

// HTTP request duration histogram
const httpRequestDuration = new client.Histogram({
  name: 'http_request_duration_seconds',
  help: 'Duration of HTTP requests in seconds',
  labelNames: ['method', 'route', 'status_code'],
  buckets: [0.005, 0.01, 0.025, 0.05, 0.1, 0.25, 0.5, 1, 2.5, 5, 10]
});

// HTTP request counter
const httpRequestCounter = new client.Counter({
  name: 'http_requests_total',
  help: 'Total number of HTTP requests',
  labelNames: ['method', 'route', 'status_code']
});

// Active connections gauge
const activeConnections = new client.Gauge({
  name: 'active_connections',
  help: 'Number of active connections'
});

// MongoDB connection status gauge
const mongoStatus = new client.Gauge({
  name: 'mongodb_connection_status',
  help: 'MongoDB connection status (1 = connected, 0 = disconnected)'
});

register.registerMetric(httpRequestDuration);
register.registerMetric(httpRequestCounter);
register.registerMetric(activeConnections);
register.registerMetric(mongoStatus);

// ─── Middleware to track HTTP requests ────────────────────────────────
const metricsMiddleware = (req, res, next) => {
  const start = Date.now();
  activeConnections.inc();

  res.on('finish', () => {
    const duration = (Date.now() - start) / 1000;
    const route = req.route ? req.route.path : req.path;
    const labels = {
      method: req.method,
      route: route,
      status_code: res.statusCode
    };
    httpRequestDuration.observe(labels, duration);
    httpRequestCounter.inc(labels);
    activeConnections.dec();
  });

  next();
};

module.exports = { register, metricsMiddleware, mongoStatus };
