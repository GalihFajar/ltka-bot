const express = require('express');
require('dotenv').config();
const PORT = process.env.PORT || 3000;
const bodyParser = require('body-parser');
const axios = require('axios');



const app = express();


const main = async(request) =>{
    try {
        const witResponse = await wit(request);
        const {intents, entities} = witResponse;
        const intentNames = [];
        const entityRoles = [];
        const entityValues = [];
        var message = "";
        intents.forEach((intent) => {
            intentNames.push(intent.name)
        });
        for(const property in entities){
            console.log(entities[property][0].value);
            entityRoles.push(entities[property][0].role);
            entityValues.push(entities[property][0].value);
        }

        if(entityRoles[0] === 'wikipedia_search_query'){
            message = await wiki(entityValues[0]);
        }
        if(entityRoles[0] === 'xkcd_comic'){
            message = await xkcd();
        }
        const response = {
            message : message
        };
        console.log(response);
        return response
    } catch (error) {
        return new Error(error);
    }
}

const wit = async(message) =>{
    try {
        const messageAsRequest = encodeURI(message);
        const options = {
            headers : {'Authorization' : `Bearer ${process.env.WIT_TOKEN}`}
        }
        const getWit = await axios.get(`https://api.wit.ai/message?v=20201015&q=${messageAsRequest}`, options);
        return getWit.data;
    } catch (error) {
        return new Error(error);
    }
}

const xkcd = async() => {
    const randomNumber = Math.floor((Math.random() * 2000) + 1);
    const xkcdjson = await axios.get(`http://xkcd.com/${randomNumber}/info.0.json`);
    const xkcdurl = xkcdjson.data.img;
    return xkcdurl;
}

const wiki = async (searchQuery) =>{
    try{
        const searchQueryAsRequest = encodeURI(searchQuery);
        const queryResult = await axios.get(`https://en.wikipedia.org/w/api.php?action=opensearch&search=${searchQueryAsRequest}&type=json&limit=5`);
        const result = queryResult.data;
        if(result[1] === undefined || result[1].length == 0) return "Sorry, I don't know.";
        const resultObject  = {
            query : result[0],
            resultTitles: result[1],
            resultLinks: result[3]
        }
        var addedMessage = "\n\nAnother results:";
        resultObject.resultLinks.forEach((resultLink, index) => {
            if(index !== 0){
            var temp = `\n${resultObject.resultTitles[index]} : ${resultLink}`;
            addedMessage = addedMessage + temp;}
        });
        var message = `Here is the top result:\n${resultObject.resultTitles[0]} : ${resultObject.resultLinks[0]}`;
        message = message + addedMessage;
        return message;
    }catch(err){
        return new Error(err);
    }
}

app.use(bodyParser.json());
app.get('/', async (req, res) => {
    try{
        const message = req.body.sentence;
        const returnedValue = await main(message);
        const returnJson = JSON.stringify(returnedValue);
        return res.send(returnJson);
    }
    catch(error){  
        new Error("Error occured!");
    }
});

app.listen(PORT, () =>{
    console.log(`Running at port ${PORT}`);
});