import * as express from 'express';
import * as bodyParser from 'body-parser';
import * as mongoose from "mongoose";
import Controller from './interfaces/controller.interface';
import errorMiddleware from './middlewares/error.middleware';

class App {
    private app: express.Application;

    constructor(controllers) {
        this.app = express();

        this.connectDB();
        this.initializeMiddleware();
        this.initializeControllers(controllers);
        this.initializeErrorHandling();
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
        })
    }

    private initializeErrorHandling(){
        this.app.use(errorMiddleware);
    }

    public listen() {
        this.app.listen(process.env.PORT, () => {
            console.log(`App listening on the port: ${process.env.PORT}`);
        });
    }
}

export default App;
