const express = require('express');
const jwt = require('jsonwebtoken');
const { protect } = require('../middleware/authMiddleware');
const Stack = require('../models/Stack');
const User = require('../models/User'); 

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

        if (!name || !name.trim()) {
            return res.status(400).json({
                success: false,
                message: 'Stack name is required'
            });
        }

        // Check if user is premium - get fresh user data from database
        const currentUser = await User.findById(req.user._id);
        const isPremium = currentUser && currentUser.tier === 'premium';
        
        console.log('User tier from DB:', currentUser?.tier);
        console.log('User ID:', currentUser?._id);
        
        // Only check stack limit for free users
        if (!isPremium) {
            const userStacks = await Stack.find({ user: req.user._id, isActive: true });
            console.log('User stacks count:', userStacks.length);
            
            if (userStacks.length >= 3) {
                return res.status(400).json({
                    success: false,
                    message: 'Free tier limited to 3 stacks. Upgrade to premium for unlimited stacks.'
                });
            }
        }

        // Check if stack with same name already exists
        const existingStack = await Stack.findOne({ 
            user: req.user._id, 
            name: name.trim(),
            isActive: true 
        });
        
        if (existingStack) {
            return res.status(400).json({
                success: false,
                message: 'A stack with this name already exists'
            });
        }

        const stack = await Stack.create({
            name: name.trim(),
            description: description?.trim() || '',
            user: req.user._id
        });

        res.status(201).json({
            success: true,
            message: 'Stack created successfully',
            data: stack
        });
    } catch (error) {
        console.error('Create stack error:', error);
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

router.post('/upgrade-to-premium', protect, async (req, res) => {
    try {
        console.log('🔧 Premium upgrade requested for user:', req.user._id);
        
        const user = await User.findById(req.user._id);
        
        if (!user) {
            console.log('❌ User not found for ID:', req.user._id);
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        console.log('📊 User before upgrade:', {
            id: user._id,
            username: user.username,
            tier: user.tier
        });

        // Update user tier
        user.tier = 'premium';
        await user.save();

        // Verify the update
        const updatedUser = await User.findById(req.user._id);
        console.log('✅ User after upgrade:', {
            id: updatedUser._id,
            username: updatedUser.username, 
            tier: updatedUser.tier
        });

        res.json({
            success: true,
            message: 'Successfully upgraded to premium',
            data: {
                _id: updatedUser._id,
                username: updatedUser.username,
                email: updatedUser.email,
                tier: updatedUser.tier
            }
        });
    } catch (error) {
        console.error('💥 Premium upgrade error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to upgrade to premium',
            error: error.message
        });
    }
});

// Temporary route to manually fix premium status
router.post('/force-premium/:userId', async (req, res) => {
    try {
        const { userId } = req.params;
        
        console.log('🔧 Force premium requested for user:', userId);
        
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        console.log('📊 User before force premium:', user.tier);
        
        user.tier = 'premium';
        await user.save();

        // Verify
        const updatedUser = await User.findById(userId);
        console.log('✅ User after force premium:', updatedUser.tier);

        res.json({
            success: true,
            message: 'User forced to premium successfully',
            data: {
                _id: updatedUser._id,
                username: updatedUser.username,
                tier: updatedUser.tier
            }
        });
    } catch (error) {
        console.error('💥 Force premium error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to force premium',
            error: error.message
        });
    }
});

module.exports = router;