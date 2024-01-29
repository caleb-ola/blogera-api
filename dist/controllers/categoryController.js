"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteCategory = exports.updateCategory = exports.createCategory = exports.getCategory = exports.getAllCategories = void 0;
const asyncHandler_1 = __importDefault(require("../utils/asyncHandler"));
const categoryModel_1 = __importDefault(require("../models/categoryModel"));
const appError_1 = __importDefault(require("../utils/appError"));
exports.getAllCategories = (0, asyncHandler_1.default)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const categories = yield categoryModel_1.default.find();
    res.status(200).json({
        status: "success",
        data: {
            data: categories,
        },
    });
}));
exports.getCategory = (0, asyncHandler_1.default)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    const category = yield categoryModel_1.default.findById(id);
    if (!category)
        throw new appError_1.default("Category not found", 404);
    res.status(200).json({
        status: "success",
        data: {
            data: category,
        },
    });
}));
exports.createCategory = (0, asyncHandler_1.default)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { title } = req.body;
    if (!title)
        throw new appError_1.default("Enter category title", 400);
    const newCategory = yield categoryModel_1.default.create({
        title,
    });
    res.status(201).json({
        status: "success",
        data: {
            data: newCategory,
        },
    });
}));
exports.updateCategory = (0, asyncHandler_1.default)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    const { title } = req.body;
    const category = yield categoryModel_1.default.findById(id);
    if (!category)
        throw new appError_1.default("Category not found", 404);
    category.title = title;
    yield category.save();
    res.status(200).json({
        status: "success",
        data: {
            data: category,
        },
    });
}));
exports.deleteCategory = (0, asyncHandler_1.default)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    const category = yield categoryModel_1.default.findByIdAndDelete(id);
    if (!category)
        throw new appError_1.default("Category not found", 404);
    res.status(204).json({
        status: "success",
    });
}));
