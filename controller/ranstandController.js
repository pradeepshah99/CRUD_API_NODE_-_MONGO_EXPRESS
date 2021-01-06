var express = require('express');
// const mongoose = require('mongoose');
var router = express.Router();
var ranstand_data = require('../model/ranstandSchema');
var bcrypt = require('bcrypt');
var jwt = require('jsonwebtoken');
var auth = require('../auth');
var passwordResetToken = require('../model/TokenSchema');
var crypto = require('crypto');
var nodemailer = require('nodemailer');
const async = require('async');
var tokenSchema = require('../model/TokenSchema');


email = process.env.MAILER_EMAIL_ID || 'pradeep.supatechs@gmail.com',
  pass = process.env.MAILER_PASSWORD || 'pradeep.supatechs@123'

var smtpTransport = nodemailer.createTransport({
  service: process.env.MAILER_SERVICE_PROVIDER || 'Gmail',
  auth: {
    user: email,
    pass: pass
  }
});



router.post('/create', async (req, res)=>
{
    const checkEmail =  await ranstand_data.findOne({email: req.body.email});
    if(checkEmail){
        res.status(400).json({message: "account already exist"});
    }
    
    else
    {
    
    let data = ranstand_data();
    data.firstName = req.body.firstName;
    data.lastName = req.body.lastName;
    data.email = req.body.email;
    data.password = req.body.password;
    data.adhar = parseInt(req.body.adhar);
    data.mobile = parseInt(req.body.mobile);
    data.address1 = req.body.address1;
    data.address2 = req.body.address2;
    

    if( !req.body.firstName || !req.body.lastName || !req.body.email || !req.body.password || !req.body.adhar || !req.body.mobile || !req.body.address1 || !req.body.address2)
{
    res.json("All field data input is compulsory")
}
else { 

    data.save().then((err, result) => {
    if(err) {
        res.json(err);
    } else {
        res.status(200).json({message: "Data saved successfully", Result : result});
    }
});
}
    }
});





router.post("/login", async (req, res) => {
   
const { email, password } = req.body;
    try {
      let user = await ranstand_data.findOne({
        email
      });
      if (!user)
        return res.status(400).json({
          message: "User Not Exist"
        });

      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch)
        return res.status(400).json({
          message: "Incorrect Password !"
        });

      const payload = {
        user: {
          id: user.id
        }
      };

       const token = jwt.sign(
        payload,
        "deep",
        {
          expiresIn: "1h"
        },
        (err, token) => {
          if (err) throw err;
          res.status(200).json({
            token
          });
        }
      );
    } catch (e) {
      console.error(e);
      res.status(500).json({
        message: "Server Error"
      });
    }
  }
);

router.get("/profile", auth, async (req, res) => {
  try {
    // request.user is getting fetched from Middleware after token authentication
    const user = await ranstand_data.findById(req.user.id);
    res.json({message:`User has been fetched of id ${req.user.id}`, data: user});
  } catch (e) {
    res.send({ message: "Error in Fetching user" });
  }
});

//2nd method to get the user

// router.get('/profile', auth, async(req, res)=> {
//   await ranstand_data.findOne({token: req.token}, function(err, user) {
//       if (err) {
//           res.json({
//               type: false,
//               data: "Error occured: " + err
//           });
//       } else {
//           res.json({
//               type: true,
//               data: user
//           });
//       }
//   });
// });


router.put('/update', auth, async(req,res)=>
{
  let salt = 10;
  let password = bcrypt.hashSync(req.body.password, salt);
  let adhar = bcrypt.hashSync(req.body.adhar, salt);
  let mobile = bcrypt.hashSync(req.body.mobile, salt);

   await ranstand_data.findByIdAndUpdate(req.user.id, {firstName:req.body.firstName,lastName:req.body.lastName, password:password, adhar:adhar, mobile:mobile, address1:req.body.address1,address2:req.body.address2 }, {new:true}).then(user=>{
    if(!user)
    {
      return res.status(404).send({
        message: "Note not found with id " + req.user.id
    });
    }
    res.json(user);
  }).catch(err => {
    if(err.kind === 'ObjectId') {
        return res.status(404).send({
            message: "Note not found with id " + req.user.id
        });                
    }
    return res.status(500).send({
        message: "Error updating note with id " + req.user.id
    });
})
});


