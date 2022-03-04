import * as express from 'express';
import * as bodyParser from 'body-parser';
import * as mongoose from "mongoose";
import Controller from './interfaces/controller.interface';

class App {
    private app: express.Application;
    private port: number;

    constructor(controllers, port) {
        this.app = express();
        this.port = port;

        this.connectDB();
        this.initializeMiddleware();
        this.initializeControllers(controllers);
    }

    private static loggerMiddleware(request: express.Request, response: express.Response, next) {
        console.log(`${request.method} ${request.path}`);
        next();
    }

    private initializeMiddleware() {
        this.app.use(App.loggerMiddleware);
        this.app.use(bodyParser.json());
    }

    private initializeControllers(controllers: Controller[]){
        controllers.forEach((controller) => {
            this.app.use('/', controller.router);
        })
    }

    private connectDB() {
        const {
            MONGO_DB_URL,
        } = process.env;

        mongoose.connect(`${MONGO_DB_URL}`, () => {
            console.log('Database is conncted');
        });
    }

    public listen() {
        this.app.listen(this.port, () => {
            console.log(`App listening on the port: ${this.port}`);
        });
    }
}

export default App;
