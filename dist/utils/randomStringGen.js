"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const crypto_1 = __importDefault(require("crypto"));
function generateRandomUsername(baseUsername, length = 6) {
    const randomSuffix = crypto_1.default.randomBytes(length).toString("hex");
    return `${baseUsername}${randomSuffix}`;
}
exports.default = generateRandomUsername;
