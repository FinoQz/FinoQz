import User from "../models/User.js";
import DeletionRequest from "../models/AccountDeletionRequest.js";
import emailQueue from "../utils/emailQueue.js";

// ✅ Get current user profile
export const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.userId)
      .select('-password -otp -__v') // hide sensitive fields
      .lean();

    if (!user) return res.status(404).json({ message: "User not found" });

    return res.json({ user });
  } catch (err) {
    console.error("getMe error:", err);
    return res.status(500).json({ message: "Server error" });
  }
};


// ✅ Update profile (only fields present in User schema)
export const updateMe = async (req, res) => {
  try {
    const allowedFields = [
      "fullName",
      "gender",
      "address",
      "dateOfBirth",
      "bio",
      "city",
      "country"
    ];

    const payload = {};
    for (const key of allowedFields) {
      if (req.body[key] !== undefined) payload[key] = req.body[key];
    }

    const user = await User.findByIdAndUpdate(req.userId, payload, {
      new: true,
      runValidators: true,
    }).select('-password -otp -__v').lean();

    if (!user) return res.status(404).json({ message: "User not found" });

    return res.json({ message: "Profile updated", user });
  } catch (err) {
    console.error("updateMe error:", err);
    return res.status(500).json({ message: "Server error" });
  }
};

// ✅ Upload profile image
export const uploadProfileImage = async (req, res) => {
  try {
    const { url } = req.body;
    if (!url) return res.status(400).json({ message: "Image URL required" });

    const user = await User.findByIdAndUpdate(
      req.userId,
      { profilePicture: url },
      { new: true }
    ).select('profilePicture').lean();

    if (!user) return res.status(404).json({ message: "User not found" });

    return res.json({ message: "Profile image updated", profileImage: user.profilePicture });
  } catch (err) {
    console.error("uploadProfileImage error:", err);
    return res.status(500).json({ message: "Server error" });
  }
};

// ✅ Request account deletion
export const requestDeletion = async (req, res) => {
  try {
    const userId = req.userId;

    // Check if a pending request already exists
    const existing = await DeletionRequest.findOne({ user: userId, status: 'pending' });
    if (existing) {
      return res.status(400).json({ message: "A deletion request is already pending." });
    }

    const { reason } = req.body;

    const newRequest = new DeletionRequest({
      user: userId,
      reason: reason || "No reason provided"
    });

    await newRequest.save();

    const user = await User.findById(userId);

    // ✅ Notify Admin (Mock sending to a generic admin email or fetch from config)
    const adminEmail = process.env.ADMIN_EMAIL || 'admin@finoqz.com';
    
    await emailQueue.add("sendMail", {
      to: adminEmail,
      subject: `Account Deletion Request - ${user.fullName}`,
      html: `
        <h3>Account Deletion Request</h3>
        <p><strong>User:</strong> ${user.fullName} (${user.email})</p>
        <p><strong>Reason:</strong> ${reason || 'N/A'}</p>
        <p>Please review this request in the Admin Panel.</p>
      `
    });

    return res.json({ message: "Deletion request submitted successfully. Our team will review it shortly." });
  } catch (err) {
    console.error("requestDeletion error:", err);
    return res.status(500).json({ message: "Server error" });
  }
};
