const express =require('express');
const cors=require('cors');
const { MongoClient } = require('mongodb');
const ObjectId=require('mongodb').ObjectId;
require('dotenv').config();

const app =express();
const port =process.env.PORT || 5000;

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
        const studentCollection=database.collection('students');

        //get  course Api
        app.get('/courses',async (req, res)=>{
            const cursor=coursesCollection.find({});
            const courses=await cursor.limit(100).toArray();
            res.send(courses);
        });
        //GET Single Course
        app.get('/courses/:id',async(req,res)=>{
            const id =req.params.id;
            const query ={_id: ObjectId(id)};
            const course=await coursesCollection.findOne(query);
            res.json(course);
        })

        //post course Api
        app.post('/courses', async(req,res)=>{
            const course=req.body;
           console.log('hitting the apppppiiiiii',course);

            const result =await coursesCollection.insertOne(course);
            console.log(result);
            res.json(result);
        });
        //delete course Api
        app.delete('/courses/:id',async (req,res)=>{
            const id=req.params.id;
            const query={_id:ObjectId(id)};
            const result=await coursesCollection.deleteOne(query);
            res.json(result);
        });
        //add students api
        
        app.post('/students',async (req,res)=>{
            const cursor=studentCollection.find({});
            const students=await cursor.limit(100).toArray();
            res.send(students);

            const studentInformation=req.body;
            console.log('hitting the students',studentInformation)
            const result=await studentCollection.insertOne(studentInformation);
            console.log(result);
            res.json(result);
        });
    }
    finally{
        //await client.close();
    }
    try{
        await client.connect();
        const database =client.db('onlineEducation');
        const teachersCollection=database.collection('teachers');
        //get teacher Api
        app.get('/teachers',async (req, res)=>{
            const purser=teachersCollection.find({});
            const teachers=await purser.limit(100).toArray();
            res.send(teachers);
        })

        //post teacher Api
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