"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateRandomPostID = void 0;
const crypto_1 = __importDefault(require("crypto"));
function generateRandomPostID(start = 6, middle = 12, end = 6) {
    const key = [start, end, middle, end, start];
    const keyGen = [];
    for (let i = 0; i <= key.length; i++) {
        const randomSuffix = crypto_1.default.randomBytes(i).toString("hex");
        keyGen.push(randomSuffix);
    }
    return keyGen.join("-").slice(1);
}
exports.generateRandomPostID = generateRandomPostID;
