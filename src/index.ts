import express from "express";
const app = express();
app.use(express.json());
const PORT = process.env.PORT || 8000;
app.post('/devicereport', (req, res)=>{
    
    console.log(`devicereport: client='${req.headers["auth_shome"]}'; body='${JSON.stringify(req.body)}'`);
    return res.status(200).json({
        device: "OK"
    });
}); 

app.post('/initcontroller', (req, res)=>{
    console.log(`controller settings: client='${req.headers["auth_shome"]}'; body='${JSON.stringify(req.body)}'`);
    return res.status(200).json({
        controller: "OK"
    });
});

app.use((req, res, next) => {
    console.log(`Unknown command: '${req.originalUrl}'`);
    return res.status(404).json({});
})

app.listen(PORT, ()=>console.log(`Now listening on port ${PORT}`));