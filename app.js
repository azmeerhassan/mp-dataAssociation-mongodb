const express =  require('express')
const userModel = require('./models/user')
const postModel = require('./models/post')
const cookieParser = require("cookie-parser")
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')

const app = express()

app.set("view engine", "ejs")

app.use(express.json())
app.use(express.urlencoded({extended: true}))
app.use(cookieParser())

app.get('/', (req, res)=>{
    res.render('index');  
})
app.get('/login', (req, res)=>{
    res.render('login');  
})

app.post('/register', async(req, res)=>{
    let {username, name, age, email, password} = req.body
    let user =  await userModel.findOne({email})
    if (user) res.status(500).send('User already registered!')

    bcrypt.genSalt(10, (err, salt)=>{
        bcrypt.hash(password, salt, async (err, hash)=>{
            
            
           let user = await userModel.create({
                username,
                name, 
                age,
                email,
                password: hash
            })

            let token = jwt.sign({email: email, userid: user._id}, 'shhh')
            res.cookie("token", token)
            res.send('registered')
            
        })
        
    })    
} )
app.post('/login', async(req, res)=>{
    let {email, password} = req.body
    let user =  await userModel.findOne({email})
    if (!user) res.status(500).send('Something went wrong!')

    bcrypt.compare(password, user.password, (err, result)=>{
        if (result) res.status(200).send("You can login")
        else res.redirect('/login')
    })
} )

app.get('/logout', (req, res)=>{
    res.cookie('token', "")
    res.redirect('/login')
})

app.listen(3000)
