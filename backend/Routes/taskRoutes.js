const express = require('express');
const {createTask, getTask, editTask, deleteTask, shareTask, getShareTask} =require('../Controller/taskController');

const router = express.Router(); 
router.post('/createTask', createTask);
router.get('/getTask',getTask);
router.put('/editTask',editTask);
router.delete('/:id', deleteTask);
router.get('/getShareTask/:id',getShareTask);
module.exports = router;