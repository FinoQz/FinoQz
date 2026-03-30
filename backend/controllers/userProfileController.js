import User from "../models/User.js";

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
      "mobile",
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

