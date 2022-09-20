const userModel = require('../models/userModel')

// const isValid = function (value) {
//     //if(typeof value ==="undefined"|| value===null) return false;
//     if (typeof value === "string" && value.trim().length === 0) return false;

//     else { return true }

//}
const createUser = async function (req, res) {
    try{
        let data =req.body
        console.log(data)
        if(Object.keys(data).length==0){

            return res.status(400).send({status:false, message:"require som data"})
        }
        let saveData= await userModel.create(data)
        return res.status(201).send({ status:true,msg:"success",data:saveData})




    
    }
    catch (error) { return res.status(500).send({ status: false, msg: error.message }) }




}
module.exports.createUser=createUser