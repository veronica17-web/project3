const jwt = require("jsonwebtoken");

async function authentication(req, res, next) {
  try {
    const token = req.headers["x-api-key"];
    if (!token) {
      return res.status(400).send({ status: false, message: "required token" });
    }
     req.decoded = jwt.verify(token, "plutonium_project3");
    if (!req.decoded) {
      return res.status(400).send({ status: false, message: "invalid token" });
    }
    // jwt.verify(token,"plutonium_project3"(err,decoded)=>{
    //     if(err){
    //         return res
    //     .status(400)
    //     .send({ status: false, message: "required token" });
    //     }
    // })
    next();
  } catch (error) {
    return res.status(500).send({ status: false, msg: error.message });
  }
}


// async function authorization(req, res, next) {
//     try {
      
//       next();
//     } catch (error) {
//       return res.status(500).send({ status: false, msg: error.message });
//     }
//   }


module.exports = { authentication };
