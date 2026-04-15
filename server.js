const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
require("dotenv").config();

const app = express();

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("DB CONNECTED"))
  .catch((err) => console.log(err));

app.use(cors());
app.use(express.json());

app.use("", require("./src/routes/taskRoute"));
app.use("", require("./src/routes/authRoute"));
app.use("/workspaces", require("./src/routes/workspaceRoute"));
app.use("/ai-suggest", require("./src/routes/aiSuggestRoutes"));

app.use((err, req, res, next) => {
  console.log(err);

  res.status(err.status || 500).json({
    success: false,
    message: err.message || "something went wrong",
  });
});
app.listen(process.env.PORT, () => console.log("App is listening "));
