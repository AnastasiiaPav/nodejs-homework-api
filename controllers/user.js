const { User } = require("../models/user");
const RequestError = require("../helpers/RequestError");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const gravatar = require("gravatar");
const { v4: uuidv4 } = require("uuid");
const fs = require("fs/promises");
const path = require("path");
const { imgOpt } = require("../help/image");
const sendMail = require("../help/sendMail")
const createHTML = require("../help/verificationHTML")

const { BASE_URL, JWT_SECRET } = process.env

const regist = async (request, response, next) => {
  const { email, password } = request.body;

  const userExist = await User.findOne({ email });
  if (userExist) throw RequestError(409, "Mail already registered");

  const salt = await bcrypt.genSalt(10);
  const hashPassword = await bcrypt.hash(password, salt);

  const avatarURL = gravatar.url(email);
   const verificationToken = uuidv4()
  console.log(avatarURL);

  const user = await User.create({
    email: email,
    password: hashPassword,
    avatarURL,
    verificationToken,
  });
  const mail = {
    to: email,
    subject: "Verify you email",
    html: createHTML(email, BASE_URL, verificationToken),
  }
  await sendMail(mail)

  response.status(201).json({
    email: user.email,
    subscription: user.subscription,
  });
};

const login = async (request, response, next) => {
  const { email, password } = request.body;

  const user = await User.findOne({ email });
  if (!user) throw RequestError(401, "check email or password");

  if(!user.verify) throw RequestError(403, "User isnt verificaton")

  const passwordCompare = await bcrypt.compare(password, user.password);
  if (!passwordCompare) throw RequestError(401, "check email or password");

  const payload = {
    id: user._id,
  };

  const token = jwt.sign(payload, JWT_SECRET, { expiresIn: "1h" });
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
  await User.findByIdAndUpdate(id, { token: "" });

  response.status(204).json("Logout successful");
};

const current = async (request, response, next) => {
  const { id } = request.user;
  const { email, subscription } = await User.findById(id);
  response.status(200).json({ email, subscription });
};

const updateSubscription = async (request, response, next) => {
  const { id } = request.user;
  const subscription = request.body;
  const user = await User.findByIdAndUpdate(id, subscription, { new: true });

  response.status(200).json({ subscription: user.subscription });
};

const avatarsDir = path.join(__dirname, "../../", "public", "avatars");

const updateAvatar = async (request, response, next) => {
  const { id } = request.user;
  const { path: tempName, originName } = request.file;

  const extention = originName.split(".").pop();
  const filename = `${id}.${extention}`;

  const resultName = path.join(avatarsDir, filename);

  await fs.rename(tempName, resultName);
  imgOpt(resultName);
  const avatarURL = path.join("avatars", filename);

  await User.findByIdAndUpdate(id, { avatarURL });

  response.status(200).json({ avatarURL: avatarURL });
};

const verification = async (request, response, next) => {
  const { verificationToken } = request.params;
  const user = await User.findOne({ verificationToken });
  if (!user) throw RequestError(404, "User not found");

  await User.findByIdAndUpdate(user._id, {
    verify: true,
    verificationToken: null,
  });

    response.status(200).json({ message: "verification passed!" })
};

const sendVerific =  async( request, response, next )=> {
  const { email } = request.body;
  const user = await User.findOne({ email })
  if (!user) throw RequestError(404, "User not found")

  if (user.verify){
    throw RequestError(400, "verification is already active")
  }

  const mail = {
    to: email,
    subject: " Hello! Verify your email address",
    text: `Verify your email by this link: ${BASE_URL}/api/users/verify/${user.verificationToken} , please!`,
    html: createHTML(email, BASE_URL, user.verificationToken),
  }
  await sendMail(mail)
response.status(200).jsom({message: "Email send!"})
}

module.exports = {
  regist,
  login,
  logout,
  current,
  updateSubscription,
  updateAvatar,
  verification,
  sendVerific,
};
