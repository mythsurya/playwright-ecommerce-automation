import { expect, test } from '@playwright/test';

test('storefront responds with an HTML page', async ({ request }) => {
  const response = await request.get('/');

  expect(response.status()).toBe(200);
  expect(response.headers()['content-type']).toContain('text/html');
  await expect(response.text()).resolves.toContain('Automation Practice');
});

test('catalog search returns the requested product', async ({ request }) => {
  const response = await request.get('/search', {
    params: {
      controller: 'search',
      orderby: 'position',
      orderway: 'desc',
      search_query: 'Faded Short Sleeves T-shirt',
    },
  });
  const body = await response.text();

  expect(response.status()).toBe(200);
  expect(body).toContain('Faded Short Sleeves T-shirt');
});

test('webservice API requires authentication', async ({ request }) => {
  const response = await request.get('/api/products');

  expect(response.status()).toBe(401);
});
