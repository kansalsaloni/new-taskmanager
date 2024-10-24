const Task=require('../Models/Task');
const slugify = require('slugify');

const createTask=async(req,res)=>{
    try{
        const user=req.user;
        if (!user) return res.status(400).json({ msg: "No user found" });
        const { type, title, priority, assignedTo, checklist, dueDate } = req.body;
        if (!type || !title || !priority || !checklist) {
            return res.status(400).json({ msg: "Enter all fields" });
        }
        const task=await Task({
            userId:user._id,
            type,
            title,
            dueDate,
            priority,
            checklist,
            assignedTo
        });
        await task.save();
        return res.status(400).json({ msg: "No user found" });
    }
    catch(e)
    {
        return res.status(500).json({
            success: false,
            message: "Server error"
        });
    }
}

const getTask=async(req,res)=>{
    try{
        const {taskId}=req.params;
        const task=  await Task.findById(taskId);
        if(!task) return res.status(400).json({  success: false,msg: "Task not found" });
        res.status(200).json({
         success:true,
         message:"Task created successfully"
        });
    }
    catch(e)
    {
        return   res.status(500).json({
        success: false,
        message: "Server error"
    });
    }
}

const editTask=async(req,res)=>{
    const { type, title, priority, assignedTo, checklist, dueDate } = req.body;
    try{
        const {taskId}=req.params.id;
        const task=  await Task.findById(taskId);

        if(!task) return res.status(400).json({ success: false, msg: "Task not found" });

        if(title) task.title=title;
        if(priority) task.priority=priority;
        if(assignedTo) task.assignedTo=assignedTo;
        if(checklist) task.checklist=checklist;
        if(dueDate) task.dueDate=dueDate;

        await task.save();

         res.status(200).json({
            success: true,
            message: "Task edit successfully"
        });
    }
    catch(e)
    { 
        return res.status(500).json({
        success: false,
        message: "Server error"
        });
    }
}


const deleteTask=async(req,res)=>{
        try{
            const {taskId}=req.params.id;
            const task=  await Task.findById(taskId);
            if(!task) return res.status(400).json({  success: false,msg: "Task not found" });

            await task.deleteOne();

            res.status(200).json({
            success:true,
            message:"Task deleted successfully"
            });
        }
        catch(e)
        {
            return   
            res.status(500).json({
                success: false,
                message: "Server error"
            });
        }
}

const shareTask=async(req,res)=>{
        try{
                const {taskId}=req.params.id;
                const task=  await Task.findById(taskId);
                if(!task) return res.status(400).json({  success: false,msg: "Task not found" });
    
                const slugTitle=slugify(task.title,{lower:true,strict:true});
                const taskLink=`${slugTitle}_${task._id}`;
    
                res.status(200).json({
                    success:true,
                    taskLink
                });

        }
        catch(e)
        {
                return   
                res.status(500).json({
                    success: false,
                    message: "Server error"
            });
        }
 }

 const getShareTask=async(req,res)=>{
    try{
            const { slugID } = req.params;
            const [slug, id] = slugID.split('_');
            const task=  await Task.findById(id);
            if(!task) return res.status(400).json({  success: false,msg: "Task not found" });

            res.status(200).json({
                success:true,
                taskLink
            });

    }
    catch(e)
    {
            return   
            res.status(500).json({
                success: false,
                message: "Server error"
        });
    }
}
 
module.exports = { createTask,getTask,editTask,deleteTask,shareTask,getShareTask};