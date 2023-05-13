

require('dotenv').config();
const express = require("express");
const multer = require('multer');
const path = require('path');
const mongoose= require("mongoose")
const ejs = require('ejs');
const bodyParser = require("body-parser");
const _ = require('lodash');
var nodemailer = require('nodemailer');
var flash = require('connect-flash');
const jwt = require('jsonwebtoken');
const  session = require("express-session");
const passport = require("passport");
const passportLocalMongoose = require("passport-local-mongoose");
const findOrCreate = require('mongoose-findorcreate');
var moment = require('moment');
var isJson = require("is-json");
var json2xls = require("json2xls");
const fs = require('fs');  
const { Console } = require('console');

Schema = mongoose.Schema;

const app = express();
app.set('view engine', 'ejs');

app.use(express.static("public", {
    maxAge: 86400000,
    setHeaders: function(res, path) {
        res.setHeader("Expires", new Date(Date.now() + 2592000000*30).toUTCString());}
}));
app.use(bodyParser.json({ limit: '50mb' }))
app.use(bodyParser.urlencoded({
  limit: '50mb',
  extended: true,
}));
const JWT_SECRET = process.env.JWT_SECRET;

app.use(session({
    secret: process.env.COOKIE_SECRET,
  cookie:{maxAge:3600000},
    resave: false,
    saveUninitialized:false,
   
}));
app.use(flash());
app.use(passport.initialize());
app.use(passport.session()); 




const mongoURI = `${process.env.URL}`
const promise = mongoose.connect(process.env.URL, { useNewUrlParser: true,useUnifiedTopology:true, useFindAndModify: false }).then(()=>console.log('connected to db'))
.catch((err)=>console.log('err',err));
// Create mongo connection
const conn = mongoose.connection
// Create storage engine





mongoose.set("useCreateIndex", true);




const adminSchema = new mongoose.Schema({
    email:String,
    password: String,
    secret: String,
});
const userSchema = new mongoose.Schema({

  registered:{
      type:Boolean, default:false,
  },
    email:String,
    password: String,
    gender:String,
    dob:String,
    address:String,
    designation:String,
    qualification:String,
    organisationName:String,

    researchAbstract:String,
     contact:String,
    fname:String,
   
    lname:String,
  
    oraganisationAddress:String,
    oraganisationCity:String,
    oraganisationPincode:String,
    oraganisationName:String,
    registrationCompletionYear:{
        type:String,
       
    } ,
    branch:{
        type:String,
        lowercase:true,
    } ,
   
    
 

});

const eventSchema = new mongoose.Schema({
    fname:String,
    lanme:String,
    address:String,
    contact:String,
    type:String,
    cat:String,
  

})

const peopleSchema = new mongoose.Schema({
    fname:String,
    lanme:String,
    address:String,
    contact:String,
    type:String,
    cat:String,
  

})
// fname:First_Name,
// lname:Last_Name, 
// address:address, 
// to:type,
// contact:transportation,

participantSchema = new mongoose.Schema({
   
    fname:String,
    designation:String,
    qualification:String,
    organisationName:String,
    contact:String,
email:String,

    eventId:String,    
    eventname:String,
    from:String,
   
    mode:String,
    to:String,
    userId:String,
    feeStatus:String,
    customername:String,
    bankname:String,
    transactionId:String,
    receipt:String,

    abs:String,
    absstatus:String,

    fp:String,
    fpstatus:String,
    
    



})

var maxSize = 10000000;
const storage = multer.diskStorage({ 
  options:{ useUnifiedTopology: true,},
  db: promise,
 destination:"./public/uploads",
 filename:(req, file, cb)=>{
   cb(null,Date.now()+path.extname(file.originalname))
 }
});
const upload = multer({ storage,
   fileFilter: function (req, file, callback) {
  var ext = path.extname(file.originalname);
  if(ext !== ('.docx' || '.doc')) {
      return callback(new Error('1.Only docx files are allowed\n2.please select a docx file'))
  }
  callback(null, true)
}, limits: { fileSize: maxSize } }).single('file');

const uploads = multer({ storage,
    fileFilter: function (req, file, callback) {
   var ext = path.extname(file.originalname);
   if(ext !== ('.pdf')) {
       return callback(new Error('1.Only pdf files are allowed\n2.please select a pdf file'))
   }
   callback(null, true)
 }, limits: { fileSize: maxSize } }).single('file');



userSchema.plugin(passportLocalMongoose);
userSchema.plugin(findOrCreate);
const User = new mongoose.model("User",userSchema);

