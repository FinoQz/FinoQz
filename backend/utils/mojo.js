const axios = require("axios");

const MOJO_BASE = "https://api.mojoauth.com";

module.exports = {
  sendOtp: async (phone) => {
    const res = await axios.post(`${MOJO_BASE}/users/phone/otp`, {
      phone: phone
    }, {
      headers: {
        "X-API-Key": process.env.MOJOAUTH_API_KEY,
        "Content-Type": "application/json"
      }
    });

    return res.data;
  },

  verifyOtp: async (requestId, otp) => {
    const res = await axios.post(`${MOJO_BASE}/users/phone/verify`,
      {
        request_id: requestId,
        otp: otp
      },
      {
        headers: {
          "X-API-Key": process.env.MOJOAUTH_API_KEY,
          "Content-Type": "application/json"
        }
      }
    );

    return res.data;
  }
};
