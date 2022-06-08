const express =require('express');
const cors=require('cors');
const { MongoClient } = require('mongodb');
require('dotenv').config();

const app =express();
const port =5000;

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
        //get Api
        app.get('/courses',async (req, res)=>{
            const cursor=coursesCollection.find({});
            const courses=await cursor.toArray();
            res.send(courses);
        })

        //post Api
        app.post('/courses', async(req,res)=>{
            const course=req.body;
           console.log('hitting the apppppiiiiii',course);

            const result =await coursesCollection.insertOne(course);
            console.log(result);
            res.json(result);
        })
    }
    finally{
        //await client.close();
    }
    try{
        await client.connect();
        const database =client.db('onlineEducation');
        const teachersCollection=database.collection('teachers');
        //get Api
        app.get('/teachers',async (req, res)=>{
            const purser=teachersCollection.find({});
            const teachers=await purser.toArray();
            res.send(teachers);
        })

        //post Api
        app.post('/teachers', async(req,res)=>{
            const teacher=req.body;
           console.log('hitting the teacher',teacher);

            const total =await teachersCollection.insertOne(teacher);
            console.log(total);
            res.json(result);
        })
    }
    finally{
        //await client.close();
    }
}
run().catch(console.dir);

app.get("/",(req,res)=> {
    res.send('hello from my ssss!')
});



app.listen(port,()=>{
    console.log('listening to port',port)
})