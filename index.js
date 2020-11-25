const express = require('express');
require('dotenv').config();
const PORT = process.env.PORT || 3000;
const bodyParser = require('body-parser');
const axios = require('axios');



const app = express();
app.use(bodyParser.json());
app.get('/', async (req, res) => {
    try{
        const message = req.body;
        const messageAsRequest = encodeURI(message.sentence);
        const options = {
            headers : {'Authorization' : `Bearer ${process.env.WIT_TOKEN}`}
        }
        const getWit = await axios.get(`https://api.wit.ai/message?v=20201015&q=${messageAsRequest}`, options);
        console.log(getWit.data);
        return res.send(getWit.data);
    }
    catch(error){  
        new Error("Error occured!");
    }
});

app.listen(PORT, () =>{
    console.log(`Running at port ${PORT}`);
});