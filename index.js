var express = require('express');
var app = express();
const PORT = process.env.PORT || 8000;
app.get('/', (req, res)=>{
    console.log(`request: ${req.originalUrl}`);
    return res.status(200).json({
        test: "test"
    });
}); 

app.listen(PORT, ()=>console.log(`Now listening on port ${PORT}`));