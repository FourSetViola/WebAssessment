const express = require('express');
const app = express();
const http = require('http').Server(app);
const io = require('socket.io')(http);
const bodyParser = require('body-parser');
const fs = require('fs');
const port = 8080;

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

io.on('connection', (socket) => {
    console.log("A client has connected");
    socket.on('disconnect', ()=> {
        console.log('A client has disconnected');
    });

    socket.on('startQuiz', (name) => {
        console.log(`${name} has started the quiz.`);
        socket.on('questionNeeded', (idx) => {
            fs.readFile('questions.json', 'utf8', (err, data) => {
                if (err) {
                    console.log(err);
                } else {
                    const questionFile = JSON.parse(data);
                    if (idx >= questionFile.questions.length) {
                        socket.emit('quizEnded');
                    } else {
                        socket.emit('questionSent', {
                        question: questionFile.questions[idx].question,
                        options: questionFile.questions[idx].options.map(option => ({choice: option.choice, answer: option.answer}))
                        });
                    }
                }
            });
        });
    });
    // handling the answer from the client
    socket.on('answerSubmitted', (answer) => {
        fs.readFile('questions.json', 'utf8', (err, fileData) => {
            console.log(answer);
            if (err) {
                console.log(err);
            } else {
                const questionFile = JSON.parse(fileData);
                let verified;
                if (questionFile.questions[answer.idx].solution === answer.choice) {
                    verified = true;
                } else {
                    verified = false;
                }
                socket.emit('answerVerified', verified);
            }
        });
    });
});

http.listen(port, () => {
    console.log('Server is running on port', port);
});
