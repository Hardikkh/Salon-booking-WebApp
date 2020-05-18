var express = require("express"),
    app = express(),
    bodyParser = require("body-parser"),
    mongoose = require("mongoose");
    
app.use(express.static('public'));
app.set("view engine","ejs");
app.use(bodyParser.urlencoded({extended:true}));
mongoose.connect("mongodb+srv://hardik99:messi99@cluster0-gayba.mongodb.net/test?retryWrites=true&w=majority",{useNewUrlParser:true,useUnifiedTopology: true});

var DTschema = new mongoose.Schema({
    datetime : Date,
    count : Number
});
var DTBooking = mongoose.model("DateTimeBooking",DTschema);

var mobileSchema = new mongoose.Schema({
    mobile : Number,
    name : String,
    datetime : Date
});
var MobileBooking = mongoose.model("MobileBooking",mobileSchema);


app.get("/",function(req,res){
    res.render("landing",{status : 1});
});

app.get("/allbookings",function(req,res){
    MobileBooking.find().sort('-date').exec(function(err, collectedItems){
        if(err){
            console.log(err);
            
        }else{
            res.render("allBookings",{items:collectedItems});
        }
    });
})

app.post("/book",function(req,res){
    var name = req.body.name;
    var mobile = req.body.mobile;
    var date = req.body.date;
    var time = req.body.time;
    var combined = new Date(date+"T"+time+":00Z");
    if(combined.getDay()==0 || combined.getDay()==6){
        res.render("landing",{status:4});
    }else{
        MobileBooking.findOne({mobile:mobile},function(err,result){
            if(err){
                console.log(err);
            }
            else{
                if(result==null){
                    DTBooking.findOne({datetime:combined},function(err,result){
                        if(err){
                            console.log(err);
                        }else{
                            if(result!=null){
                                if(result.count==3){
                                    res.render("landing",{status : 2});
                                }else{
                                    result.count += 1;
                                    result.save();
                                    MobileBooking.create({mobile:mobile,name:name,datetime:combined});
                                    res.render("booked",{date:combined,time:time,name:name});
                                }
                            }else{
                                DTBooking.create({datetime:combined,count:1},function(err,book){
                                    if(err){
                                        console.log(err);
                                    }else{
                                        MobileBooking.create({mobile:mobile,name:name,datetime:combined});
                                        res.render("booked",{date:combined,time:time,name:name});
                                    }
                                });
                            }
                        }
                    });
                }else{
                    res.render("landing",{status : 3});
                }
            }
        });
    }
});
app.get("/cancel",function(req,res){
   res.render("cancel",{status:1});
});

app.post("/cancel",function(req,res){
    MobileBooking.findOneAndRemove({mobile:req.body.mobile , name:req.body.name},function(err,result){
        if(err){
            console.log(err);
        }else{
            if(result==null){
                res.render("cancel",{status : 2});
            }else{
                DTBooking.findOne({datetime:result.datetime},function(err,resultDT){
                    if(err){
                        console.log(err);
                    }else{
                        if(resultDT.count==1){
                            DTBooking.findOneAndRemove({datetime:resultDT.datetime},function(err,res){
                                if(err){
                                    console.log(err);
                                }
                            });
                        }else{
                            resultDT.count -= 1;
                            resultDT.save();
                        }
                    }
                    res.render("cancel",{status : 3});
                });
            }
        }
    });
});

app.listen(process.env.PORT,process.env.IP);