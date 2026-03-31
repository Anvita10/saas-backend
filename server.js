const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");

const app = express();
const port = 5000;

mongoose
  .connect(
    "mongodb+srv://csaifw21006:Csaifw21006%40@cluster0.pkftbsg.mongodb.net/taskDB?appName=Cluster0",
  )
  .then(() => console.log("DB CONNECTED"))
  .catch((err) => console.log(err));

const mockSuggestion = [
  "Learn React deeply",
  "Build a portfolio project",
  "Practice DSA for 1 hour",
  "Revise JavaScript concepts",
  "Work on system design basics",
];

app.use(cors());
app.use(express.json());

app.use("/tasks", require("./src/routes/taskRoute"));

app.use((err, req, res, next) => {
  console.log(err);

  res.status(err.status || 500).json({
    success: false,
    message: err.message || "something went wrong",
  });
});
app.listen(port, () => console.log("App is listening "));
