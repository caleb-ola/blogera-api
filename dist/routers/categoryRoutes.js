"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const categoryController_1 = require("../controllers/categoryController");
const retrictTo_1 = __importDefault(require("../middlewares/retrictTo"));
const protect_1 = __importDefault(require("../middlewares/protect"));
const router = (0, express_1.Router)();
router
    .route("/")
    .get(categoryController_1.getAllCategories)
    .post(protect_1.default, (0, retrictTo_1.default)("admin"), categoryController_1.createCategory);
router
    .route("/:id")
    .get(categoryController_1.getCategory)
    .patch(protect_1.default, (0, retrictTo_1.default)("admin"), categoryController_1.updateCategory)
    .delete(protect_1.default, (0, retrictTo_1.default)("admin"), categoryController_1.deleteCategory);
exports.default = router;
