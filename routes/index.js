'use strict'

const multer  = require('multer');
const upload = multer({ dest: 'uploads/' });
const data = require('./data');

module.exports = (app) => {
    app.get('/', (req, res) => {
        res.send('This is the root route.');
    });

    // upload file
    app.post('/upload', upload.single('btnFileUpload'), (req, res) => {
        console.log('The file was uploaded successfully in ' + req.file.path);
        res.send('<script>window.parent.uploadResult(\"' + req.file.path + '\");</script>');
    });

    // when first load the data
    app.post('/data/init', data.init);
};