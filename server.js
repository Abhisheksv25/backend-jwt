const express = require('express')
const session = require('express-session');
const bodyParser= require('body-parser')
const MongoClient = require('mongodb').MongoClient
const bcrypt = require('bcrypt');
const multer = require('multer');
const jwt = require('jsonwebtoken');
var safeCompare = require('safe-compare');
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/')
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname)
  }
})
const upload = multer({storage: storage})
var localStorage = require('local-storage');

const app= express()

app.use(express.static('uploads'))
app.use(session({secret: 'backend',saveUninitialized: true,resave: true}));

var sess;
app.listen(3000,function(){
console.log('Shaastra Registration')
})


  MongoClient.connect('mongodb+srv://yoda:Abhishek_25@cluster0-ymccc.mongodb.net/test?retryWrites=true&w=majority', { useUnifiedTopology: true })
    .then(client => {
    console.log('Connected to Database')
    const db = client.db('webops7')
    const storeData = db.collection('tokens')

    
    app.set('view engine', 'ejs')
    app.use(bodyParser.urlencoded({ extended: true }))
    app.use(bodyParser.json())
    app.use(express.static('public'))



      app.get('/', (req, res) => {
          sess = req.session
          if(sess.email) {
            res.redirect('/info');
          }
          db.collection('tokens').find().toArray()
          .then(user => {
          res.render('index.ejs', { user: user })
          })
          .catch(error => console.error(error))
          })

      app.get('/info', (req, res) => {
          sess = req.session

          db.collection('tokens').findOne({email:sess.email})
          .then(user => {
          if(user){
            res.render('info.ejs', { user: user })
          }
          else{
            res.redirect('/')
          }
          })
          .catch(error => console.error(error))
          })

      app.get('/login', (req, res) => {
          sess = req.session
          if(sess.email) {
            res.redirect('/info');
          }
          db.collection('tokens').find().toArray()
          .then(user => {
          res.render('login.ejs', { user: user })
           })
          .catch(error => console.error(error))
          })

      app.get('/unauth',(req,res)=>{
        req.session.destroy((err) => {
          if(err) {
              return console.log(err);
          }
          res.redirect('/');
      });

      });
        
      app.get('/auth',(req,res)=>{
        const token = localStorage.get('jwt');
        let loggedIn = true;
        if(token == null){
          loggedIn = false;
        }
         if(loggedIn){
         var decoded = jwt.verify(localStorage.get('jwt'), 'Abhishek');
         storeData.findOne({email:decoded.email})
         .then(result => {
         const identity= jwt.sign({ email:result.email,
         id:result._id
         },'Abhishek');
         const jwtoken = localStorage.get('jwt');
         localStorage.remove('jwt');
         res.render('auth.ejs');   
         });
        }
         else if(!loggedIn){
          res.redirect('/unauth');
         }
      });

      app.post('/info', (req, res) => {

        res.redirect('/')  
           
      })

       app.post('/logout', (req, res) => {
          
          req.session.destroy((err) => {
              if(err) {
                  return console.log(err);
              }
              res.redirect('/');
          });

           });

       app.post('/check', (req, res) => {
      
           storeData.findOne({email:req.body.email}) // storeData = db.Collection('tokens')
           .then(result => {
           bcrypt.compare(req.body.password, result.password, function(err, hash) {
             
            localStorage.set('email',req.body.email);

             if(hash){
              sess = req.session
              const token = jwt.sign({
                email:result.email,
                id:result._id
              },'Abhishek');
              localStorage.set('jwt', token);
              sess.email = req.body.email
              res.redirect('/info')
             }
             else{
              res.redirect('/') 
             }

           })
          
           })
           .catch(error => console.error(error))          
           })

          app.post('/auth',(req,res)=>{

            res.redirect('/auth');

          });
            


        app.post('/user', (req, res) => {
          bcrypt.hash(req.body.password, 10, function(err, hash) {
          req.body.password=hash
          storeData.insertOne(req.body)
         .then(result => {
              sess = req.session
              sess.email = req.body.email
              sess = req.session
              const token = jwt.sign({
                email:req.body.email,
                id:result._id
              },'Abhishek');
              localStorage.set('jwt', token);
              res.redirect('/info') ;
               
          })
          .catch(error => console.error(error))

          });

          })
      })
   

          
