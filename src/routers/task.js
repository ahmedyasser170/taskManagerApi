const express=require('express');
const router=new express.Router();
const Task=require('../model/task');
const auth=require('../middleware/auth');

router.post('/tasks',auth,async(req,res)=>{
    const task=new Task({
        ...req.body,
        owner:req.user._id
    });

    try {
        await task.save();
        res.status(201).send(task);
    } catch(e) {
        console.log(e);
        res.status(400).send(e);
    }

});


// GET /tasks?completed=true
// GET /tasks?limit=2&&skip=2
// GET /tasks?sortBy=createdAt:desc
router.get('/tasks',auth,async(req,res)=>{
    const match = {};
    const sort = {};

    if(req.query.completed) {
        match.completed = req.query.completed === 'true'
    }
    
    if(req.query.sortBy) {
        const parts = req.query.sortBy.split(':')
        sort[parts[0]] = parts[1] === 'desc' ? -1 : 1 ;
    }

    try{
      //  const tasks=await Task.find({owner:req.user._id});
        await req.user.populate({
            path:'tasks',
            match,
            options:{
                limit:parseInt(req.query.limit),
                skip:parseInt(req.query.skip),
                sort
            }
        }).execPopulate();
        res.send(req.user.tasks);
    }catch(e){
        res.status(500).send();
    }

});

router.get('/tasks/:id',auth,async(req,res)=>{
    const _id=req.params.id;

    try{
        const taskById=await Task.findOne({_id,owner:req.user._id});
        
        if(!taskById){
            return res.status(404).send();
        }

        res.send(taskById);
    }catch(e){
        res.status(500).send();
    }

});

router.patch('/tasks/:id',auth,async(req,res)=>{
    const updates=Object.keys(req.body);
    const allowedUpdates=['description','completed'];
    const isValidOperation=updates.every((update)=>allowedUpdates.includes(update));

    if(!isValidOperation){
        return res.status(400).send({eror:'invalide Updates'});
    }
    
    try{
       // const taskById=await Task.findByIdAndUpdate(req.params.id,req.body,{new:true,runValidators:true});
       
        const taskById=await Task.findOne({_id:req.params.id,owner:req.user._id});
        
        if(!taskById){
            return res.status(404).send();
        }

        const updateTask=updates.forEach((update)=> taskById[update] = req.body[update]);
        await taskById.save();


        res.send(taskById);
    } catch(e) {
        res.status(400).send(e);
    }
});

router.delete('/tasks/:id',auth,async(req,res)=>{
    try{
        const taskById=await Task.findOneAndDelete({_id:req.params.id , owner:req.user._id});

        if(!taskById){
            res.status(404).send();
        }

        res.send(taskById);
    }catch(e){
        res.status(500).send();
    }
});

module.exports=router;