const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const authRoutes = require('./routes/authRoutes');
const registerRoutes = require('./routes/registerRoutes');
const userRoutes = require('./routes/userRoutes');
const roomRoutes = require('./routes/roomRoutes');
const paymentRoutes = require('./routes/paymentRoutes');
require('./utils/cleanupUtils');

const app = express();
app.use(cors());
app.use(express.json());

const port = 3001;
mongoose.connect('mongodb://127.0.0.1/case_study1_db')
    .then(db => app.listen(port, () => { console.log(`DB is connected. Listening on port ${port}`) }))
    .catch(err => console.log(err))

app.use(authRoutes);
app.use(registerRoutes);
app.use(userRoutes);
app.use(roomRoutes);
app.use(paymentRoutes);
