import { RequestHandler } from "express";
import AsyncHandler from "../utils/asyncHandler";
import Category from "../models/categoryModel";
import AppError from "../utils/appError";

export const getAllCategories: RequestHandler = AsyncHandler(
  async (req, res, next) => {
    const categories = await Category.find();

    const features = new APIFeatures(categories, req.query);

    const categoryQuery = await features.query;

    res.status(200).json({
      status: "success",
      results: categoryQuery.length,
      data: {
        data: categoryQuery,
      },
    });
  }
);

export const getCategory: RequestHandler = AsyncHandler(
  async (req, res, next) => {
    const { id } = req.params;

    const category = await Category.findById(id);
    if (!category) throw new AppError("Category not found", 404);

    res.status(200).json({
      status: "success",
      data: {
        data: category,
      },
    });
  }
);

export const createCategory: RequestHandler = AsyncHandler(
  async (req, res, next) => {
    const { title } = req.body;
    if (!title) throw new AppError("Enter category title", 400);

    const newCategory = await Category.create({
      title,
    });

    res.status(201).json({
      status: "success",
      data: {
        data: newCategory,
      },
    });
  }
);

export const updateCategory: RequestHandler = AsyncHandler(
  async (req, res, next) => {
    const { id } = req.params;

    const { title } = req.body;

    const category = await Category.findById(id);
    if (!category) throw new AppError("Category not found", 404);

    category.title = title;
    await category.save();

    res.status(200).json({
      status: "success",
      data: {
        data: category,
      },
    });
  }
);

export const deleteCategory: RequestHandler = AsyncHandler(
  async (req, res, next) => {
    const { id } = req.params;

    const category = await Category.findByIdAndDelete(id);

    if (!category) throw new AppError("Category not found", 404);

    res.status(204).json({
      status: "success",
    });
  }
);
