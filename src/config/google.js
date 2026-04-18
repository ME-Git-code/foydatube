const { OAuth2Client } = require("google-auth-library");

let client;

function getGoogleClient() {
  if (!client) {
    client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
  }

  return client;
}

module.exports = {
  getGoogleClient,
};
