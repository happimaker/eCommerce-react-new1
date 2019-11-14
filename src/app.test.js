const request = require('supertest');

process.env = Object.assign(process.env, { SECRET: 'squirrel' });
const app = require('./app');

/* HTTP Return Codes */
const SUCCESS = 200;
const BAD_REQUEST = 400;
const UNAUTHORISED = 401;
const NOT_FOUND = 404;

describe('When trying to login using GET ', () => {
  test('The login is rejected', async () => {
    await request(app).post('/login').expect(BAD_REQUEST);
  });
});

describe('When trying to login using POST ', () => {
  test('If no credentials are supplied - The login is rejected', async () => {
    await request(app).post('/login')
      .set('Content-Type', 'application/json')
      .set('Accept', 'application/json')
      .expect(BAD_REQUEST);
  });

  test('If username is not supplied - The login is rejected', async () => {
    const data = { password: 'impotent' };
    await request(app).post('/login')
      .send(data)
      .set('Content-Type', 'application/json')
      .set('Accept', 'application/json')
      .expect(BAD_REQUEST);
  });

  test('If password is not supplied - The login is rejected', async () => {
    await request(app).post('/login')
      .send({ username: 'impotent' })
      .set('Content-Type', 'application/json')
      .set('Accept', 'application/json')
      .expect(BAD_REQUEST);
  });

  test('If invalid credentials are supplied - The login is rejected', async () => {
    await request(app).post('/login')
      .send({ username: 'adora', password: 'greyskull' })
      .set('Content-Type', 'application/json')
      .set('Accept', 'application/json')
      .expect(UNAUTHORISED);
  });

  test('If a valid user and password are supplied - the login is successful', async () => {
    await request(app).post('/login')
      .send({ username: 'impotent', password: 'impotent' })
      .set('Content-Type', 'application/json')
      .set('Accept', 'application/json')
      .expect(SUCCESS);
  });
});

describe('When trying to logout', () => {
  test('it is not possible to logout using GET ', async () => {
    await request(app).get('/logout')
      .expect(NOT_FOUND);
  });

  test('no credentials are required for the logoff to be successful', async () => {
    await request(app).post('/logout')
      .set('Content-Type', 'application/json')
      .set('Accept', 'application/json')
      .expect(SUCCESS);
  });
});

describe('When attempting to receive user details', () => {
  test('If not logged in the user is not returned', async () => {
    await request(app).post('/user')
      .set('Content-Type', 'application/json')
      .set('Accept', 'application/json')
      .expect(NOT_FOUND);
  });
});
