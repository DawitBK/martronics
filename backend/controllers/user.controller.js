import models from "../models/index.js";
import argon2 from "argon2";
import jwt from "jsonwebtoken";
const { User, Product } = models;

export const createUser = async (req, res) => {
  try {
    const { firstName, lastName, email, password, role } = req.body;
    const hashedPassword = await argon2.hash(password);
    console.log(hashedPassword);

    const created = await User.create({
      firstName,
      lastName,
      email,
      password: hashedPassword,
      role: role || 'customer',
    });

    res.status(201).json(created);
  } catch (error) {
    res.status(400).json({
      message: "Failed to create user",
      error: error.message,
    });
  }
};

export const updateUser = async (req, res) => {
  try {
    // api/users/1
    const { firstName, lastName } = req.body;
    const id = req.params.id;

    const user = await User.findByPk(id);

    if (!user) {
      return res.send({
        message: "User not found",
      });
    }

    await user.update({ firstName, lastName });

    res.json(user);
  } catch (error) {
    res.status(400).send({
      message: "failed to update user",
      error: error.message,
    });
  }
};

export const Login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ where: { email } }); // ✅ add await
    console.log("Login attempt for:", email);

    if (!user) {
      console.log("User not found");
      return res.status(404).json({
        message: "User Not found",
      });
    }
    console.log("User found:", user.email);
    console.log("Stored hash:", user.password);

    const checkPassword = await argon2.verify(user.password, password);
    console.log("Password verify result:", checkPassword);

    if (!checkPassword) {
      return res.status(404).json({
        message: "Password not correct",
      });
    }
    const accessToken = generateToken({
      user_id: user.id,
      role: user.role,
      expire_in: "1h",
      type: "access",
    });
    const refreshToken = generateToken({
      user_id: user.id,
      expire_in: "7d",
      role: user.role,
      type: "refresh",
    });
    const { password: pwd, ...userWithoutPassword } = user.toJSON();
    res.json({
      message: "User Logged in successfully",
      user: userWithoutPassword,
      accessToken,
      refreshToken,
    });
  } catch (error) {
    res.status(500).json({
      message: "Something went wrong",
      error: error.message,
    });
  }
};

export const listUsers = async (req, res) => {
  try {
    const users = await User.findAll({
      include: { model: Product, as: "products" },
    });
    res.json(users);
  } catch (error) {
    res.status(400).json({
      message: "Failed to fetch users",
      error: error.message,
    });
  }
};
export const RefreshToken = async (req, res) => {
  try {
    const refreshToken = req.headers.authorization.split(" ")[1];
    if (!refreshToken) {
      return res.status(401).json({ message: "No refresh token provided" });
    }
    const decoded = jwt.verify(refreshToken, process.env.JWT_SECRET_REFRESH);
    const access_token = generateToken({
      user_id: decoded.user_id,
      role: decoded.role,
      expire_in: "1h",
      type: "access",
    });

    const refresh_token = generateToken({
      user_id: decoded.user_id,
      role: decoded.role,
      expire_in: "7d",
      type: "refresh",
    });

    res.send({
      access_token: access_token,
      refresh_token: refresh_token,
    });
  } catch (error) {
    res.status(500).json({
      message: "Something went wrong",
      error: error.message,
    });
  }
};

const generateToken = ({ user_id, role = "", expire_in, type }) => {
  return jwt.sign(
    { user_id, role },
    type === "access" ? process.env.JWT_SECRET : process.env.JWT_SECRET_REFRESH,
    {
      expiresIn: expire_in,
    }
  );
};

//  export const updateUser = async (req, res) => {
//    try {
//      const { id } = req.params;
//      const { firstName, lastName, email, password, role } = req.body;
//      const user = await User.findByPk(id);

//      if (!user) {
//        return res.status(404).json({ message: "User not found" });
//      }
//       user.firstName = firstName || user.firstName;
//       user.lastName = lastName || user.lastName;
// controllers / user.controller.js;
// import models from "../models/index.js";
// import argon2 from "argon2";
// import jwt from "jsonwebtoken";
// const { User, Product } = models;

// const generateToken = ({ user_id, role = "", expire_in, type }) =>
//   jwt.sign(
//     { user_id, role },
//     type === "access" ? process.env.JWT_SECRET : process.env.JWT_SECRET_REFRESH,
//     { expiresIn: expire_in }
//   );

// export const createUser = async (req, res) => {
//   try {
//     const { firstName, lastName, email, password } = req.body;
//     const hashedPassword = await argon2.hash(password);
//     const created = await User.create({
//       firstName,
//       lastName,
//       email,
//       password: hashedPassword,
//     });
//     res.status(201).json(created);
//   } catch (error) {
//     res
//       .status(400)
//       .json({ message: "Failed to create user", error: error.message });
//   }
// };

// export const Login = async (req, res) => {
//   try {
//     const { email, password } = req.body;
//     const user = await User.findOne({ where: { email } });
//     if (!user) return res.status(404).json({ message: "User Not found" });

//     const valid = await argon2.verify(user.password, password);
//     if (!valid)
//       return res.status(404).json({ message: "Password not correct" });

//     const accessToken = generateToken({
//       user_id: user.id,
//       role: user.role,
//       expire_in: "1h",
//       type: "access",
//     });
//     const refreshToken = generateToken({
//       user_id: user.id,
//       role: user.role,
//       expire_in: "7d",
//       type: "refresh",
//     });

//     const { password: pwd, ...userWithoutPassword } = user.toJSON();
//     res.json({
//       message: "User logged in",
//       user: userWithoutPassword,
//       accessToken,
//       refreshToken,
//     });
//   } catch (err) {
//     res
//       .status(500)
//       .json({ message: "Something went wrong", error: err.message });
//   }
// };

// export const listUsers = async (req, res) => {
//   try {
//     const users = await User.findAll({
//       include: { model: Product, as: "products" },
//     });
//     res.json(users);
//   } catch (err) {
//     res
//       .status(400)
//       .json({ message: "Failed to fetch users", error: err.message });
//   }
// };

// export const updateUser = async (req, res) => {
//   try {
//     const { firstName, lastName } = req.body;
//     const user = await User.findByPk(req.params.id);
//     if (!user) return res.status(404).json({ message: "User not found" });

//     await user.update({ firstName, lastName });
//     res.json(user);
//   } catch (err) {
//     res
//       .status(400)
//       .json({ message: "Failed to update user", error: err.message });
//   }
// };

// export const RefreshToken = async (req, res) => {
//   try {
//     const refreshToken = req.headers.authorization?.split(" ")[1];
//     if (!refreshToken)
//       return res.status(401).json({ message: "No refresh token" });

//     const decoded = jwt.verify(refreshToken, process.env.JWT_SECRET_REFRESH);
//     const access_token = generateToken({
//       user_id: decoded.user_id,
//       role: decoded.role,
//       expire_in: "1h",
//       type: "access",
//     });
//     const refresh_token = generateToken({
//       user_id: decoded.user_id,
//       role: decoded.role,
//       expire_in: "7d",
//       type: "refresh",
//     });

//     res.json({ access_token, refresh_token });
//   } catch (err) {
//     res
//       .status(500)
//       .json({ message: "Something went wrong", error: err.message });
//   }
// };
