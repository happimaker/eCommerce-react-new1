const app = require('./app');

const PORT = 8080;

const server = app.listen(PORT, () => {
  /* seems standard practice to have a console line here */
  /* eslint-disable-next-line no-console */
  console.log(`Listening on port ${PORT}`);
});

process.on('SIGTERM', () => {
  server.close();
});

process.on('SIGINT', () => {
  server.close();
});
