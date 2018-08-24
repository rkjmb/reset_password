const express = require('express')
const mongoose = require('mongoose')
const bodyParser  = require("body-parser")
//const cookieParser = require("cookie-parser")
const User = require("./models/user")
const sgMail = require('@sendgrid/mail');
var async = require("async");
var crypto = require("crypto");

const app =express()

app.use(bodyParser.json())
//app.use(cookieParser('secret'));

app.post('/email',function(req,res){
    sgMail.setApiKey('key');
    const msg = {
      to: user.email,
      from: 'noassignment123@gmail.com',
      subject: 'Your password has been changed',
      text: 'Hello,\n\n' +
      'This is a confirmation that the password for your account ' + user.email + ' has just been changed.\n'
    };
    sgMail.send(msg);
    console.log('Password has been reset');
})

// forgot password
app.get('/forgot', function(req, res) {
    res.send({"message":"Forgot page opened"})
  });
  
  app.post('/forgot', function(req, res, next) {
    async.waterfall([
      function(done) {
        crypto.randomBytes(20, function(err, buf) {
          var token = buf.toString('hex');
          done(err, token);
        });
      },
      function(token, done) {
        User.findOne({ email: req.body.email }, function(err, user) {
          if (!user) {
              res.send({"message":"User not found and redirect to forget page"})
            //req.flash('error', 'No account with that email address exists.');
            //return res.redirect('/forgot');
          }
          else{
  
          user.resetPasswordToken = token;
          user.resetPasswordExpires = Date.now() + 3600000; // 1 hour
          console.log(user.resetPasswordToken,user.resetPasswordExpires)
  
          user.save(function(err) {
            done(err, token, user);
          });
        }});
      },
      function(token, user) {
        sgMail.setApiKey('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');
        const msg = {
          to: user.email,
          from: 'noassignment123@gmail.com',
          subject: 'Node.js Password Reset',
          text: 'You are receiving this because you (or someone else) have requested the reset of the password for your account.\n\n' +
          'Please click on the following link, or paste this into your browser to complete the process:\n\n' +
          'http://' + req.headers.host + '/reset/' + token + '\n\n' +
          'If you did not request this, please ignore this email and your password will remain unchanged.\n'
        };
        sgMail.send(msg);
        console.log('mail sent');  
      }
    ], function(err) {
      if (err) return next(err);
      res.redirect('/forgot');
    });
  });
  
  app.get('/reset/:token', function(req, res) {
    User.findOne({ resetPasswordToken: req.params.token, resetPasswordExpires: { $gt: Date.now() } }, function(err, user) {
      if (!user) {
        res.send({"message":"Invalid Token "})
        //return res.redirect('/forgot');
      }
      res.send({"message":"Redirect to reset page with {token: req.params.token}"})
      //res.render('reset', {token: req.params.token});
    });
  });
  
  app.post('/reset/:token', function(req, res) {
    async.waterfall([
      function(done) {
        User.findOne({ resetPasswordToken: req.params.token, resetPasswordExpires: { $gt: Date.now() } }, function(err, user) {
          if (!user) {
            res.send({"message":"Invalid Token and render back"})
             //return res.redirect('back');
          }
          else if(req.body.password === req.body.confirm) 
          {
            user.setPassword(req.body.password, function(err) {
              user.resetPasswordToken = undefined;
              user.resetPasswordExpires = undefined;
  
              user.save(function(err) {
                   done(err, user);
                
              });
            })
          } else {
              //req.flash("error", "Passwords do not match.");
              res.send({ "message":"Password did'nt match"})
          }
        });
      },
      function(user, done) {
       
        sgMail.setApiKey('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');
        const msg = {
          to: user.email,
          from: 'noassignment123@gmail.com',
          subject: 'Your password has been changed',
          text: 'Hello,\n\n' +
          'This is a confirmation that the password for your account ' + user.email + ' has just been changed.\n'
        };
        sgMail.send(msg);
        console.log('Password has been reset');
       
      }
    ], function(err) {
      //res.redirect('/campgrounds');
    });
  });


//to add user into db
app.post('/signup',function(req,res){
    User.create(req.body).then(function(user){
    res.send(user)
    })
})

mongoose.connect('mongodb://localhost/forgotpassword')

mongoose.connection.once('open',function(){
    console.log('Connected to database')
})
app.listen(4000,function(){
    console.log('now listening at port 4000')
})