adminSchema.plugin(passportLocalMongoose);
adminSchema.plugin(findOrCreate);
const Admin = new mongoose.model("Admin",adminSchema);
const Event = mongoose.model("Event", eventSchema);
const People = mongoose.model("People", peopleSchema);
const Participant = mongoose.model("Participant", participantSchema);






var userModel = mongoose.model('User',userSchema);


var userCount = userModel.countDocuments('id');


passport.use(User.createStrategy());
passport.serializeUser(function(user,done){
    done(null,user.id);
});
passport.deserializeUser(function(id,done){
    User.findById(id,function(err,user){
        done(err, user);
    })
});
let transporter = nodemailer.createTransport({
     service: 'gmail',
    auth: {
        user: process.env.EMAIL,
        pass: process.env.PASSWORD,
    }});

app.get("/register", function(req, res, next)
{
   
        res.render("register",{a1:"", a2:"", a3:"", a4:"", a5:"", a6:"",});
   
});

app.get("/newhomepage", function(req, res, next)
{
   
        res.render("newhomepage",{a1:"", a2:"", a3:"", a4:"", a5:"", a6:"",});
   
});
app.get("/login", function(req, res, next)
{
    res.render("login");
});
app.get("/adminlogin", function(req, res, next)
{
    res.render("adminlogin",{a1:"Login",a2:"/login",a3:"", a4:"", a5:"", a6:"",});
});



app.get("/LogOut", function(req, res, next)
{
    req.logout();
    res.redirect("/login");
});

app.post("/registers",function(req, res, next){
    
    var organisationName = req.body.organisationName;
    var name = req.body.username;
    var password = req.body.password;
    var password2 = req.body.password2;
    var ab=req.body.branch;
    var bc=req.body.fname;
    var cd=req.body.lname;
   var de=req.body.gender;
   var Registered = false;
 
   

    var ef=req.body.registrationCompletionYear;
    var fg=req.body.contact;

    var ij= req.body.dob;
    var jk=req.body.address;
    var kl=req.body.designation;
    var lm=req.body.qualification;
    
    var no = req.body.researchAbstract;
    var op= req.body.phdGuideName;
    var pr= req.body.phdGuideEmail;
    var rq= req.body.phdGuideMobile;
    var qs= req.body.oraganisationName;
    var st =req.body.oraganisationAddress;
    var tu= req.body.oraganisationCity;
    var uv= req.body.oraganisationPincode;
 
 
  
        const info = new User({
branch:ab,
fname:bc,
lname:cd,
username:name ,
organisationName:organisationName,
registered:Registered,


contact: fg,
registered:"Not Applied",

feeStatus:"Not Submitted",

bankName:'',
transactionId:'',
receipt:'',
// cv:hh,

gender:de,
dob:ij,
address:jk,
designation:kl,
qualification:lm,

registrationCompletionYear:ef,
researchAbstract:no,

oraganisationAddress:st,
oraganisationCity:tu,
oraganisationPincode:uv,



})

    var mailOptions = {
      
        to:name,
        subject: 'Welcome , You have successfully Registered',
        text: "Congrats on successful Registration."+'\n'+"Your credentials is here " +'\n' +"Email : " +req.body.username+'\n'+"password : " +req.body.password,
      };
      var mailOptionss = {
      
        to:'geeta.durga78@gmail.com',
        subject: 'New Sign In',
        text: bc+"  has Successfully Registered."
      };
        
    if((password != password2) || (password.length < 8)){
    
        req.flash('message', 'either passwords did not match' +'\n'+ 'or the length of password is less than 8 characters')
    
   
        res.redirect('/registrationguidelines?#form');
}
else{
    
    if(!name || !password || !password2  || !ab || !bc || !de || !ef || !fg ){
        req.flash("message", "OOPS, Please fill all the inputs fields and try again.")
        res.redirect('/registrationguidelines?#form');
    }else{
    
    User.register(new User(info), req.body.password, function(err,user){
        if(err){
          var err = {message: "1. Already Registered, try to login"+'\n'+" ", err:"Sorry!!!"}
          next(err)
         
        }
        else{
            passport.authenticate("local")(req, res, function(){
                transporter.sendMail(mailOptions, function(err, info){
                    if(err){
                      
                        var err = {message: "Something error in sending confirmation mail."+'\n'+"  But you have been registered successfully. "+'\n'+" Try  to login with same credentials.", err:"Sorry!!!"}
                        next(err)
     
           
                         
                    } else {

                      
                        transporter.sendMail(mailOptionss, function(err, info){
                            if(err){
                              
                                var err = {message: "Something error in sending confirmation mail."+'\n'+"  But you have been registered successfully. "+'\n'+" Try  to login with same credentials.", err:"Sorry!!!"}
                                next(err)
             
                   
                                 
                            } else {
        
                              
                              res.redirect("/homepage");
                            }
                          });
                    }
                  });
                
              

            })
        }
    })

}
}



});




