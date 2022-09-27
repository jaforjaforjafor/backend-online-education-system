const express =require('express');
const { MongoClient } = require('mongodb');
require('dotenv').config();
const cors=require('cors');

const ObjectId=require('mongodb').ObjectId;
const stripe=require('stripe')('sk_test_51Le6ClH6WcnbdNiBAlfi4mnwVPwDqU3pLhdQCaDFvfnLpNc9l7n4xxF1ZzFqfCEE3hPeKYQPR7qz1RuiYIW8wjwb00ee7UzlNr')


const app =express();
const port = process.env.PORT ||5000;
//firebase admin  initialize


//middleware
app.use (cors());
app.use(express.json());


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.fy5ly.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });





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
        
        app.post('/courses', async(req,res)=>{
            const course=req.body;
            course.createdAt=new Date();

           const result =await coursesCollection.insertOne(course);
            res.json(result);
        });
        //payment post
        app.post('/create-payment-intent',async(req,res)=>{
            const service=req.body;
            const price= service.price;
            const amount=price*100;
            const paymentIntent=await stripe.paymentIntent.create({
                amount: amount,
                currency:'usd',
                payment_method_types:['card']
            })
                res.send({clientSecret:paymentIntent.client_secret})


            
        })

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

        // getting manage all orders
        app.get('/manageAllOrders', async (req, res) => {
            const cursor = purchaseCollection.find({})
            const manageOrders = await cursor.toArray();
            res.send(manageOrders);
        });
        // delete all orders from admin
        app.delete('/manageAllOrders/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const result = await purchaseCollection.deleteOne(query);
            console.log('delete order with id', result);
            res.json(result);
        });
        // update order status
        app.put('/manageAllOrders/:id', async (req, res) => {
            const id = req.params.id;
            const updateStatus = req.body;
            const filter = { _id: ObjectId(id) };
            const options = { upsert: true };
            const updateDoc = { $set: { status: updateStatus.status } };
            const result = await purchaseCollection.updateOne(
                filter,
                updateDoc,
                options
            );
            res.json(result);
            console.log(result);
        });
        //manage Courses
        app.get('/manageCourses', async (req, res) => {
            const cursor = coursesCollection.find({});
            const services = await cursor.toArray();
            res.send(services);
        });
        app.delete('/manageCourses/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const result = await coursesCollection.deleteOne(query);
            console.log('delete order with id', result);
            res.json(result);
        });
        //manage teachers
        app.get('/manageTeachers', async (req, res) => {
            const cursor = teachersCollection.find({});
            const services = await cursor.toArray();
            res.send(services);
        });
        app.delete('/manageTeachers/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const result = await teachersCollection.deleteOne(query);
            console.log('delete order with id', result);
            res.json(result);
        });
        //user information show in admin panel ui
        app.get('/users') ,async(req,res)=>{
            const users=await usersCollection.find().toArray();
            res.send(users);
        }

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
        //get payment for purchase id
        app.get('/purchase/:id', async(req,res)=>{
            const id=req.params.id;
            const query={_id:ObjectId(id)};
            const result=await purchaseCollection.findOne(query);
            res.json(result);
        });

        //users admin
        app.put('/users/admin',  async(req,res)=>{
            const user=req.body;
            console.log('put',user);
            const filter={email:user.email};
            const updateDoc={$set: {role: 'admin'}};
            const result=await usersCollection.updateOne(filter,updateDoc);
            res.json(result);
                });
           
         // ratings user
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
    //DB_USER:backendServer
    //DB_PASS:SvWKeMOBbv2HPkWL
    

run().catch(console.dir);

app.get("/",(req,res)=> {
    res.send('hello from my backend server!')
});



app.listen(port,()=>{
    console.log(`listening to port ${port}`)
})