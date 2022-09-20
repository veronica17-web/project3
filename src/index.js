const express= require('express')
const bodyParser=require('body-Parser')
const mongoose=require('mongoose') 
const route= require('./routes/route')
const app=express()
app.use(bodyParser.json())
mongoose.connect("mongodb+srv://Firoz_Shaik_:XaFPzUPEGu5fK1KS@cluster0.dshhzz6.mongodb.net/pro3_group44Database-DB",{useNewUrlParser: true
})
.then(()=>console.log("mongodb connected"))
.catch ((error)=>console.log(error.message))

app.use('/',route)
app.listen(3000,()=>{console.log("express app is connected at port:"+3000)})