app.post("/login",function(req, res, next){
 var name = req.body.username;
 var password = req.body.password;

    const user = new User ({
        username: name,
        password: req.body.password,
    });
  
    

  if(!name || !password){
res.render("login", { a1:"Admin Login",a2:"/adminlogin",a3:"", a4:"", a5:"", a6:"", err:"Please fill all the fields"})
  }
   else{
    req.login(user, function(err){
    if(!err) {
            passport.authenticate("local")(req,res , function(){
            
                 
                res.redirect("/typesOfWaste");
            });
        }
        else{
            var err = {message: "We are facing some issues ."+'\n'+" Please try again later.", err:"Sorry!!!"}
            next(err)
             
           
        }
    })
   }
  

});

app.get('/homepage', (req, res, next)=>{
    var home = 'homepage'
    var homes = '';
 
        var query= {} ;
        var page=1;
        var perpage=30;
        if(req.query.page!=null){
            page= req.query.page
        }
        query.skip=(perpage * page)-perpage;
        query.limit=perpage;

    if(req.isAuthenticated()){
        var id = (req.user._id).toString();
        if(req.user.registered===true){
            Participant.find({userId: id}, {}, query).sort({_id: -1}).exec((err, docs) => { 
     
        if(err){
           
            var err = {message: "We are facing some issues ."+'\n'+" Please try again later.", err:"Sorry!!!"}
            next(err)
        }else{
            Participant.countDocuments({userId: id},(err,count)=>{ 
                if(err){
                   var err = {message: "1. Something went wrong."+'\n'+"2. Internal server Error.", err:"500"}
                   next(err)
                }else{
                res.render('homepage',{
                   
                   name:req.user.fname , 
                    registered: req.user.registered, 
                   docs:docs,
                    home: home,
                    homes :homes ,
                    message:req.flash('message'),
                    Applicants: count,
                    current:page,
                    pages:Math.ceil(count/perpage),
                    a1:"Log Out",a2:"/logout",a3:"Students's Home", a4:"/Home", a5:"", a7:"", a6:"",
                   
                })}
           });
            
        }

    })}else{

      
        res.render('homepage',{name:req.user.fname ,message:req.flash('message'),  registered: req.user.registered, current:1,
            pages:1,
           })
    }
 
}else
    res.redirect('/login')
})



app.get('/success', upload, (req, res)=>{
    // if(req.isAuthenticated())
    res.render('success')  
    // else
    // res.redirect('/login')
})



app.post("/adminlogin",function(req, res, next){
   var emails= req.body.username;
   var password = req.body.password;
   
    const admin = new Admin ({
        username: req.body.username,
        password: req.body.password,
    });

    if(!emails || !password){
        res.render("login", { a1:"Login",a2:"/login",a3:"", a4:"", a5:"", a6:"", err:"Please fill all the fields"})
          }else{

    Admin.findOne({username: emails}).then(admin=>{
if(!admin){
  res.render("adminlogin", {err:"not a Valid user",a1:"Login",a2:"/login",a3:"", a4:"", a5:"", a6:"",});
}else{
    req.login(admin, function(err){
        if(err) {
            var err = {message: "Something went wrong!! ."+'\n'+" Please try again later.", err:"Sorry!!!"}
        next(err)
        }
       else{
        
        passport.authenticate("local")(req,res , function(){
            res.redirect("/fj7ebhds7b=7y7823b7823badminpanel");
        });
         
        }
    })
}
});
          }
});

let a= "https://img.icons8.com/material-outlined/24/000000/google-scholar.png";
let b = "https://img.icons8.com/windows/24/000000/orcid.png"
let c = "https://img.icons8.com/material-outlined/24/000000/linkedin--v1.png"
let d = "/img/ic.png";
app.get("/", function(req, res, next)
{

    // if (req.isAuthenticated()){
   res.render('home',{a:"https://img.icons8.com/material-outlined/24/000000/google-scholar.png", b:b, c:c});
    
});




















