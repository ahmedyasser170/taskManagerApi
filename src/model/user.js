const mongoose=require('mongoose');
const validator=require('validator');
const bcrypt=require('bcryptjs');
const jwt=require('jsonwebtoken');
const Task=require('./task');

const userSchema=new mongoose.Schema({
    name:{
        type:String,
        required:true,
        trim:true
    },
    email:{
        type:String,
        required:true,
        trim:true,
        unique:true,
        lowercase:true,
       validate(value){
            if(!validator.isEmail(value)){
                throw new Error('email must be a valid email')
            }
        },
    },
    age:{
        type:Number,
        default:0,
        validate(value)
        {
            if(value<0){

                throw new Error('age must be a positive number')
            
            }
        }
    },

    password:{
        type:String,
        required:true,
        trim:true,
        minlength:7,
        validate(value){
            
            if(value.toLowerCase().includes('password')){

                throw new Error('password should not contain password')
            }
        }
    },
    tokens:[{
        token:{
            type:String,
            required:true
        }
    }],
    avatar:{
        type:Buffer
    }

},{
    timestamps:true
})

userSchema.virtual('tasks',{
    ref:'Task',
    localField:'_id',
    foreignField:'owner'
});

userSchema.methods.toJSON= function (){
    
    const userObject=this.toObject();
    
    delete userObject.password;
    delete userObject.tokens;
    delete userObject.avatar;

    return userObject;
};

userSchema.methods.generateAuthToken=async function(){
    const user=this;
    const token=jwt.sign({_id:this.id.toString()},process.env.JWT_SECRET);
    this.tokens=this.tokens.concat({token});
    this.save();
    return token;
};

userSchema.statics.findByCerdentials=async (email,password) => {
    const user=await User.findOne({email});
   
    if(!user){
        throw new Error('unable to login');
    }

    const isMatch=await bcrypt.compare(password,user.password);
    
    if(!isMatch){
        throw new Error('unable to login1');
    }

    return user;

};

//hash plain text before saving
userSchema.pre('save',async function(next){
    const user=this;

    if(user.isModified('password')){
        user.password=await bcrypt.hash(user.password,8);
    }
    next();
});

// Delete user Tasks before remove
userSchema.pre('remove',async function(next){
    const user=this;
    await   Task.deleteMany({owner:this._id})
    next();
});


const User=mongoose.model('User',userSchema);

module.exports=User;
