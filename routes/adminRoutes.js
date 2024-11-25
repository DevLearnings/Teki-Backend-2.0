const express = require('express');
const router = express.Router();
const adminController = require('../controller/adminController');

// Inquiries
router.post('/inquiries', adminController.createInquiry);
router.get('/inquiries', adminController.getInquiries);
router.delete('/inquiries/:inquiryId', adminController.deleteInquiry);

// Suppliers
router.post('/suppliers', adminController.createSupplier);
router.get('/suppliers', adminController.getSuppliers);
router.delete('/suppliers/:supplierId', adminController.deleteSupplier);

// Funding
router.post('/fundings', adminController.createFunding);
router.get('/fundings', adminController.getFundings);
router.delete('/fundings/:fundingId', adminController.deleteFunding);

// Tasks
router.post('/tasks', adminController.createTask);
router.get('/tasks', adminController.getTasks);
router.delete('/tasks/:taskId', adminController.deleteTask);

// Supplies
router.post('/supplies', adminController.createSupply);
router.get('/supplies', adminController.getSupplies);
router.delete('/supplies/:supplyId', adminController.deleteSupply);

// Chats
router.post('/chats', adminController.createChat);
router.get('/chats', adminController.getChats);
router.delete('/chats/:chatId', adminController.deleteChat);

// Users
router.get('/users', adminController.getUsers);
router.delete('/users/:userId', adminController.deleteUser);

module.exports = router;
