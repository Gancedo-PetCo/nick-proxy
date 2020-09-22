const axios = require('axios');
const redis = require('redis');
const { promisifyAll } = require('bluebird');

const client = redis.createClient();
promisifyAll(client);

describe('The server\'s CRUD operations', () => {
  describe('includes the GET method for the path /product/:itemId where', () => {
    test('the server correctly SSRs a page for that item', () => {
      return axios.get('http://127.0.0.1:3003/product/100')
        .then((response) => {
          const { status, data } = response;

          expect(status).toBe(200);
          expect(data).toBeDefined();
          expect(typeof(data)).toBe('string');
          expect(data).toContain('<!DOCTYPE html>');
          expect(data).toContain('<script src="/imagesBundle.js"></script>');
          expect(data).toContain('galleryMainImageDiv');
        })
        .catch((err) => {
          console.log(err);
        });
    });

    test('the server correctly returns 404 for an item not in the DB', () => {
      return axios.get('http://127.0.0.1:3003/product/99')
        .catch((err) => {
          expect(err.response.status).toBe(404);
        });
    });
  });

  describe('correctly save the info they just queried from DB, in redis', () => {
    test('for GET /product/:itemId route', (done) => {
      client.getAsync('pSSR100')
        .then((response) => {
          expect(response).toBeDefined();
          done();
        })
        .catch((err) => {
          console.log(err);
        });
    });
  });
});
