const Inquiry = require("../model/WorkSpace/Inquiry");
const Supplier = require("../model/WorkSpace/Supplier");
const Funding = require("../model/WorkSpace/Funding");
const Task = require("../model/WorkSpace/Task");
const Supply = require("../model/WorkSpace/Supply");
const Chat = require("../model/WorkSpace/Chat");
const User = require("../model/common/userModel");

// Helper function for pagination
const paginateResults = async (model, page, limit) => {
  const skip = (page - 1) * limit;
  const data = await model.find().lean().skip(skip).limit(limit);
  const total = await model.countDocuments();
  return {
    data,
    currentPage: page,
    totalPages: Math.ceil(total / limit),
    totalItems: total
  };
};

// Handle inquiries
exports.createInquiry = async (req, res, next) => {
  try {
    const newInquiry = new Inquiry(req.body);
    await newInquiry.save();
    res.status(201).json(newInquiry);
  } catch (err) {
    next(err);
  }
};

exports.getInquiries = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const result = await paginateResults(Inquiry, page, limit);
    res.status(200).json(result);
  } catch (err) {
    next(err);
  }
};

exports.deleteInquiry = async (req, res, next) => {
  try {
    const { inquiryId } = req.params;
    await Inquiry.findByIdAndDelete(inquiryId);
    res.status(200).json({ message: "Inquiry deleted successfully" });
  } catch (err) {
    next(err);
  }
};

// Handle suppliers
exports.createSupplier = async (req, res, next) => {
  try {
    const newSupplier = new Supplier(req.body);
    await newSupplier.save();
    res.status(201).json(newSupplier);
  } catch (err) {
    next(err);
  }
};

exports.getSuppliers = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const result = await paginateResults(Supplier, page, limit);
    res.status(200).json(result);
  } catch (err) {
    next(err);
  }
};

exports.deleteSupplier = async (req, res, next) => {
  try {
    const { supplierId } = req.params;
    await Supplier.findByIdAndDelete(supplierId);
    res.status(200).json({ message: "Supplier deleted successfully" });
  } catch (err) {
    next(err);
  }
};

// Handle funding
exports.createFunding = async (req, res, next) => {
  try {
    const newFunding = new Funding(req.body);
    await newFunding.save();
    res.status(201).json(newFunding);
  } catch (err) {
    next(err);
  }
};

exports.getFundings = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const result = await paginateResults(Funding, page, limit);
    res.status(200).json(result);
  } catch (err) {
    next(err);
  }
};

exports.deleteFunding = async (req, res, next) => {
  try {
    const { fundingId } = req.params;
    await Funding.findByIdAndDelete(fundingId);
    res.status(200).json({ message: "Funding deleted successfully" });
  } catch (err) {
    next(err);
  }
};

// Handle tasks
exports.createTask = async (req, res, next) => {
  try {
    const newTask = new Task(req.body);
    await newTask.save();
    res.status(201).json(newTask);
  } catch (err) {
    next(err);
  }
};

exports.getTasks = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const result = await paginateResults(Task, page, limit);
    res.status(200).json(result);
  } catch (err) {
    next(err);
  }
};

exports.deleteTask = async (req, res, next) => {
  try {
    const { taskId } = req.params;
    await Task.findByIdAndDelete(taskId);
    res.status(200).json({ message: "Task deleted successfully" });
  } catch (err) {
    next(err);
  }
};

// Handle supplies
exports.createSupply = async (req, res, next) => {
  try {
    const newSupply = new Supply(req.body);
    await newSupply.save();
    res.status(201).json(newSupply);
  } catch (err) {
    next(err);
  }
};

exports.getSupplies = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const result = await paginateResults(Supply, page, limit);
    res.status(200).json(result);
  } catch (err) {
    next(err);
  }
};

exports.deleteSupply = async (req, res, next) => {
  try {
    const { supplyId } = req.params;
    await Supply.findByIdAndDelete(supplyId);
    res.status(200).json({ message: "Supply deleted successfully" });
  } catch (err) {
    next(err);
  }
};

// Handle chat
exports.createChat = async (req, res, next) => {
  try {
    const newChat = new Chat(req.body);
    await newChat.save();
    res.status(201).json(newChat);
  } catch (err) {
    next(err);
  }
};

exports.getChats = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    
    const chats = await Chat.find().populate('participants').skip(skip).limit(limit).lean();
    const total = await Chat.countDocuments();
    
    res.status(200).json({
      chats,
      currentPage: page,
      totalPages: Math.ceil(total / limit),
      totalItems: total
    });
  } catch (err) {
    next(err);
  }
};

exports.deleteChat = async (req, res, next) => {
  try {
    const { chatId } = req.params;
    await Chat.findByIdAndDelete(chatId);
    res.status(200).json({ message: "Chat deleted successfully" });
  } catch (err) {
    next(err);
  }
};

// Handle users
exports.getUsers = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const result = await paginateResults(User, page, limit);
    res.status(200).json(result);
  } catch (err) {
    next(err);
  }
};

exports.deleteUser = async (req, res, next) => {
  try {
    const { userId } = req.params;
    await User.findByIdAndDelete(userId);
    res.status(200).json({ message: "User deleted successfully" });
  } catch (err) {
    next(err);
  }
};