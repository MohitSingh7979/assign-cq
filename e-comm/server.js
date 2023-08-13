const express = require('express');
const app = express();
const path = require('path');

const PORT = 3000

/* serve files */
function serveFile( addPath, filePath ){
  app.get(addPath, (require, response) => {
    response.sendFile(path.join(__dirname, filePath))
      })    
}

serveFile(   "*", "view/dashboard.html");

app.listen(PORT, () => {
  console.log(`server running at ${PORT}`);
})
