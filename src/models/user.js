const mongoose = require('mongoose');
const schema = mongoose.Schema;
const passportLocalMongooseModule = require('passport-local-mongoose');
const passportLocalMongoose = passportLocalMongooseModule.default || passportLocalMongooseModule;

const userSchema = new schema({
  email: {
    type: String,   
    required: true,
    unique: true
  }
});

userSchema.plugin(passportLocalMongoose);

module.exports = mongoose.model('User', userSchema);
