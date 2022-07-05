const express =require('express');
const cors=require('cors');
const { MongoClient } = require('mongodb');
const ObjectId=require('mongodb').ObjectId;
const admin = require("firebase-admin");
require('dotenv').config();

const app =express();
const port = process.env.PORT ||5000;
//firebase admin  initialize
const serviceAccount = require('./online-education-system-firebase-adminsdk.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

//middleware
app.use (cors());
app.use(express.json());


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.fy5ly.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });


async function verifyToken(req,res,next){
    if(req.headers?.authorization?.startsWith(' Bearer')){
        const token=req.headers.authorization.split('')[1];
        try{
            const decodedUser=await admin.auth().verifyIdToken(token);
            req.decodedEmail=decodedUser.email;
        }
        catch{

        }
    }

    next();
}





async function run(){
    try{
        await client.connect();
        
        const database =client.db('onlineEducation');
        const coursesCollection=database.collection('courses');
        const teachersCollection=database.collection('teachers');
        const purchaseCollection=database.collection('purchase');
        const usersCollection=database.collection('users');

        const ratingCollection = database.collection('ratings');

        app.post('/courses', async(req,res)=>{
            const course=req.body;
            course.createdAt=new Date();

           const result =await coursesCollection.insertOne(course);
            res.json(result);
        });

        
        //get  course Api
        app.get('/courses',  async (req, res)=>{
            const email=req.query.email;
             const query={email:email};
                const cursor=coursesCollection.find(query);
            const courses=await cursor.toArray();
            res.send(courses);
            
            
            
        });
        //GET Single Course
        // app.get('/courses/:id',async(req,res)=>{
        //     const id =req.params.id;
        //     const query ={_id: ObjectId(id)};
        //     const course=await coursesCollection.findOne(query);
        //     res.json(course);
        // });

        app.post('/courses', async(req,res)=>{
            const course=req.body;
            course.createdAt=new Date();

           const result =await coursesCollection.insertOne(course);
            res.json(result);
        });

        //delete course Api
        
        
        // get teacher api
        app.get('/teachers',async (req, res)=>{
            const purser=teachersCollection.find({});
            const teachers=await purser.limit(100).toArray();
            res.send(teachers);
        });
        //post teacher Api
        app.post('/teachers', async(req,res)=>{
            const teacher=req.body;
            teacher.createdAt=new Date();
           console.log('hitting the teacher',teacher);

            const total =await teachersCollection.insertOne(teacher);
            console.log(total);
            res.json(total);
        });
        
        //get my course Api
        // app.get('/myCourses',async (req, res)=>{
        //     const purser=myCourseCollection.find({});
        //     const myCourse=await purser.limit(100).toArray();
        //     res.send(myCourse);
        // });
        // //post my course Api
        // app.post('/myCourses', async(req,res)=>{
        //     const myCourse=req.body;
        //     myCourse.createdAt=new Date();
        //    console.log('hitting the My cOurse',myCourse);

        //     const total =await myCourseCollection.insertOne(myCourse);
        //     console.log(total);
        //     res.json(total);
        // });
        
         //Add purchase API
         app.post('/purchase', async (req, res) => {
            const purchase = req.body;
            const result = await purchaseCollection.insertOne(purchase)
            res.send(result);
        });
         // getpurchase api
         app.get('/purchase', async (req, res) => {
            const email = req.query.email;
            const query = { email: email }
            const cursor = purchaseCollection.find(query)
            const result = await cursor.toArray();
            res.send(result);
        });
        //delete my course from client side and mongo db side 
        app.delete('/purchase/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const result = await purchaseCollection.deleteOne(query);
            console.log('delete purchase with id', result);
            res.json(result);
        });

        //post users api

        //users role  to amdin and user can not be admin
        app.get('/users/:email',async (req,res)=>{
            const email=req.params.email;
            const query={email:email};
            const user=await usersCollection.findOne(query);
            let isAdmin=false;
            if(user?.role ==='admin'){
                isAdmin=true;
            }
            res.json({admin: isAdmin});
        });
        
        app.post('/users', async(req,res)=>{
            const user=req.body;
            user.createdAt=new Date();
           console.log('hitting the user',user);

            const userTotal =await usersCollection.insertOne(user);
            console.log(userTotal);
            res.json(userTotal);
            //get users
            app.get('/users', async (req, res) => {
                const cursor = usersCollection.find({});
                const users = await cursor.toArray();
                res.send(users);
            })
        });
        //if user is login in google signin button,for update all time
        app.put('/users',async (req,res)=>{
            const user=req.body;
            const filter={email:user.email};
            const options = { upsert: true };
            const updateDoc = {$set: user};
            const result= await usersCollection.updateOne(filter,updateDoc,options);
            res.json(result);
              

        });
        //users admin
        app.put('/users/admin', verifyToken, async(req,res)=>{
            const user=req.body;
            const requester=req.decodedEmail;
            if(requester){
                const requesterAccount= await usersCollection.findOne({email:requester});
                if(requesterAccount.role === 'admin'){
                    const filter={email:user.email};
            const updateDoc={$set: {role: 'admin'}};
            const result=await usersCollection.updateOne(filter,updateDoc);
            res.json(result);
                }
            }
            else {
                json({message:'you dont have access to made admin'})
            }
            
            
            
        
        });
         // ratings
         app.post('/ratings', async (req, res) => {
            const rating = req.body;
            const result = await ratingCollection.insertOne(rating);
            res.json(result);
        });


        // get ratings
        app.get('/ratings', async (req, res) => {
            const cursor = ratingCollection.find({});
            const ratings = await cursor.toArray();
            res.send(ratings);
        });
        

        
        
        
    }
    finally{
        //await client.close();
    }
        
        
       

        
    }
    

run().catch(console.dir);

app.get("/",(req,res)=> {
    res.send('hello from my backend server!')
});



app.listen(port,()=>{
    console.log(`listening to port ${port}`)
})