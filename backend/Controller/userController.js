const User=require('../Models/User');
const zod = require("zod");
const jwt = require("jsonwebtoken");
const bcrypt = require('bcrypt');
const validator = require('validator'); 
const newUser = async (req, res) => {

    const signupBody = zod.object({
        name: zod.string(),
        email: zod.string().email(),
        password: zod.string()
    });

    const { success } = signupBody.safeParse(req.body);
    if (!success) {
        return res.status(411).json({
            message: "Please enter correct inputs"
        })
    }
    try {

        const { email, name, password } = req.body;

        const existingUser = await User.findOne({ email });


        if (existingUser) {
            return res.status(411).json({
                message: "Email already taken, please try with another Email"
            })
        }

        const salt = await bcrypt.genSaltSync(10);
        const hash = bcrypt.hashSync(password, salt);


        const user = await User.create({
            email,
            name,
            password: hash
        })
        const token = jwt.sign({
            _id: user._id
        }, process.env.TOKEN_SECRET);

        return res.status(201).json({
            success: true,
            token: token,
            message: `Welcome, ${user.name}`,
        })
    }
    catch (e) {
        res.status(500).send("Server Error");

    }
};




const Login = async (req, res) => {

    const signinBody = zod.object({
        email: zod.string().email(),
        password: zod.string()
    });

    const { success } = signinBody.safeParse(req.body)
    if (!success) {
        return res.status(411).json({
            message: "Please enter correct inputs"
        })
    }
    const { email, password } = req.body;

    try {
        const user = await User.findOne({
            email
        });
        if (!user) {
            return res.status(400).json({ msg: "Invalid credentials" });
        }

        const userPassword = await bcrypt.compareSync(password, user.password);

        if (!userPassword) {
            return res.status(400).send('Email or Password is Incorrect');
        }

        const token = jwt.sign({ _id: user._id }, process.env.TOKEN_SECRET);
        res.json({
            email: user.email,
            token
        })
    }

    catch (e) {
        return new Error(e.message);
    }
};


const updateUser = async (req, res) => {
    try {
        const user = req.user;
        if (!user)             return res.status(400).json({ msg: "No user found" });

    
        const updateUser = await User.findById(user._id);
    
        const { username, email, oldPassword, newPassword } = req.body;
    
        if (username) {
          await updateUser.updateOne({ username: username });
        }
        if (email) {
          if (email !== updateUser.email) {
            const oldUser = await User.findOne({ email });
            if (oldUser)
              return  res.status(400).json({ msg: "incvalod email" });
          }
    
          await updateUser.updateOne({ email: email });
        }
    
        if (oldPassword && newPassword) {
          const isPassCorrect = await bcrypt.compare(
            oldPassword,
            updateUser.password
          );
    
          if (!isPassCorrect)
            return  res.status(400).json({ msg: "Wrong old password" });
    
          const hashedPass = await bcrypt.hash(newPassword, 10);
    
          await updateUser.updateOne({ password: hashedPass });
        }
    
        res.status(200).json({ message: "Updated successfully!" });
      } catch (e) {
        return new Error(e.message);
      }
};

const addPeople = async (req, res) => {
    try {
        const user = req.user;
        if (!user)            
            return res.status(400).json({ msg: "No user found" });    
        const updateUser = await User.findById(user._id);
        const { assigneEmail } = req.body;
        if (!assigneEmail || !validator.isEmail(assigneEmail)) {
            return res.status(400).json({ msg: "Invalid or missing email address" });
        }
        if(assigneEmail === updateUser.email)
        {
            return res.status(400).json({ msg: "Yours and add new people email cannot be same." });
        }
         if(updateUser.myAssignies.includes(assigneEmail))
        {
            return res.status(400).json({ msg: "Email already added to assignee." });
        }
        if (assigneEmail) {
            updateUser.myAssignies.push(assigneEmail); 
            await updateUser.save();
        }
        res.status(200).json({ message: "Add people successfully!" });
      } catch (e) {
        return new Error(e.message);
      }
};

const getAllMyAssignees = async (req, res) => {
    try {
        const user = req.user;
        if (!user) {
            return res.status(400).json({ msg: "No user found" });
        }

        const updateUser = await User.findById(user._id);
        const assignees = updateUser.myAssignies.map(email => {
            let name = '';

            const username = email.split('@')[0];
            
            if (username.includes('.')) {
                const [firstName, lastName] = username.split('.');
                name = `${firstName[0].toUpperCase()}${lastName[0].toUpperCase()}`;
            } else {
                name = `${username[0].toUpperCase()}${username[1]?.toUpperCase() || ''}`;
            }

            return {
                email,
                name
            };
        });

        res.status(200).json({ message: "Get people successfully!" ,assignees });
    } catch (e) {
        res.status(500).json({ msg: 'No assignee fid' });
    }
};


module.exports = { newUser, Login, updateUser,addPeople,getAllMyAssignees}

