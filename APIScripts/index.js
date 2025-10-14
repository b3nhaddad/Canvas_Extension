require('dotenv').config(); //Loads environment variables from a .env file into process.env object to store sensitive api keys
const express = require('express'); //Imports Express framework for building web applications
const {google} = require('googleapis'); //Google APIS client lib.
const fs = require('fs'); //File system module to read/write token data
const app = express(); //Init. Express app
const calendarReader = require('./utils/calendarReader.js');


const oauth2Client = new google.auth.OAuth2(process.env.CLIENT_ID, process.env.SECRET_ID, process.env.REDIRECT); //Object to allow this application to obtain user consent and access Google APIs on their behalf

app.get('/', (req, res) => {
    const url = oauth2Client.generateAuthUrl({
        access_type: 'offline', //allows the app to access the API even after initial token has expired
        prompt: 'consent',  //force refresh_token on first auth
        scope: ['https://www.googleapis.com/auth/calendar'] //Scoped prompt access to just calendar
    });
    res.redirect(url);
});//User login prompt

app.get('/redirect',(req, res) => {
    const code = req.query.code;
    oauth2Client.getToken(code,(err,tokens)=>{
        if(err){
            console.error('cant find the fuckin token', err);
            res.send('Error');
            return;
        }
        oauth2Client.setCredentials(tokens);
        fs.writeFileSync('tokens.json', JSON.stringify(tokens, null, 2)); //store tokens in a json file
        res.send('Success BITCHES');
    })
})//switches users from temp token to real token before storing said real token in a JSON file


const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server listening on http://localhost:${PORT}`));
console.log(process.env.CANVAS_TOKEN);

app.get('/test-canvas', async(req,res)=>{ 
    try{
        const events = await calendarReader.getCanvasEvents();
        res.json(events);

    } catch (e) {
        res.status(500).send('Error: '+e.message);
    }
}); //use this to check and see the calendar is being pulled correctly