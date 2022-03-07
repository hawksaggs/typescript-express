import * as express from 'express';
import * as jwt from 'jsonwebtoken';
import RequestWithUser from '../interfaces/requestWithUser.interface';
import WrongCredentialsException from "../exceptions/WrongCredentialsException";
import DataStoredInToken from "../interfaces/dataStoredInToken.interface";
import userModel from "../users/user.model";

async function authMiddlware(request: RequestWithUser, response: express.Response, next: express.NextFunction) {
    const cookies = request.cookies;
    if (cookies && cookies.Authorization) {
        const secret = process.env.JWT_SECRET;
        try {
            const verificationResponse = jwt.verify(cookies.Authorization, secret) as DataStoredInToken
            const id = verificationResponse._id;
            const user = await userModel.findById(id);
            if (user) {
                request.user = user;
                return next();
            }
        } catch (error) {
            next(new WrongCredentialsException());
        }
    }

    next(new WrongCredentialsException());
}

export default authMiddlware;
