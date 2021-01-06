const jwt = require("jsonwebtoken");

// module.exports = function(req, res, next) {
  

//   var bearerToken;
//   var bearerHeader = req.headers["token"];
//   if (typeof bearerHeader !== 'undefined') {
//       var bearer = bearerHeader.split(" ");
//       bearerToken = bearer[1];
//       req.token = bearerToken;
//       next();
//   } else {
//       res.send(403);
//   }
// };

module.exports =  function(req, res, next) {
var token = req.header("token" , token);
  if (!token) return res.status(401).json({ message: "Authentication Failed - Token Not Provided" });

  try {
    const decoded = jwt.verify(token, "deep");
    req.user = decoded.user;
    next();
  } catch (e) {
    console.error(e);
    res.status(500).send({ message: "Invalid Token" });
  
  }
};