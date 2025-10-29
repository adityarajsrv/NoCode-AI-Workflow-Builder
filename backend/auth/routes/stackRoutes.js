const express = require('express');
const { protect } = require('../middleware/authMiddleware');
const Stack = require('../models/Stack');

const router = express.Router();

router.get('/', protect, async (req, res) => {
    try {
        const stacks = await Stack.getUserStacks(req.user._id);
        
        res.json({
            success: true,
            count: stacks.length,
            data: stacks
        });
    } catch (error) {
        console.error('Get stacks error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching stacks',
            error: error.message
        });
    }
});

router.get('/:id', protect, async (req, res) => {
    try {
        const stack = await Stack.findOne({ _id: req.params.id, user: req.user._id, isActive: true });
        
        if (!stack) {
            return res.status(404).json({
                success: false,
                message: 'Stack not found'
            });
        }

        res.json({
            success: true,
            data: stack
        });
    } catch (error) {
        console.error('Get stack error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching stack',
            error: error.message
        });
    }
});

router.post('/', protect, async (req, res) => {
    try {
        const { name, description } = req.body;

        const userStacks = await Stack.find({ user: req.user._id, isActive: true });
        
        if (userStacks.length >= 3) {
            return res.status(400).json({
                success: false,
                message: 'Free tier limited to 3 stacks. Upgrade to premium for unlimited stacks.'
            });
        }

        const stack = await Stack.create({
            name,
            description,
            user: req.user._id
        });

        res.status(201).json({
            success: true,
            message: 'Stack created successfully',
            data: stack
        });
    } catch (error) {
        console.error('Create stack error:', error);
        if (error.name === 'ValidationError') {
            return res.status(400).json({
                success: false,
                message: 'Validation error',
                error: error.message
            });
        }
        res.status(500).json({
            success: false,
            message: 'Error creating stack',
            error: error.message
        });
    }
});

router.put('/:id', protect, async (req, res) => {
    try {
        const { name, description } = req.body;
        
        const stack = await Stack.findOne({ _id: req.params.id, user: req.user._id, isActive: true });
        
        if (!stack) {
            return res.status(404).json({
                success: false,
                message: 'Stack not found'
            });
        }

        if (name !== undefined) stack.name = name;
        if (description !== undefined) stack.description = description;
        
        await stack.save();

        res.json({
            success: true,
            message: 'Stack updated successfully',
            data: stack
        });
    } catch (error) {
        console.error('Update stack error:', error);
        if (error.name === 'ValidationError') {
            return res.status(400).json({
                success: false,
                message: 'Validation error',
                error: error.message
            });
        }
        res.status(500).json({
            success: false,
            message: 'Error updating stack',
            error: error.message
        });
    }
});

router.delete('/:id', protect, async (req, res) => {
    try {
        const stack = await Stack.findOne({ _id: req.params.id, user: req.user._id, isActive: true });
        
        if (!stack) {
            return res.status(404).json({
                success: false,
                message: 'Stack not found'
            });
        }

        stack.isActive = false;
        await stack.save();

        res.json({
            success: true,
            message: 'Stack deleted successfully'
        });
    } catch (error) {
        console.error('Delete stack error:', error);
        res.status(500).json({
            success: false,
            message: 'Error deleting stack',
            error: error.message
        });
    }
});

module.exports = router;