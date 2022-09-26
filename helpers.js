import http from 'k6/http';
import { check } from 'k6';

export function getUrl(path) {
  const baseUrl = __ENV.BASE_URL || 'http://localhost:3001';
  return `${baseUrl}${path}`;
}

function getOptions(accessToken) {
  return {
    get: {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    },
    post: {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken}`,
      },
    },
  };
}

function checkAndReturn(res) {
  check(res, {
    Success: (r) => r.status >= 200 && r.status < 300,
  });
  return res;
}

export function getHttp(accessToken) {
  const options = getOptions(accessToken);

  return {
    get: (url) => checkAndReturn(http.get(url, options.get)),
    delete: (url) => checkAndReturn(http.del(url, null, options.get)),
    post: (url, body) =>
      checkAndReturn(http.post(url, JSON.stringify(body), options.post)),
    patch: (url, body) =>
      checkAndReturn(http.patch(url, JSON.stringify(body), options.post)),
    put: (url, body) =>
      checkAndReturn(http.put(url, JSON.stringify(body), options.post)),
  };
}
