var mongoose = require("mongoose"),
  Schema = mongoose.Schema,
  bcrypt = require("bcrypt"),
  SALT_WORK_FACTOR = 10;

var schema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    email: {
      type: String,
      required: true,
      index: true,
      unique: true,
      trim: true
    },
    password: { type: String },
    createdAt: { type: Date, default: Date.now },
    favorite: [{ type: Schema.Types.ObjectId, ref: "Event" }],
    deleteCheck: { type: Number, required: true, default: 0 }
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

schema.pre("save", function(next) {
  var user = this;

  // only hash the password if it has been modified (or is new)
  if (!user.isModified("password")) return next();

  // generate a salt
  bcrypt.genSalt(SALT_WORK_FACTOR, function(err, salt) {
    if (err) return next(err);

    // hash the password using our new salt
    bcrypt.hash(user.password, salt, function(err, hash) {
      if (err) return next(err);

      // override the cleartext password with the hashed one
      user.password = hash;
      next();
    });
  });
});

// 로그인 해야되서 살려둔 부분 ! comparePassword로 통합해야함!!!!
schema.methods.comparePassword_two = function(candidatePassword, cb) {
  bcrypt.compare(candidatePassword, this.password, function(err, isMatch) {
    if (err) return cb(err);
    cb(null, isMatch);
  });
};

schema.methods.comparePassword = function(password) {
  return bcrypt.compare(password, this.password); // return Promise
};

module.exports = mongoose.model("User", schema);