router.delete('/delete', auth, (req, res)=>
{
  ranstand_data.findOneAndDelete(req.user.id).then((err, user)=>
  {
    if(err)
    {
      res.status(500).json({message: "Some Error"});
    }
    else
    {
      res.status(200).json({message: "Deleted"}, user);
    }
  })
});



router.post('/resetpassword', async (req, res)=>
{
  if(!req.body.email)
  {
    return res.status(501).json({message: "Email Is Required"});
  }

  const user = await ranstand_data.findOne({email:req.body.email});

  if(!user)
  {
    return res.status(409).json({ message: 'Email does not exist' });
  }
  var resettoken = new passwordResetToken({ _userId: user._id, resettoken: crypto.randomBytes(16).toString('hex') });
  resettoken.save(function(err){
    if(err){return res.status(500).json({meaasge: err.message});}
    passwordResetToken.find({ _userId: user._id, resettoken: { $ne: resettoken.resettoken } }).remove().exec();
    res.status(200).json({ message: 'Reset Password successfully.', resettoken});
    var transporter = nodemailer.createTransport({
      service: 'Gmail',
      port: 465,
      auth: {
        user: 'pradeep.supatechs@gmail.com',
        pass: 'pradeep.supatechs@123'
      }
    });
    var mailOptions = {
    to: user.email,
    from: 'pradeep.supatechs@gmail.com',
    subject: 'Node.js Password Reset',
    text: 'You are receiving this because you (or someone else) have requested the reset of the password for your account.\n\n' +
    'Please click on the following link, or paste this into your browser to complete the process:\n\n' +
    'http://localhost:4200/response-reset-password/' + resettoken.resettoken + '\n\n' +
    'If you did not request this, please ignore this email and your password will remain unchanged.\n'
    }
    transporter.sendMail(mailOptions, (err, info) => {
    })
    
  });
});

 router.post('/validatePtoken', async (req, res)=>
 {
  if (!req.body.resettoken) {
    return res
    .status(500)
    .json({ message: 'Token is required' });
    }
    const user = await passwordResetToken.findOne({
    resettoken: req.body.resettoken
    });
    if (!user) {
    return res
    .status(409)
    .json({ message: 'Invalid URL' });
    }
    tokenSchema.findOneAndUpdate({ _id: user._userId }).then(() => {
    res.status(200).json({ message: 'Token verified successfully.' });
    }).catch((err) => {
    return res.status(500).send({ msg: err.message});
    });
 });

 router.post('/new-password', async(req, res)=>
 {
  passwordResetToken.findOne({ resettoken: req.body.resettoken }, function (err, userToken, next) {
    if (!userToken) {
      return res
        .status(409)
        .json({ message: 'Token has expired' });
    }

    User.findOne({
      _id: userToken._userId
    }, function (err, userEmail, next) {
      if (!userEmail) {
        return res
          .status(409)
          .json({ message: 'User does not exist' });
      }
      return bcrypt.hash(req.body.newPassword, 10, (err, hash) => {
        if (err) {
          return res
            .status(400)
            .json({ message: 'Error hashing password' });
        }
        userEmail.password = hash;
        userEmail.save(function (err) {
          if (err) {
            return res
              .status(400)
              .json({ message: 'Password can not reset.' });
          } else {
            userToken.remove();
            return res
              .status(201)
              .json({ message: 'Password reset successfully' });
          }

        });
      });
    });

  })

 })



module.exports = router;


