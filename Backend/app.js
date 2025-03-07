const express = require('express');
const app = express();
const axios = require('axios');
let env = require('dotenv')
let path = require('path')
env.config();  
const PORT = process.env.PORT || 5000;
let bcrypt=require('bcrypt')
let jwt = require('jsonwebtoken')
const cookieParser = require('cookie-parser')

const session = require('express-session');
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;

const cors = require('cors')
app.use(cors())

app.use(express.json());
app.use(express.urlencoded({extended:true}));
app.use(express.static('public'))
app.use(cookieParser())

app.set("view engine", "ejs");

app.use(session({
    secret: process.env.SESSION_SECRET || 'your_secret_key',
    resave: false,
    saveUninitialized: false,
}));

// Initialize passport
app.use(passport.initialize());
app.use(passport.session());

const mongoose = require('mongoose')
let userSchema = require('./models/user.model')
let MailSchema = require('./models/emailPost.model')

// Function to summarize email using Hugging Face API
const summarizeEmail = async (emailText) => {
    const apiKey = process.env.HUGGING_FACE_API_KEY;  // Fetch API key from .env

    const headers = {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
    };

    const body = {
        inputs: emailText,
    };

    try {
        const response = await axios.post(
            'https://api-inference.huggingface.co/models/facebook/bart-large-cnn',  // Summarization model
            body,
            { headers }
        );
        return response.data[0].summary_text;
    } catch (error) {
        console.error("Error during API request:", error);
        return { error: 'Failed to summarize email' };
    }
};

app.post('/api/createUser',async (req,res)=>{
    let {firstname,lastname,username,email,password}=req.body
    let checkEmail = await userSchema.findOne({ email });
        if (checkEmail) return res.status(400).json({ error: "Email already exists" });

    let checkUser = await userSchema.findOne({ username });
        if (checkUser) return res.status(400).json({ error: "Username already exists" });
    bcrypt.genSalt(10,(err,salt)=>{
        bcrypt.hash(password,salt,async(err,hash)=>{
            
            let createdUser = await userSchema.create({firstname,lastname,username,email,password:hash})
            console.log("user created",createdUser.username,createdUser.password)
            // res.render("home",{email:createdUser.email})
            
        })
    })

    let token = jwt.sign({email:email},process.env.JWT_SECRET)
    res.json({token:token})
})

app.post('/api/login',async(req,res)=>{
    let{email,password}=req.body;
    let user = await userSchema.findOne({email})
    if(user)
    {
        bcrypt.compare(password,user.password,(err,result)=>{
            console.log(result)
            if(result)
            {
                let token = jwt.sign({email:email},process.env.JWT_SECRET);
                res.cookie('token',token)
                res.json({token:token})
            }
            else
            {
                res.send('invalid creditinals wrong password or email')
            }
        })    
    }
    else{res.send('invalid creditinals wrong password or email')}
})

app.get('/logout',(req,res)=>{
    res.cookie('token',"")
    res.send('logged out')
})

function isLoggedIn(req,res,next)
{
    if(req.cookies.token === "")
    {
       return res.redirect('/login')
    }
    else{
        let data = jwt.verify(req.cookies.token,process.env.JWT_SECRET)
        req.user=data
    }
    next()
}
// API endpoint for summarizing email
app.post('/api/summarize',isLoggedIn, async (req, res) => {
    const { emailText,name } = req.body;
    let userdetails = await userSchema.findOne({email:req.user.email});
    let mailData=await MailSchema.create({user:userdetails._id,name,Mailcontent:emailText})
    userdetails.posts.push(mailData._id)
    await userdetails.save()
    if (!emailText) {
        return res.status(400).json({ result: 'No email content provided' });
    }

    const summary = await summarizeEmail(emailText);
    return res.json({result:summary})
});

app.get('/allMailUploads',isLoggedIn,async(req,res)=>{
    let user=await userSchema.findOne({email:req.user.email}).populate('posts')
    res.json({posts:user.posts})
})

app.get('/mailview/:name',isLoggedIn,async(req,res)=>{
    let mail= await MailSchema.findOne({name:req.params.name})
    let con=mail.Mailcontent
    res.send(con)
})

mongoose.connect(`${process.env.MONGODB_URL}/projectDB`)
.then(()=>{
    console.log('database connected')
    app.listen(PORT, () => {
        console.log(`Server running on http://localhost:${PORT}`);
})
})

.catch((err)=>{console.log('error',err.message)})

const { spawn } = require('child_process'); // For spawning Python process

// API route for classification
app.post('/api/classify',isLoggedIn ,async (req, res) => {
    const { emailText,name } = req.body;
    let userdetails = await userSchema.findOne({email:req.user.email});
    let mailData=await MailSchema.create({user:userdetails._id,name,Mailcontent:emailText})
    userdetails.posts.push(mailData._id)
    await userdetails.save()
    if (!emailText) {
        return res.status(400).json({ result: 'No email content provided' });
    }

    // Spawn a new Python process to classify the email
    const pythonProcess = spawn('python', ['predict.py', emailText]);

    let result = '';
    pythonProcess.stdout.on('data', (data) => {
        result += data.toString();
    });

    pythonProcess.stderr.on('data', (data) => {
        console.error(`stderr: ${data}`);
    });

    pythonProcess.on('close', (code) => {
        if (code === 0) {
            result = result.trim().replace(/\r?\n/g, '');
            // Send the classification result as a response
            res.json({ result: result });
        } else {
            res.status(500).json({result: 'Error during classification' });
        }
    });
});



// Google OAuth Strategy
passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: process.env.CALLBACK_URL
}, async (accessToken, refreshToken, profile, done) => {
    try {
        let user = await userSchema.findOne({ email: profile.emails[0].value });
        if (!user) {
            user = await userSchema.create({
                firstname: profile.name.givenName,
                lastname: profile.name.familyName,
                username: profile.emails[0].value.split('@')[0],
                email: profile.emails[0].value,
                password: '' // Since it's OAuth, password is not required
            });
        }
        return done(null, user);
    } catch (err) {
        return done(err, null);
    }
}));

passport.serializeUser((user, done) => {
    done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
    try {
        let user = await userSchema.findById(id);
        done(null, user);
    } catch (err) {
        done(err, null);
    }
});

// Google OAuth Routes
app.get('/auth/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

app.get('/auth/google/callback',
    passport.authenticate('google', { failureRedirect: '/login' }),
    (req, res) => {
        let token = jwt.sign({ email: req.user.email }, process.env.JWT_SECRET);
        res.redirect(`${process.env.FRONTEND_URL}/login?token=${token}`);
    }
);
