let express = require('express'),
    router = express.Router(),
    bodyParser = require('body-parser'),
    swaggerUi = require('swagger-ui-express'),
    swaggerDocument = require('./swagger.json');

let getIP = require('ipware')().get_ip;

let mongoose = require('mongoose'),
    Schema = mongoose.Schema;
    var crypto = require('crypto');
mongoose.connect('mongodb://localhost:27017/swagger-demo',
    {
        useNewUrlParser: true,
        useUnifiedTopology: true
    });

let employeeSchema = new Schema({
    contactno: {
        type: String, required: true,
        trim: true, unique: true
    },
    name: { type: String, required: true, },
    address: { type: String },
    qualification: { type: String }
});

mongoose.model('employee', employeeSchema);
let employee = require('mongoose').model('employee');

let app = express();

//rest API requirements
app.use(bodyParser.urlencoded({
    extended: true
}));
app.use(bodyParser.json());

var generate_key = function() {
    return crypto.randomBytes(16).toString('base64');
};
//middleware for create
let createemployee = function (req, res, next) {
    let ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
    res.setHeader('ip_address', ip);
    res.setHeader('session_id', generate_key())
    let employees = new employee(req.body);
    employees.save(function (err) {
        if (err) {
            next(err);
        } else {
            res.json({ id: employees._id });
        }
    });
};
let getOneemployee = function (req, res) {
    res.json(req.employee);
};

let getByIdemployee = function (req, res, next, id) {
    let ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
    res.setHeader('ip_address', ip);
    res.setHeader('session_id', generate_key())
    employee.findOne({ _id: id }, function (err, employee) {
        if (err) {
            next(err);
        } else {
            req.employee = employee;
            next();
        }
    });
};

router.route('/employee')
    .post(createemployee)

router.route('/employee/:employeeId')
    .get(getOneemployee)

router.param('employeeId', getByIdemployee);


app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));
app.use('/api/v1', router);

app.listen(3000,function(){
    console.log('server is running in 3000 port')
    console.log(`For swagger ui use this link http://localhost:3000/api-doc`)
});
module.exports = app;
