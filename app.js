import express from 'express';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import connectDB from './database/connectDB.js';

const app = express();


app.use(cookieParser());
app.use(cors({
    credentials: true,
    origin: 'http://localhost:3000'
}));

app.use(express.json());
app.use(express.urlencoded({extended: true}));






connectDB()
.then(() => {
    app.listen(process.env.PORT, () => {
        console.log(`Server is listening on http://localhost:${process.env.PORT}`);
    });
}).catch(error => {
    console.log('Error connecting to Database', error);
});