app.get('/fj7ebhds7b=7y7823b7823badminpanel', (req, res, next)=>{
    if(req.isAuthenticated()){
        
        var home = 'fj7ebhds7b=7y7823b7823badminpanel';
        var homes = '';
     
            var query= {} ;
            var page=1;
            var perpage=30;
            if(req.query.page!=null){
                page= req.query.page
            }
            query.skip=(perpage * page)-perpage;
            query.limit=perpage;

            
                Event.find({}, {}, query).sort({_id: -1}).exec((err, docs) => { 
   
                    

                    
                if(err){
                    var err = {message: "1. Something went wrong."+'\n'+"2. Internal server Error.", err:"500"}
                    next(err)
                }else{
                  
                Event.countDocuments((err,count)=>{ 
                     if(err){
                        var err = {message: "1. Something went wrong."+'\n'+"2. Internal server Error.", err:"500"}
                        next(err)
                     }else{
                     res.render('admin',{
                        docs:docs,
                         home: home,
                         homes :homes ,
                         message:req.flash('message'),
          
           
           
                         current:page,
                         pages:Math.ceil(count/perpage),
                        
                     })}
                });
                  }  });
    }else{
        res.redirect('/adminlogin')
    }

})
        


app.get('/', (req, res)=>{
    res.render('home')
})

app.get('/typesOfWaste', (req, res)=>{
    res.render("typesOfWaste")
})

app.get("/transportation", (req, res)=>{
    console.log("yes am in")
    res.render("transport",{type:"Transportation of Waste Material"})
})

app.get("/ad", (req, res)=>{
    console.log("yes am in")
    res.render("ad",{type:"Transportation of Waste Material"})
})

app.get("/segregation", (req, res)=>{
    res.render("segregation",{type:"Segregation of Waste Material"})
})

app.get("/collection", (req, res)=>{
    res.render("collection",{type:"Collection of Waste Material"})
})

app.get("/disposal", (req, res)=>{
    res.render("disposal",{type:"Disposal of Waste Material"})
})

app.get("/segregated", function(req, res, next)
{

    People.find({cat:"segregation"}, (err, posts)=>{
        if(err){
            var err = {message: "Something error"}

            next(err)
        }
        res.render('segregated', {posts:posts});
    })

}
);

app.get("/transportated", function(req, res, next)
{

    People.find({cat:"transportation"}, (err, posts)=>{
        if(err){
            var err = {message: "Something error"}

            next(err)
        }
        res.render('transported', {posts:posts});
    })

}
);


app.get("/disposed", function(req, res, next)
{

    People.find({cat:"disposal"}, (err, posts)=>{
        if(err){
            var err = {message: "Something error"}

            next(err)
        }
        res.render('disposed', {posts:posts});
    })

}
);

app.get("/collected", function(req, res, next)
{

    People.find({cat:"collection"}, (err, posts)=>{
        if(err){
            var err = {message: "Something error"}

            next(err)
        }
        res.render('collected', {posts:posts});
    })

}
);


app.post('/seg', (req, res, next)=>{
    var {fname, lname, email,address ,typeOfWaste,cat, cats}=req.body;
    console.log(fname+cat+cats+typeOfWaste)
    var ee = new People({
      
        fname:fname,
        lname:lname,
        address:address,
        contact:email,
        type:typeOfWaste,
        cat:cat,
    })
    console.log("iam n")

    ee.save((err, doc)=>{
        if(err){
            var err = {message: "1. Something went wrong while creating the event"+'\n'+"2. Internal server Error.", err:"500"}
            next(err)
        }else{
            req.flash('message', 'Event created successsfully')
           res.redirect('/success')
            
        }
    })

})




