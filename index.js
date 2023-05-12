var express = require('express');
var app = express();
app.use(express.json());
const PORT = process.env.PORT || 8000;
app.post('/', (req, res)=>{
    
    console.log(`request: ${JSON.stringify(req.body)}`);
    return res.status(200).json({
        test: "test"
    });
}); 

app.listen(PORT, ()=>console.log(`Now listening on port ${PORT}`));