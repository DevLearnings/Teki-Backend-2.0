// routes/stripeRoutes.js
const express = require('express');
const router = express.Router();
const stripe = require('stripe')('your_stripe_secret_key');
const Campaign = require('../models/Campaign');

router.post('/create-payment-intent', async (req, res) => {
  const { amount, campaignId } = req.body;

  try {
    const paymentIntent = await stripe.paymentIntents.create({
      amount,
      currency: 'usd',
    });

    res.status(200).send({
      clientSecret: paymentIntent.client_secret,
      campaignId,
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

router.post('/confirm-payment', async (req, res) => {
  const { paymentIntentId, campaignId } = req.body;

  try {
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

    if (paymentIntent.status === 'succeeded') {
      const campaign = await Campaign.findById(campaignId);
      if (campaign) {
        campaign.amountRaised += paymentIntent.amount / 100;
        await campaign.save();
      }
    }

    res.status(200).send(paymentIntent);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