app.get('/forgot-password', (req, res,next)=>{
    res.render("forgot-password",{  dis:'',a1:"Back",a2:"/",a3:"", a4:"", a5:"", a7:"", a6:"",});
})
app.post('/forgot-password', (req, res,next)=>{
var h ;

    const emails = req.body.username;
if(!emails){
    res.render("forgot-password",{err: "Please fill the required details",ty:'danger', dis:'', but:'',a1:"Back",a2:"/",a3:"", a4:"", a5:"", a7:"", a6:"",})
}
else{
    User.findOne({username: emails}).then(user=>{
        if(!user){
            res.render("forgot-password",{err: "Invalid user or User doesn't exist",a1:"Back",a2:"/",a3:"", a4:"", a5:"", a7:"", a6:"",ty:'danger', dis:'', but:'',})

        }
        const secret = JWT_SECRET + user.password;
        const payload = {
            username: user.username,
            _id: user.id,
        }
        const token = jwt.sign(payload, secret, {expiresIn: '10m'})
        const link = 'https://organic-electronics.org/reset-password/'+user.id+'/'+token
   

        var mailOptions = {
            from: 'organicelectronicssoc.india@gmail.com',
            to: emails,
            subject: 'Password reset link ',
            html: 'Here is your reset link <p>' +link+ '</p> <h3>Dont share it with anyone else.</h3>',
            
          };
          transporter.sendMail(mailOptions, function(err, info){
            if (err) {
                var err = {message:"Something went wrong while send the reset link !!"+'\n'+"try after sometime!!" , err:"Sorry"}
            } else {
                res.render("forgot-password",{err: "Reset password link sent to your email, and will be valid for only 10 mins!!",a1:"Back",a2:"/",a3:"", a4:"", a5:"", a7:"", a6:"",ty:'success',dis:'disabled',but:'disabled',})         
                
            }
          });
      
    })
}
})
app.get('/reset-password/:id/:token', (req, res,next)=>{
    const idi = (req.params.id).toString();
     const token = req.params.token;
     var err;
    User.findOne({_id: idi}).then(user=>{
        if(!user){
            res.render("forgot-password",{err: "Invalid user or User doesn't exist",ty:'danger',a1:"Back",a2:"/",a3:"", a4:"", a5:"", a7:"", a6:"",dis:'', but:'',})

        }
        const secret = JWT_SECRET + user.password;
        try{
            const payload = jwt.verify(token,secret)
            res.render('reset-password',{username:user.username,tokent:token,idis:idi,a1:"Back",a2:"/",a3:"", a4:"", a5:"", a7:"", a6:"",ty:'', dis:'', but:'', none:"none",})

           
        }catch(err){
        
            res.render("forgot-password",{err: 'Sorry, The  link has been expired!!', a1:"Back",a2:"/",a3:"", a4:"", a5:"", a7:"", a6:"",ty:'danger', dis:'disabled', but:'disabled',none:"none",})
        }
    })
    
})
app.post('/reset-password/:id/:token', (req, res,next)=>{
    const idi = req.params.id;
     const token = req.params.token;
    const password = req.body.password;
    const password2 = req.body.password2;
    const em = req.body.em;
    var err;

   
    User.findOne({_id: idi}).then(user=>{
        if(!user){
            res.render("reset-password",{err: "Invalid user or User doesn't exist", ty:'danger',a1:"Back",a2:"/",a3:"", a4:"", a5:"", a7:"", a6:"",username:user.username,tokent:token,idis:idi, dis:'', but:'',none:"none",})

        }
        const secret = JWT_SECRET + user.password;
       
            const payload = jwt.verify(token,secret);
            if(!password || !password2){
                res.render("reset-password",{err: "Please fill the passwords section", ty:'danger',a1:"Back",a2:"/",a3:"", a4:"", a5:"", a7:"", a6:"",username:user.username,tokent:token,idis:idi, dis:'', but:'',none:"none",})
            }else{

if(password != password2){
    res.render("reset-password",{err: "Passwords didn't match",a1:"Back",a2:"/",a3:"", a4:"", a5:"", a7:"", a6:"",username:user.username,tokent:token,idis:idi, ty:'danger', dis:'', but:'',none:"none",})
}else{
    user.setPassword(password, function(err, user){
        if (err){
            var err = {message:"Something went wrong while changing the password!!"+'\n'+"try after sometime!!" , err:"Sorry"}
             next (err)
        }
        else{
            // console.log(user.password+" "+password)
            user.save();
            res.render("reset-password",{err: "Password Changed successfully,please try to login again!!", ty:'success',a1:"Back",a2:"/",a3:"", a4:"", a5:"", a7:"", a6:"",username:user.username,tokent:token,idis:idi, dis:'disabled', but:'disabled',none:"block",})
        }
    })
}
            
        } 
    }) 
})




app.all("*", (req, res, next)=>{
  const err =  {message :"requested URL is not found", err: "404"};
  err.statusCode = 404;
  next (err)
})

if (app.get('env') === 'development') {
    app.use(function(err, req, res, next) {
      res.status(err.status || 500);
      res.render('error', {
        message: err.message,
        error: err.err,a1:"Log Out",a2:"/logout",a3:"", a4:"", a5:"", a6:"",
      });
    });
  }

  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,a1:"Log Out",a2:"/logout",a3:"", a4:"", a5:"", a6:"",
      error: err.err
    });
  });
app.listen(process.env.PORT || 3001,function(){
    console.log("Server is successfully started at post 3001");

});

