const { User } = require("../models/user");
const RequestError = require("../helpers/RequestError");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const secret = process.env.JWT_SECRET;

const regist = async (request, response, next) => {
  const { email, password } = request.body;

  const userExist = await User.findOne({ email });
  if (userExist) throw RequestError(409, "Mail already registered");

  const salt = await bcrypt.genSalt(10);
  const hashPassword = await bcrypt.hash(password, salt);

  const user = await User.create({ email: email, password: hashPassword });
  response.status(201).json({
    email: user.email,
    subscription: user.subscription,
  });
};

const login = async (request, response, next) => {
  const { email, password } = request.body;

  const user = await User.findOne({ email });
  if (!user) throw RequestError(401, "check email or password");

  const passwordCompare = await bcrypt.compare(password, user.password);
  if (!passwordCompare) throw RequestError(401, "check email or password");

  const payload = {
    id: user._id,
  };

  const token = jwt.sign(payload, secret, { expiresIn: "1h" });
  await User.findByIdAndUpdate(user._id, { token });

  response.status(200).json({
    token,
    user: {
      email: user.email,
      subscription: user.subscription,
    },
  });
};

const logout = async (request, response, next) => {
     const { id } = request.user;
     await User.findByIdAndUpdate(id, {token: ""})

     response.status(204).json("Logout successful")
}

const current = async(request, response, next) => { 
     const { id } = request.user;
    const { email, subscription } = await User.findById(id);
    response.status(200).json({email, subscription})
}

const updateSubscription = async( request, response, next ) => { 
     const { id } = request.user;
     const subscription = request.body;
     const user = await User.findByIdAndUpdate( id, subscription, {new: true}) 

     response.status(200).json({subscription: user.subscription})
}

module.exports = { 
    regist,
    login, 
    logout, 
    current, 
    updateSubscription
}