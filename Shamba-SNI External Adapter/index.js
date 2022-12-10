const express = require('express');
const app = express();

const createRequest = require('./app').createRequest
const cors = require('cors')
app.use(cors())
app.options('*', cors())

const PORT = 5555;


app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

app.get('/', (req, res) => {
    
    res.send('Shamba-SNI External Adapter is up and running. Please send POST request with category, geometry, start_date and end_date parameters.');

})

app.post('/', (req, res) => {
    if (typeof(req.body["data"]) == "string") {
        req.body["data"] = JSON.parse(req.body["data"]);
    }
    createRequest(req.body, (status, result) => {
        res.status(status).json(result)
    })
})

module.exports = {
    app
};