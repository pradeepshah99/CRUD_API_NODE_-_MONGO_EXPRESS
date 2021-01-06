var mongoose = require('mongoose');
var bcrypt = require('bcrypt');


let schema = mongoose.Schema;

let user = new schema(
    {
        firstName : {type:String},
        lastName : {type:String},
        email: {type:String},
        password : {type:String},
        adhar: {type: String},
        mobile : {type:String},
        address1 : {type:String},
        address2 : {type:String},
        inserted : {type : Date},
       
       


    },
    {
        collection: "user"
    }
    );

    user.pre('save', async function(next){
        try{
            //console.log("this is called");
            const salt = await bcrypt.genSalt(10);
            const hasedPassword = await bcrypt.hash(this.password, salt);
            this.password = hasedPassword;
            
            next();
        }
        catch(error){
            next(error);
        }
    });


    user.pre('save', async function(next){
        try{
            //console.log("this is called");
            const salt = await bcrypt.genSalt(10);
            const hasedadhar = await bcrypt.hash(this.adhar, salt);
            this.adhar = hasedadhar;
            const hasedmobile = await bcrypt.hash(this.mobile, salt);
            this.mobile = hasedmobile;
            next();
        }
        catch(error){
            next(error);
        }
    });

    user.methods.isValid = function(hashedpassword){
        return  bcrypt.compareSync(hashedpassword, this.password);
    }
    mongoose.set('useFindAndModify',false);

    module.exports = mongoose.model('user', user);
