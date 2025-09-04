const express = require("express");
const cors = require("cors");
const questionRouter = require("./Router/questionRouter");
const fileRouter = require("./Router/fileRouter");

const app = express();

app.use(cors({
  origin: "http://localhost:5173",  // frontend URL
  methods: ["GET", "POST"],         // allowed methods
  credentials: true                 // if you need cookies/auth
}));


app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Test route
app.get("/", (req, res) => {
  res.json({ status: 200, message: "backend-ai running successfully" });
});

app.use('/question', questionRouter)
app.use('/file', fileRouter)

app.listen(8090, () => {
  console.log("server runs at port 8090");
});