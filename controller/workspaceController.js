const { validationResult } = require('express-validator');
const Campaign = require("../model/WorkSpace/Campaign");
const Supply = require("../model/WorkSpace/Supply");

exports.getCampaigns = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    const { search } = req.query;

    let query = { userId: req.user.id };
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    const campaigns = await Campaign.find(query).skip(skip).limit(limit);
    const total = await Campaign.countDocuments(query);

    res.json({
      campaigns,
      currentPage: page,
      totalPages: Math.ceil(total / limit),
      totalItems: total
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.createCampaign = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const newCampaign = await Campaign.create({ ...req.body, userId: req.user.id });
    res.status(201).json(newCampaign);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

exports.updateCampaign = async (req, res) => {
  try {
    const updatedCampaign = await Campaign.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.id },
      req.body,
      { new: true }
    );
    if (!updatedCampaign) {
      return res.status(404).json({ message: "Campaign not found" });
    }
    res.json(updatedCampaign);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

exports.deleteCampaign = async (req, res) => {
  try {
    const result = await Campaign.findOneAndDelete({ _id: req.params.id, userId: req.user.id });
    if (!result) {
      return res.status(404).json({ message: "Campaign not found" });
    }
    res.json({ message: "Campaign deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getSupplies = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    const { search } = req.query;

    let query = { userId: req.user.id };
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    const supplies = await Supply.find(query).skip(skip).limit(limit);
    const total = await Supply.countDocuments(query);

    res.json({
      supplies,
      currentPage: page,
      totalPages: Math.ceil(total / limit),
      totalItems: total
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.createSupply = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const newSupply = await Supply.create({ ...req.body, userId: req.user.id });
    res.status(201).json(newSupply);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

exports.updateSupply = async (req, res) => {
  try {
    const updatedSupply = await Supply.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.id },
      req.body,
      { new: true }
    );
    if (!updatedSupply) {
      return res.status(404).json({ message: "Supply not found" });
    }
    res.json(updatedSupply);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

exports.deleteSupply = async (req, res) => {
  try {
    const result = await Supply.findOneAndDelete({ _id: req.params.id, userId: req.user.id });
    if (!result) {
      return res.status(404).json({ message: "Supply not found" });
    }
    res.json({ message: "Supply deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.requestSupply = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const newSupplyRequest = await Supply.create({ ...req.body, status: "requested", userId: req.user.id });
    res.status(201).json(newSupplyRequest);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};