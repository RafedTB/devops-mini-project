import http from 'k6/http';
import { check, sleep } from 'k6';

// Target URL: configurable via environment variable BASE_URL (defaults to local backend)
const BASE_URL = __ENV.BASE_URL || 'http://localhost:3000';

export const options = {
  // Test workload: 20 Virtual Users continuously sending requests for 30 seconds
  vus: 20,
  duration: '30s',

  // Quality of Service (QoS) criteria
  thresholds: {
    // Error rate must remain below 1%
    http_req_failed: ['rate<0.01'],
    // 95% of requests must complete in under 500ms (SLO definition EX-07 / R-PERF-07)
    http_req_duration: ['p(95)<500'],
  },
};

export default function () {
  const res = http.get(`${BASE_URL}/api/products`);

  // Assertions (Checks)
  check(res, {
    'statut HTTP est 200': (r) => r.status === 200,
    'temps de réponse < 500ms': (r) => r.timings.duration < 500,
  });

  // Short pause between iterations to simulate realistic concurrent browsing (~48 RPS as in doc)
  sleep(0.4);
}
