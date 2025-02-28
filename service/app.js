const express = require('express');
const fs = require('fs');
const path = require('path');
const bodyParser = require('body-parser');
const userApi = require('./api/userApi');

const app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// 使用userApi路由
app.use('/api/user', userApi);

app.listen(3000, () => {
    console.log('Server is running on port 3000');
});
