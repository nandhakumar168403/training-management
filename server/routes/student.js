import {Router} from 'express'; import {Attendance,Course,Trainer,Student} from '../models.js'; import {requireStudent} from '../middleware/auth.js';
const r=Router();
r.use(requireStudent);
r.get('/me',async(req,res)=>res.json({student:req.student}));
r.get('/tasks',async(req,res)=>res.json({courses:await Course.find().lean()}));
r.get('/attendance',async(req,res)=>res.json({attendance:await Attendance.find({studentId:req.student._id}).populate('courseId','name').populate('trainerId','name').sort({attendanceDate:-1}).lean()}));
r.get('/attendance/options',async(req,res)=>res.json({courses:await Course.find().select('name').lean(),trainers:await Trainer.find().select('name').lean()}));
r.post('/attendance',async(req,res)=>{const {courseId,trainerId,attendanceDate,topicsCovered,classStartTime,classEndTime}=req.body;if(!courseId||!trainerId||!attendanceDate||!topicsCovered||!classStartTime||!classEndTime)return res.status(400).json({message:'All attendance fields are required'});const a=await Attendance.create({studentId:req.student._id,courseId,trainerId,attendanceDate,topicsCovered,classStartTime,classEndTime,status:'pending'});res.status(201).json({message:'Attendance submitted for admin approval.',attendance:a})});
export default r;
