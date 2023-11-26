"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const process_1 = __importDefault(require("process"));
const mongoose_1 = __importDefault(require("mongoose"));
const config_1 = __importDefault(require("./config"));
const app_1 = __importDefault(require("./app"));
process_1.default.on("uncaughtException", (err) => {
    console.log(err.name, err.message);
    console.log("UNCAUGHT EXPRESSION, SHUTTING DOWN ....");
    process_1.default.exit(1);
});
const port = process_1.default.env.PORT || 9000;
const URI = process_1.default.env.DATABASE.replace("<PASSWORD>", process_1.default.env.DATABASE_PASSWORD);
mongoose_1.default.connect(URI).then(() => {
    console.log("Database connection successful");
});
const server = app_1.default.listen(port, () => {
    console.log(`${config_1.default.APP_NAME} App listening on port ${port} in ${config_1.default.NODE_ENV} mode`);
});
process_1.default.on("unhandledRejection", (err) => {
    console.log(err.name, err.message);
    console.log("UNHANDLED REJECTION, SHUTTING DOWN...");
    server.close(() => {
        process_1.default.exit(1);
    });
});
