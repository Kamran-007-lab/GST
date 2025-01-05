import express from "express"
import cors from "cors"
import cookieParser from "cookie-parser"
import bodyParser from "body-parser"

const app = express()

app.use(cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true
}))

app.use(express.json({limit: "16kb"}))
app.use(express.urlencoded({extended: true,limit: "16kb"}))
app.use(express.static("public"))
app.use(cookieParser())
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));


//routes import
import userRouter from "./routes/user.routes.js"
import bookingRouter from "./routes/booking.routes.js"
//routes declaraton
app.use("/api/v1/users",userRouter)
app.use("/api/v1/bookings", bookingRouter);

export default app