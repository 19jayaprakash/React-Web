const express = require('express');

const router = express.Router();

const app = express(); // it will create the express server
const connectDB = require('./config/db.config');

connectDB();
app.use(express.json());
app.use("/api/auth", require("./routers/auth"));
app.use("/api/users", require("./routers/users"));
app.use("/api/profile", require("./routers/profile"));
app.use("/api/posts", require("./routers/posts"));


app.get('/', (req, res) => {
    res.status(200).json({ msg: 'Hello world' });
});

app.listen(9000, () => {
    console.log('Server Started');
});