import HttpException from "./HttpException";

class UserWithThatEmailAlreadyExistsException extends HttpException {
    constructor(email: string) {
        super(400, `User already exists with ${email}`);
    }
}

export default UserWithThatEmailAlreadyExistsException;
