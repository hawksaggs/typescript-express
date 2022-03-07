import * as express from 'express';
import * as bcrypt from 'bcrypt';
import * as jwt from 'jsonwebtoken';
import Controller from "../interfaces/controller.interface";
import userModel from "../users/user.model";
import CreateUserDto from "../users/user.dto";
import UserWithThatEmailAlreadyExistsException from "../exceptions/UserWithThatEmailAlreadyExistsException";
import logInDto from "./logIn.dto";
import WrongCredentialsException from "../exceptions/WrongCredentialsException";
import validationMiddleware from "../middlewares/validation.middleware";
import User from "../users/user.interface";
import TokenData from "../interfaces/tokenData.interface";
import DataStoredInToken from "../interfaces/dataStoredInToken.interface";

class AuthenticationController implements Controller {
    public path = '/auth';
    public router = express.Router();
    private userModel = userModel;

    constructor() {
        this.initializeRouter();
    }

    private initializeRouter() {
        this.router.post(`${this.path}/register`, validationMiddleware(CreateUserDto), this.register);
        this.router.post(`${this.path}/login`, validationMiddleware(logInDto), this.loggingIn);
        this.router.post(`${this.path}/logout`,  this.loggingOut);
    }

    private register = async (request: express.Request, response: express.Response, next: express.NextFunction) => {
        const userData: CreateUserDto = request.body;

        if (await this.userModel.findOne({ email: userData.email })) {
            next(new UserWithThatEmailAlreadyExistsException(userData.email));
        } else {
            const hashedPassword = await bcrypt.hash(userData.password, 10);
            const user = await this.userModel.create({
                ...userData,
                password: hashedPassword
            });
            user.password = undefined;
            const tokenData = this.createToken(user);
            response.setHeader('Set-Cookie', [this.createCookie(tokenData)]);
            return response.send(user);
        }
    }

    private loggingIn = async (request: express.Request, response: express.Response, next: express.NextFunction) => {
        const logInData: logInDto = request.body;
        const user = await this.userModel.findOne({ email: logInData.email });
        if (user) {
            const isPasswordMatching = await bcrypt.compare(logInData.password, user.password);
            if (isPasswordMatching) {
                user.password = undefined;
                const tokenData = this.createToken(user);
                response.setHeader('Set-Cookie', [this.createCookie(tokenData)]);
                return response.send(user);
            }
        }
        next(new WrongCredentialsException());
    }

    private createToken(user: User): TokenData {
        const expiresIn = 60 * 60; // an hour
        const secret = process.env.JWT_SECRET;
        const dataStotedInToken: DataStoredInToken = {
            _id: user._id
        };
        const token = jwt.sign(dataStotedInToken, secret, { expiresIn });
        return {
            expiresIn,
            token
        }
    }

    private createCookie(tokenData: TokenData) {
        return `Authorization=${tokenData.token}; HttpOnly; Max-Age=${tokenData.expiresIn}`;
    }

    private loggingOut = (request: express.Request, response: express.Response) => {
        response.setHeader('Set-Cookie', ['Authorization=;Max-age=0']);
        response.send(200);
    }
}

export default AuthenticationController;
