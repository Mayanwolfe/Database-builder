const express = require('express')
const app = express()
const MongoClient = require('mongodb').MongoClient
const PORT = 8000
require('dotenv').config()


let db,
    dbConnectionStr = process.env.DB_STRING,
    dbName = 'star-trek-api'

MongoClient.connect(dbConnectionStr, { useUnifiedTopology: true })
    .then(client => {
        console.log(`Connected to ${dbName} Database`)
        db = client.db(dbName)
    })
    
app.set('view engine', 'ejs')
app.use(express.static('public'))
app.use(express.urlencoded({ extended: true }))
app.use(express.json())

// app.use("/", (req, res) => {
//     res.sendFile(__dirname + "/index.html");
//    });

app.get('/',(request, response)=>{
    db.collection('alien-info').find().toArray()
    .then(data => {
        let nameList = data.map(a => a.speciesName)
        console.log(nameList)
        response.render('index.ejs', { info: nameList })
    })
    .catch(error => console.error(error))
})

app.post('/api', (req,res) => {
    console.log('post heard')
    db.collection('alien-info').insertOne(
        req.body
    )
    .then(result => {
        console.log(result)
        res.redirect('/')
    })
    .catch(error => console.error(error))
})

//DOES NOT FUNCTION YET
app.post('/massinsert', (req,res) => {
    //const test = JSON.parse(req.body)
    //console.log(test)
    db.collection('alien-info').insertMany(
        [{name: 'test',speciesName: 'test',features: 'test',homeworld: 'test',image: 'test',interestingFact: 'test',notableExamples: 'test'},{name: 'test2',speciesName: 'test2',features: 'test2',homeworld: 'test2',image: 'test2',interestingFact: 'test2',notableExamples: 'test2'}]
    )
    .then(result => {
        console.log(result)
        res.redirect('/')
    })
    .catch(error => console.error(error))
})

app.put('/updateEntry', (req,res) => {
    console.log(req.body)
    Object.keys(req.body).forEach(key => {
        if (req.body[key] === null || req.body[key] === undefined || req.body[key] === '') {
          delete req.body[key];
        }
      });
    console.log(req.body)
    db.collection('alien-info').findOneAndUpdate(
        {name: req.body.name},
        {
            $set:  req.body  
        },
        // {
        //     upsert: true
        // }
    )
    .then(result => {
        console.log(result)
        res.json('Success')
    })
    .catch(error => console.error(error))
})

app.delete('/deleteEntry', (request, response) => {
    db.collection('alien-info').deleteOne({name: request.body.name})
    .then(result => {
        console.log('Entry Deleted')
        response.json('Entry Deleted')
    })
    .catch(error => console.error(error))
})

app.listen(process.env.PORT || PORT, ()=>{
    console.log(`Server running on port ${PORT}`)
})