import 'dotenv/config'; import express from 'express'; import mongoose from 'mongoose'; import cors from 'cors'; import session from 'express-session'; import MongoStore from 'connect-mongo'; import morgan from 'morgan';
import auth from './routes/auth.js'; import publicRoutes from './routes/public.js'; import student from './routes/student.js'; import admin from './routes/admin.js';
const app=express(); const port=process.env.PORT||5000;
await mongoose.connect(process.env.MONGO_URI);
app.set('trust proxy',1); app.use(cors({origin:process.env.CLIENT_URL||'http://localhost:5173',credentials:true})); app.use(express.json({limit:'1mb'})); app.use(morgan('dev'));
app.use(session({secret:process.env.SESSION_SECRET||'dev-secret-change-me',resave:false,saveUninitialized:false,store:MongoStore.create({mongoUrl:process.env.MONGO_URI,collectionName:'sessions'}),cookie:{httpOnly:true,secure:process.env.COOKIE_SECURE==='true',sameSite:process.env.COOKIE_SAME_SITE||'lax',maxAge:1000*60*60*24}}));
app.get('/api/health',(req,res)=>res.json({ok:true})); app.use('/api/auth',auth); app.use('/api/public',publicRoutes); app.use('/api/student',student); app.use('/api/admin',admin);
app.use((err,req,res,next)=>{console.error(err);res.status(500).json({message:'Internal server error'})}); app.listen(port,()=>console.log(`API running on http://localhost:${port}`));
