'use strict'

const rio = require("rio");

/* get init data from R */
exports.init = (req, res) => {
    const filePath = req.body.path;
    const hasHeader = req.body.hasHeader;
    const colTypes = req.body.colTypes;
    const dataCase = req.body.dataCase;
    const dim = req.body.dim;

    // configs for rio process
    let config = {
        filename: 'RScripts/dataInitProcess.R',
        entrypoint: '',
        data: {
            path: [],
            hasHeader: [],
            dataCase: [],
            colTypes: []
        },

        host: '127.0.0.1',
        port: '6311',
        path: undefined,
        user: 'anon',
        password: 'anon'
    };

    // for different dim cases, call different R script
    switch (parseInt(dim)) {
        case 2:
            break;
        case 3:
            config.entrypoint = 'get3dData';
            //config.entrypoint = 'get3dInitData';
            config.data.path[0] = filePath;
            config.data.hasHeader[0] = hasHeader;
            config.data.dataCase[0] = dataCase;
            config.data.colTypes = colTypes;
            break;
        default:
            break;
    }

    // pass config to rio to do R process
    rio.$e(config)
    .then((val) => {
        return res.json(val);
    })
    .catch((err) => {
        console.log(err);
        return res.json(err);
    });
};

/* cluster data through R */
exports.cluster = (req, res) => {
    const dim = req.body.dim;
    const type = req.body.type;
    const param = req.body.param;

    // configs for rio process
    let config = {
        filename: 'RScripts/dataClusterProcess.R',
        entrypoint: '',
        data: {
            dim: [dim],
            param: []
        },

        host: '127.0.0.1',
        port: '6311',
        path: undefined,
        user: 'anon',
        password: 'anon'
    };

    switch (parseInt(type)) {
        case 1:
            // kmeans
            config.entrypoint = 'getKmeans';
            config.data.param = [param.k];
            break;
        case 2:
            // dbscan
            config.entrypoint = 'getDbscan';
            config.data.param = [param.eps, param.minpts];
            break;
        default:
            break;
    }

    // pass config to rio to do R process
    rio.$e(config)
    .then((val) => {
        return res.json(val);
    })
    .catch((err) => {
        console.log(err);
        return res.json(err);
    });
};