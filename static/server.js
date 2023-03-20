const express = require("express");
const path = require("path");
const app = express();
const cors = require("cors");
var bodyParser = require("body-parser");
port = 80;
app.use(express.static(path.join(__dirname, "./")));

app.use(cors());

app.use(
  bodyParser.json({
    limit: "50mb",
  })
);

app.use(
  bodyParser.urlencoded({
    limit: "50mb",
    parameterLimit: 100000,
    extended: true,
  })
);

//------------------------------------------------------------
//    WEB server
//------------------------------------------------------------

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "./index.html"));
});

app.listen(port, () => {
  console.log(`Server listening on the port::${port}`);
});
