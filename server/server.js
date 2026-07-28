import dotenv from 'dotenv';
dotenv.config();
import express from 'express';
import { connectDB } from './db/connection1.db.js';
connectDB();
const app = express();

app.use(express.json());

const PORT = process.env.PORT|| 5000;
// console.log(PORT)

// routes
import userRoute from './routes/user.route.js'
app.use('/api/v1/user',userRoute) 

// middleware
import { errorMiddleware } from './middlewares/error.middleware.js';
app.use(errorMiddleware); 

app.listen(PORT, () => {
  console.log(`Your server listening on port ${PORT}`)
})