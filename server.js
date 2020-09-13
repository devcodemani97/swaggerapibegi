'use strict';

//mongoose file must be loaded before all other files in order to provide
// models to other modules
var express = require('express'),
    router = express.Router(),
    bodyParser = require('body-parser'),
    swaggerUi = require('swagger-ui-express'),
    swaggerDocument = require('./swagger.json');

var getIP = require('ipware')().get_ip;

var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

mongoose.connect('mongodb://localhost:27017/swagger-demo',
    {
        useNewUrlParser: true,
        useUnifiedTopology: true
    });

var employeeSchema = new Schema({
    contactno: {
        type: String, required: true,
        trim: true, unique: true
    },
    name: { type: String, required: true, },
    address: { type: String },
    qualification: { type: String }
});

mongoose.model('employee', employeeSchema);
var employee = require('mongoose').model('employee');

var app = express();

//rest API requirements
app.use(bodyParser.urlencoded({
    extended: true
}));
app.use(bodyParser.json());

//middleware for create
var createemployee = function (req, res, next) {
    var employees = new employee(req.body);

    employees.save(function (err) {
        if (err) {
            next(err);
        } else {
            res.json({ id: employees._id });
        }
    });
};
var getOneemployee = function (req, res) {
    res.json(req.employee);
};

var getByIdemployee = function (req, res, next, id) {

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

app.listen(3000);
module.exports = app;
