import * as express from 'express';
import * as history from 'connect-history-api-fallback';
import * as proxy from 'express-http-proxy';

const app: express.Application = express();
const port: number = +(process.env.PORT || 3030);
app.use(history());
app.use('/services', proxy('https://kirimuang-service.herokuapp.com'));
app.use(express.static('dist'));
// Serve the application at the given port
app.listen(port, () => {

    // tslint:disable-next-line:no-console
    console.log(`Listening at http://localhost:${port}/`);
});
