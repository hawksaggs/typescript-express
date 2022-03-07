import {
    cleanEnv, str, port
} from 'envalid';

function validateEnv() {
    cleanEnv(process.env, {
        MONGO_DB_URL: str(),
        PORT: port(),
        JWT_SECRET: str(),
    });
}

export {
    validateEnv
}
