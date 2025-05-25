if(process.env.NODE_ENV!="production"){
    require("dotenv").config();//env for secret Api keys and values
}
// console.log(process.env.SECRET);//access in ENV(envirmental variable)
const express=require("express");
const app=express();
const mongoose = require('mongoose');
const list=require("./models/listing.js");
const path=require("path");
const methodOverride=require("method-override");
const ejsMate=require("ejs-mate");
const wrapAsync=require("./public/util/wrapasync.js");
const expressError=require("./public/util/expresserror.js");
const {listSchema,reviewSchema}=require("./schema.js");
const Review=require("./models/review.js");
const session=require("express-session");
const MongoStore = require('connect-mongo');
const flash=require("connect-flash");
const passport=require("passport");
const LocalStrategy=require("passport-local");
const user=require("./models/user.js");

const lists=require("./routes/list.js");
const reviews=require("./routes/review.js");
const userRouter=require("./routes/user.js");

// const chatRoutes = require("./routes/chat");
// app.use("/api", chatRoutes);
// const chatRoute = require("./routes/chat");
// app.use("/chat", chatRoute);
// const chatbotRoutes = require('./routes/chatbot.js');
// app.use(express.json()); // ensure this is enabled
// app.use('/chatbot', chatbotRoutes);


app.set("view engine","ejs");
app.set("views",path.join(__dirname,"views"));
app.use(express.urlencoded({extended:true}));
app.use(express.json());
app.use(methodOverride("_method"));
app.engine("ejs",ejsMate);
app.use(express.static(path.join(__dirname,"/public")));

const dbUrl=process.env.ATLASDB_URL;


main()
.then(()=>{
    console.log("connected to DB");
}).catch((err) =>{ 
    console.log(err)});

async function main() {
    await mongoose.connect(dbUrl);
//   await mongoose.connect('mongodb://127.0.0.1:27017/wanderlust');
};


////chatbot/////
const chatbotRoutes = require('./routes/chatbot');
app.use('/chatbot', chatbotRoutes);


// app.post('/chatbot', (req, res) => {
//     const userMessage = req.body.message.toLowerCase();
//     const hotelPrice = 1000; // You can make this dynamic

//     if (userMessage.includes('hi') || userMessage.includes('hello') || userMessage.includes('price')) {
//         return res.json({ reply: "Hello! Please tell me your budget for this hotel." });
//     }

//     const budget = parseInt(userMessage.match(/\d+/)?.[0]);
//     if (!isNaN(budget)) {
//         if (budget >= hotelPrice * 0.9) {
//             return res.json({ reply: `Great! I can offer you this hotel for ₹${budget}. Booking confirmed.` });
//         } else {
//             const finalOffer = hotelPrice * 0.9;
//             return res.json({ reply: `Hmm, your budget is a bit low. I can offer you a final discount price of ₹${finalOffer}.` });
//         }
//     }

//     res.json({ reply: "I'm sorry, I didn't understand that. Can you tell me your budget?" });
// });


app.use((err,req,res,next)=>{
    let{statusCode=404,message="Page not found"}=err;
    res.status(statusCode).send(message);
});

const store=MongoStore.create({
    mongoUrl:dbUrl,
    crypto:{
        secret:process.env.SECRET,
    },
    touchAfter:24*3600,
});

store.on("error",()=>{
    console.log("error in mongo",err);
});

const sessionOption={
    store,
    secret:process.env.SECRET,
    resave:false,
    saveUninitialized: true,
    cookie:{
        expires:Date.now()+1000*60*60*24*7,
        maxAge:1000*60*60*24*7,
        httpOnly:true
    },
};

app.get("/", (req, res) => {
    res.redirect("/lists");
  });

app.use(session(sessionOption));
app.use(flash());

app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(user.authenticate()));

passport.serializeUser(user.serializeUser());
passport.deserializeUser(user.deserializeUser());

app.use((req,res,next)=>{
    res.locals.success=req.flash("success");
    res.locals.error=req.flash("error");
    res.locals.currUser=req.user;
    next();
});



app.listen(8080,()=>{
    console.log("app listen");
});

app.use("/lists",lists);
app.use("/lists/:id/reviews",reviews);
app.use("/",userRouter);

app.all("*",(req , res,next)=>{
    next(new expressError(404,"Page not found"));
});

app.use((err,req,res,next)=>{
    let {statusCode=500, message="something went wrong"}= err;
    res.status(statusCode).send(message);
});