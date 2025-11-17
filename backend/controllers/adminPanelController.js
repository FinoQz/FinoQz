const User = require('../models/User');
const sendEmail = require('../utils/sendEmail');
const approvalSuccessTemplate = require('../emailTemplates/userApprovalSuccessTemplate');
const rejectionTemplate = require('../emailTemplates/userRejectionTemplate');
const formatDate = require('../utils/formatDate'); // optional for audit

// Get all users awaiting admin approval
exports.getPendingUsers = async (req, res) => {
  try {
    const users = await User.find({ status: 'awaiting_admin_approval' }).select('-passwordHash -emailOtp -mobileOtp');
    res.json(users);
  } catch (err) {
    console.error('Error fetching pending users:', err);
    res.status(500).json({ message: 'Server error' });
  }
};


// Approve a user
exports.approveUser = async (req, res) => {
  const { userId } = req.params;
  try {
    const user = await User.findById(userId);
    if (!user || user.status !== 'awaiting_admin_approval') {
      return res.status(400).json({ message: 'Invalid user or status' });
    }

    user.status = 'approved';
    user.approvedBy = req.user.id;
    await user.save();

    Promise.resolve().then(() => {
      sendEmail(user.email, 'FinoQz Account Approved', approvalSuccessTemplate({
        fullName: user.fullName,
        email: user.email,
        password: 'Your chosen password'
      })).catch(err => console.error('Approval email failed:', err));
    });

    res.json({ message: 'User approved' });
  } catch (err) {
    console.error('Error approving user:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// Reject a user
exports.rejectUser = async (req, res) => {
  const { userId } = req.params;
  try {
    const user = await User.findById(userId);
    if (!user || user.status !== 'awaiting_admin_approval') {
      return res.status(400).json({ message: 'Invalid user or status' });
    }

    user.status = 'rejected';
    await user.save();

    Promise.resolve().then(() => {
      sendEmail(user.email, 'FinoQz Signup Update', rejectionTemplate(user.fullName))
        .catch(err => console.error('Rejection email failed:', err));
    });

    res.json({ message: 'User rejected' });
  } catch (err) {
    console.error('Error rejecting user:', err);
    res.status(500).json({ message: 'Server error' });
  }
};
