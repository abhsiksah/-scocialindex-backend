const express = require("express");
const helmet = require("helmet");
const mongoose = require("mongoose");
const morgan = require("morgan");
const app = express();
const userRoute = require("./routes/users");
const authRoute = require("./routes/auth");
const postRoute = require("./routes/posts");
const cors = require("cors");
const port = process.env.PORT || 8001;
const path = require("path");

const connection_url =
  "mongodb+srv://DB_MAIN:1511Neymar!@cluster0.tkz3x.mongodb.net/SOCIALAPP_DB?retryWrites=true&w=majority";
// const connection_url = process.env.MONGO;

//Middlewares
app.use(express.static(path.join(__dirname, "client/build")));

app.use(express.json());
app.use(cors());
//its a body parser when you make post reuqest it will parser it

// Helmet helps you secure your Express apps by setting various HTTP headers. It's not a silver bullet, but it can help!
app.use(helmet());
//morgon will send you every details wrt all reuqest ie its info
app.use(morgan("common"));
//we have made a route to users where all our users will be routed
app.use("/api/users", userRoute);
app.use("/api/auth", authRoute);
app.use("/api/posts", postRoute);

app.get("*", function (req, res) {
  const index = path.join(__dirname, "client/build", "index.html");
  res.sendFile(index);
});

// mongo-DB config
mongoose.connect(
  connection_url,
  {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  },
  (e) => {
    console.log(mongoose.connection.readyState);
    console.log(e);
  }
);

// API endpoints
// app.get("/", (req, res) => {
//   res.status(200).send("Fuck u world");
// });

app.listen(port, () => {
  console.log("server running on port 8001");
});
