const express = require('express');
const app = express();
const http = require('http').Server(app);
const io = require('socket.io')(http);
const bodyParser = require('body-parser');
const fs = require('fs');
const { count } = require('console');
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
    let count = 0;
    console.log("A client has connected");
    socket.on('disconnect', ()=> {
        console.log('A client has disconnected');
    });

    socket.on('startQuiz', (name) => {
        console.log(`${name} has started the quiz.`);
        let startTime = Date.now();
        socket.on('questionNeeded', (idx) => {
            fs.readFile('questionsForQuickTesting.json', 'utf8', (err, data) => {
                if (err) {
                    console.log(err);
                } else {
                    const questionFile = JSON.parse(data);
                    if (idx === questionFile.questions.length) {
                        socket.emit('quizEnded', {count: count, total: questionFile.questions.length});
                        let endTime = Date.now();
                        let timeCost = endTime - startTime;
                        fs.readFile('ranking.json', 'utf8', (err, data) => {
                            if (err) {
                                console.log(err);
                            } else {
                                let ranking = JSON.parse(data);
                                const user = {"name": name, "count": count, "time": timeCost};
                                ranking.users.push(user);
                                // update the users file
                                fs.writeFile('ranking.json', JSON.stringify(ranking, null, 2), (err) => {
                                    if (err) {
                                        console.log(err);
                                    } else {
                                         console.log(`${name} took ${timeCost}s to finish to quiz, ${count} right answers out of ${questionFile.questions.length}`)
                                    }
                                });
                                // sort the users file on their correct answers and time cost
                                ranking.users.sort((userA, userB) => {
                                    if (userA.count === userB.count) {
                                        return userA.time - userB.time;
                                    } else {
                                        return userB.count - userA.count;
                                    }
                                });
                                // emit the leaderboard to the client
                                let j;
                                j = ranking.users.length < 3 ? ranking.users.length-1 : 2;
                                var leaders = [];
                                for (let i=0; i<=j; i++) {
                                    leaders.push(ranking.users[i]);
                                }
                                socket.emit('leaderBoard', leaders);
                            }
                        })
                        return;
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
                    count += 1;
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
