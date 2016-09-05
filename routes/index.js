'use strict'

const fs = require('fs');
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
    // when data cluster
    app.post('/data/cluster', data.cluster);

    // create tmp file
    app.post('/createFile', (req, res) => {
        const data = JSON.parse(req.body.data);
        const tmpPath = 'uploads/tmp.csv';

        let dataStr = '';
        let i = 0;
        let j = 0;
        for (i = 0; i < data.length; i++) {
            const item = data[i];
            for (j = 0; j < item.length - 1; j++) {
                dataStr += item[j] + ',';
            }
            dataStr += item[j] + '\n';
        }

        fs.writeFileSync(tmpPath, dataStr);
        res.json({success: true});
    });
};