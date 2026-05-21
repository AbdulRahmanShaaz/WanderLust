const User = require('../../src/models/user');

async function getSeedOwner() {
  let owner =
    (await User.findOne({ email: 'admin@wanderlust.com' })) ||
    (await User.findOne());

  if (!owner) {
    owner = await User.register(
      new User({
        email: 'admin@wanderlust.com',
        username: 'admin',
      }),
      process.env.SEED_ADMIN_PASSWORD || 'wanderlust-admin'
    );
  }

  return owner._id;
}

module.exports = getSeedOwner;
