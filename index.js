const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const fs = require('fs');

// specifying the static files directory
app.use(express.static('public'));

// handling get request for browser
app.get('/', (req, res) => {
    res.sendFile(__dirname + '/public/introductionPage.html');
});

app.get('/aboutPage', (req, res) => {
    res.sendFile(__dirname + '/public/aboutPage.html');
});

app.get('/quiz', (req, res) => {
    res.sendFile(__dirname + '/public/quizApplicationPage.html');
});

app.listen(8080, () => {
    console.log('Server is running on port 8080');
});
