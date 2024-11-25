const Campaign = require('../model/donations/campaignSchema');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

// Create a new campaign
exports.createCampaign = async (req, res) => {
  try {
    const { title, description, targetAmount } = req.body;
    if (!title || !description || !targetAmount) {
      return res.status(400).json({ message: 'Missing required fields' });
    }
    const newCampaign = new Campaign({
      title,
      description,
      targetAmount,
      amountRaised: 0,
    });
    await newCampaign.save();
    res.status(201).json(newCampaign);
  } catch (error) {
    console.error('Error creating campaign:', error);
    res.status(500).json({ message: 'Error creating campaign', error: error.message });
  }
};

// Get all campaigns
exports.getAllCampaigns = async (req, res) => {
  try {
    const campaigns = await Campaign.find();
    res.status(200).json(campaigns);
  } catch (error) {
    console.error('Error fetching campaigns:', error);
    res.status(500).json({ message: 'Error fetching campaigns', error: error.message });
  }
};

// Get a single campaign by ID
exports.getCampaignById = async (req, res) => {
  try {
    const campaign = await Campaign.findById(req.params.id);
    if (!campaign) {
      return res.status(404).json({ message: 'Campaign not found' });
    }
    res.status(200).json(campaign);
  } catch (error) {
    console.error('Error fetching campaign:', error);
    res.status(500).json({ message: 'Error fetching campaign', error: error.message });
  }
};

// Add a comment to a campaign
exports.addComment = async (req, res) => {
  const { campaignId } = req.params;
  const { comment } = req.body;

  if (!comment) {
    return res.status(400).json({ message: 'Comment is required' });
  }

  try {
    const campaign = await Campaign.findById(campaignId);
    if (!campaign) {
      return res.status(404).json({ message: 'Campaign not found' });
    }

    const newComment = { text: comment };
    campaign.comments.push(newComment);
    await campaign.save();

    res.status(200).json(campaign);
  } catch (err) {
    console.error('Error adding comment:', err);
    res.status(500).json({ message: 'Error adding comment', error: err.message });
  }
};

exports.showAllComments = async (req, res) => {
  const { campaignId } = req.params;

  try {
    const campaign = await Campaign.findById(campaignId);
    if (!campaign) {
      return res.status(404).json({ message: 'Campaign not found' });
    }

    res.status(200).json(campaign.comments);
  } catch (err) {
    console.error('Error fetching comments:', err);
    res.status(500).json({ message: 'Error fetching comments', error: err.message });
  }
};

// Update campaign amount raised
exports.updateCampaign = async (req, res) => {
  const { id } = req.params;
  const { amountRaised } = req.body;

  if (amountRaised === undefined) {
    return res.status(400).json({ message: 'Amount raised is required' });
  }

  try {
    const campaign = await Campaign.findById(id);
    if (!campaign) {
      return res.status(404).json({ message: 'Campaign not found' });
    }

    campaign.amountRaised = amountRaised;
    await campaign.save();

    res.status(200).json(campaign);
  } catch (err) {
    console.error('Error updating campaign:', err);
    res.status(500).json({ message: 'Error updating campaign', error: err.message });
  }
};

// Create a payment intent
exports.createPayment = async (req, res) => {
  const { amount, description } = req.body;

  if (!amount || !description) {
    return res.status(400).json({ message: 'Amount and description are required' });
  }

  try {
    const paymentIntent = await stripe.paymentIntents.create({
      amount,
      currency: 'usd',
      description,
      payment_method_types: ['card'],
    });

    res.status(200).json({ clientSecret: paymentIntent.client_secret });
  } catch (err) {
    console.error('Error creating payment intent:', err);
    res.status(500).json({ message: 'Error creating payment intent', error: err.message });
  }
};