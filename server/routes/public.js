import {Router} from 'express'; import {Course,Trainer} from '../models.js';
const r=Router();
r.get('/courses',async(req,res)=>res.json({courses:await Course.find().select('name slug description icon topics.title').lean()}));
r.get('/trainers',async(req,res)=>res.json({trainers:await Trainer.find().sort({createdAt:-1}).lean()}));
export default r;
