import jwt from "jsonwebtoken";

export function requireAuth(req, res, next) {
  const access_token = req.headers.authorization?.split(" ")[1];

  if (!access_token) {
    return res.status(401).json({
      message: "Unauthorized",
    });
  }

  try {
    const decoded = jwt.verify(access_token, process.env.JWT_SECRET);
    req.user_id = decoded.user_id;
    // req.role = decoded.role;
    next();
  } catch (error) {
    return res.status(401).json({
      message: "Unauthorized",
    });
  }
}

export function requireRole(roles) {
  return function (req, res, next) {
    const access_token = req.headers.authorization?.split(" ")[1];
    if (!access_token) {
      return res.status(401).json({
        message: "Unauthorized",
      });
    }
    try {
      const decoded = jwt.verify(access_token, process.env.JWT_SECRET);
      const roleExists = roles.includes(decoded.role);
      if (!roleExists) {
        return res.status(403).json({
          message: "Forbidden",
        });
      }
      req.user_id = decoded.user_id;
      next();
    } catch (error) {
      return res.status(401).json({
        message: "Unauthorized",
      });
    }
  };
}
// middleware/auth.js
// import jwt from "jsonwebtoken";

// export function requireAuth(req, res, next) {
//   const token = req.headers.authorization?.split(" ")[1];
//   if (!token) return res.status(401).json({ message: "Unauthorized" });

//   try {
//     const decoded = jwt.verify(token, process.env.JWT_SECRET);
//     req.user_id = decoded.user_id;
//     req.role = decoded.role;
//     next();
//   } catch (err) {
//     return res.status(401).json({ message: "Unauthorized" });
//   }
// }

// export function requireRole(roles) {
//   return (req, res, next) => {
//     const token = req.headers.authorization?.split(" ")[1];
//     if (!token) return res.status(401).json({ message: "Unauthorized" });
//     try {
//       const decoded = jwt.verify(token, process.env.JWT_SECRET);
//       if (!roles.includes(decoded.role))
//         return res.status(403).json({ message: "Forbidden" });
//       req.user_id = decoded.user_id;
//       next();
//     } catch (err) {
//       return res.status(401).json({ message: "Unauthorized" });
//     }
//   };
// }
