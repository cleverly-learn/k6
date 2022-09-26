import { check, group, sleep } from 'k6';
import k6Http from 'k6/http';
import { getUrl, getHttp } from './helpers.js';
import { URL } from 'https://jslib.k6.io/url/1.0.0/index.js';

export const options = {
  vus: 1,
  duration: '1m',
  thresholds: {
    http_req_duration: ['p(99)<1500'],
    http_req_failed: ['rate<0.01'],
  },
};

const LOGIN = 'admin';
const PASSWORD = 'admin';

export function setup() {
  const response = k6Http.post(getUrl('/api/auth/login'), {
    login: LOGIN,
    password: PASSWORD,
  });
  return response.json('accessToken');
}

export default function (token) {
  const http = getHttp(token);

  group('Profile', () => {
    group('Get', () => {
      http.get(getUrl('/api/users/me'));
    });

    group('Patch', () => {
      http.patch(getUrl('/api/users/me'), {
        firstName: 'admin',
        lastName: 'admin',
        patronymic: 'admin',
      });
    });

    group('Change password', () => {
      http.patch(getUrl('/api/users/me'), { password: 'admin' });
    });
  });

  group('Admins', () => {
    group('Get page', () => {
      const url = new URL(getUrl('/api/users/'));
      url.searchParams.append('role', 0);
      url.searchParams.append('page', 0);
      url.searchParams.append('size', 1);

      const res = http.get(url.toString());

      check(res, {
        'Admins returned': (r) => r.json().data.length > 0,
      });
    });

    group('Add, patch, delete', () => {
      const userId = http
        .post(getUrl('/api/users'), {
          firstName: 'test',
          lastName: 'test',
          patronymic: 'test',
          password: 'test',
          isRegistered: true,
          isAdmin: true,
        })
        .json('id');

      http.patch(getUrl(`/api/users/${userId}`), {
        firstName: 'test1',
        password: 'test1',
      });

      http.delete(getUrl(`/api/users/${userId}`));
    });
  });

  sleep(1);
}
