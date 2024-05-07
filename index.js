const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const fs = require('fs');

app.use(express.static('public'));

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/public/introductionPage.html');
});

app.listen(8080, () => {
    console.log('Server is running on port 8080');
});
