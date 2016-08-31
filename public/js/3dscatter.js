// origin data includes col1.factor, col2.factor, col3.factor, col1.text, col2.text, col3.text
// for digit columns, the values of factor and text are same
// col1: x, col2: y, col3: z
var originData = [];
// 3d scatter data inclues col1.factor, col2,factor, col3.factor
var scatter3dData = [];
// 2d scatter data used for 2d visulation section
// the first and second columns are for generating a chart, other columns are for tmp use
var scatter2dData = [];

// 3d and 2d charts
var chart3d = null;
var chart2d = null;

// all the cases that this page can handle
var DATA_CASES = {
    DIGITAL_THREE_TEXT_ZERO: 0, // no axis can be interacted
    DIGITAL_TWO_TEXT_ONE: 1,    // x axis can be interacted
    DIGITAL_ONE_TEXT_TW0: 2,    // x and z axises can be interacted
    DIGITAL_ZERO_TEXT_THREE: 3  // all axises can be interacted
};
var dataCase = 0;
// all the cases when 3d change to 2d
var TYPE_OF_2D = {
    BASE_X: 0,          // base on the specific x value and use y and z axises to generate the 2d scatter
    BASE_Y: 1,          // base on the specific y value and use x and z axises to generate the 2d scatter
    BASE_Z: 2,          // base on the specific z value and use x and y axises to generate the 2d scatter
    BASE_MERGE_X: 3,    // merge the values on x axises and use y and z axises to generate the 2d scatter
    BASE_MERGE_Y: 4,    // merge the values on y axises and ues x and z axises to generate the 2d scatter
    BASE_MERGE_Z: 5     // merge the values on z axises and use x and y axises to generate the 2d scatter
};

// chart options define the properties of x, y, z axises
var chartOptions = {
    count: 0,
    zone: 0,
    x: {
        min: 0,
        max: 0,
        length: 0,
        title: ''
    },
    y: {
        min: 0,
        max: 0,
        length: 0,
        title: ''
    },
    z: {
        min: 0,
        max: 0,
        length: 0,
        title: ''
    }
};

// selected points
var selected3dPoint = {
    x: -1,
    y: -1,
    z: -1
};
var selected2dPoint = {
    x: -1,
    y: -1
};

// moving info when 2d scatter
var movingOptions = {
    isMoving: false,
    start: {
        x: -1,
        y: -1
    },
    present: {
        x: -1,
        y: -1
    }
};

// all the methods related to data handling
var dataHandler = {
    init: function () {
        var data = null;
        var colNames = [];
        var i = 0;

        // get data from localStorage
        if (window.localStorage) {
            data = JSON.parse(localStorage.getItem('VS_DATA') ? localStorage.getItem('VS_DATA') : '');
            //var colNames = localStorage.getItem("vs_colNames").split(",");
            colNames = ["subject", "count", "word"];
            dataCase = 2;
        } else {
            alert('LocalStorage is not supported.');
            return;
        }

        chartOptions.count = data.v1.length;
        for (i = 0; i < chartOptions.count; i++) {
            // get all fields in data
            var v1 = data.v1[i];
            var v2 = data.v2[i];
            var v3 = data.v3[i];
            var v4 = data.v4[i];
            var v5 = data.v5[i];
            var v6 = data.v6[i];

            // init originData
            originData[i] = new Array();
            originData[i][0] = v1;
            originData[i][1] = v2;
            originData[i][2] = v3;
            originData[i][3] = v4;
            originData[i][4] = v5;
            originData[i][5] = v6;

            // init scatter3dData
            scatter3dData[i] = new Array();
            scatter3dData[i][0] = v1;
            scatter3dData[i][1] = v2;
            scatter3dData[i][2] = v3;

            // find min and max of each axis
            if (i == 0){
                chartOptions.x.min = v1;
                chartOptions.x.max = v1;
                chartOptions.y.min = v2;
                chartOptions.y.max = v2;
                chartOptions.z.min = v3;
                chartOptions.z.max = v3;
            }
            if (v1 < chartOptions.x.min) {
                chartOptions.x.min = v1;
            }
            if (v2 < chartOptions.y.min){
                chartOptions.y.min = v2;
            }
            if (v3 < chartOptions.z.min){
                chartOptions.z.min = v3;
            }
            if (v1 > chartOptions.x.max) {
                chartOptions.x.max = v1;
            }
            if (v2 > chartOptions.y.max) {
                chartOptions.y.max = v2;
            }
            if (v3 > chartOptions.z.max) {
                chartOptions.z.max = v3;
            }
        }

        // define the zone
        var zone = chartOptions.y.max;
        var zoneCount = 0;
        while (zone/10 > 1) {
            zone = zone/10;
            zoneCount++;
        }
        zone = Math.ceil(zone);
        while (zoneCount > 0) {
            zone *= 10;
            zoneCount--;
        }
        chartOptions.zone = zone;

        // set other chart options
        chartOptions.x.length = chartOptions.x.max - chartOptions.x.min;
        chartOptions.y.length = chartOptions.y.max - chartOptions.y.min;
        chartOptions.z.length = chartOptions.z.max - chartOptions.z.min;
        chartOptions.x.title = colNames[0];
        chartOptions.y.title = colNames[1];
        chartOptions.z.title = colNames[2];
    }
};

// all the methods related to chart handling
var chartHandler = {
    init3dChart: function () {
        chart3d = new Highcharts.Chart({
            chart: {
                margin: 50,
                renderTo: 'chart3d',
                type: 'scatter',
                options3d: {
                    enabled: true,
                    alpha: 10,
                    beta: 30,
                    depth: 2000,
                    viewDistance: 1,
                    frame: {
                        bottom: { size: 1, color: 'rgba(0,0,0,0.02)' },
                        back: { size: 1, color: 'rgba(0,0,0,0.04)' },
                        side: { size: 1, color: 'rgba(0,0,0,0.06)' }
                    }
                }
            },
            title: {
                text: '3D Demonstration'
            },
            plotOptions: {
                series: {
                    point: {
                        events: {
                            click: function(){
                                chartHandler.selectPoint(this.x, this.y, this.z);
                            }
                        }
                    }
                },
                scatter: {
                    marker: {
                        symbol: 'circle',
                        states: {
                            hover: {
                                fillColor: '#00a190'
                            }
                        }
                    },
                    zones: [{
                        value: chartOptions.zone/6,
                        color: '#ffff00'
                    }, {
                        value: chartOptions.zone*1/6,
                        color: '#ffcc00'
                    },{
                        value: chartOptions.zone*3/6,
                        color: '#ff9900'
                    },{
                        value: chartOptions.zone*4/6,
                        color: '#ff6600'
                    },{
                        value: chartOptions.zone*5/6,
                        color: '#ff3300'
                    },{
                        color: '#ff0000'
                    }]
                }
            },
            xAxis: {
                min: chartOptions.x.min,
                max: chartOptions.x.max,
                title: {
                    text: chartOptions.x.title,
                }
            },
            yAxis: {
                min: chartOptions.y.min,
                max: chartOptions.y.max,
                title: {
                    text: chartOptions.y.title,
                }
            },
            zAxis: {
                min: chartOptions.z.min,
                max: chartOptions.z.max,
                title: {
                    text: chartOptions.z.title,
                }
            },
            legend: {
                enabled: false
            },
            credits: {
                enabled: false
            },
            tooltip: {
                useHTML: true,
                formatter: function(){
                    var p = this.point;
                    var s = "(" + p.x + ", " + p.y + ", " + p.z + ")<br />";
                    s += "<br /><a href='javascript:changeTo2d(\"x\", " + p.x + ")'>To 2D Section : x = " + p.x + "</a>";
                    s += "<br /><a href='javascript:changeTo2d(\"y\", " + p.y + ")'>To 2D Section : y = " + p.y + "</a>";
                    s += "<br /><a href='javascript:changeTo2d(\"z\", " + p.z + ")'>To 2D Section : z = " + p.z + "</a>";
                    return s;
                }
            },
            series: [{
                data: scatter3dData,
                turboThreshold: chartOptions.count + 1
            }]
        });

        // set mouse and touch action of the chart
        $(chart3d.container).bind('mousedown.hc touchstart.hc', function (e) {
            e = chart3d.pointer.normalize(e);

            var posX = e.pageX,
                posY = e.pageY,
                alpha = chart3d.options.chart.options3d.alpha,
                beta = chart3d.options.chart.options3d.beta,
                newAlpha,
                newBeta,
                sensitivity = 5; // lower is more sensitive

            $(document).bind({
                'mousemove.hc touchdrag.hc': function (e) {
                    // Run beta
                    newBeta = beta + (posX - e.pageX) / sensitivity;
                    newBeta = Math.min(100, Math.max(-100, newBeta));
                    chart3d.options.chart.options3d.beta = newBeta;

                    // Run alpha
                    newAlpha = alpha + (e.pageY - posY) / sensitivity;
                    newAlpha = Math.min(100, Math.max(-100, newAlpha));
                    chart3d.options.chart.options3d.alpha = newAlpha;

                    chart3d.redraw(false);
                },
                'mouseup touchend': function () {
                    $(document).unbind('.hc');
                }
            });
        });

        // set default operations
        switch (dataCase) {
            case DATA_CASES.DIGITAL_THREE_TEXT_ZERO:
                // do something...
                // haven't implemented
                break;
            case DATA_CASES.DIGITAL_TWO_TEXT_ONE:
                // do something...
                // haven't implemented
                break;
            case DATA_CASES.DIGITAL_ONE_TEXT_TW0:
                $("#ypre").prop("disabled", true);
                $("#ynext").prop("disabled", true);
                break;
            case DATA_CASES.DIGITAL_ZERO_TEXT_THREE:
                // do something...
                // haven't implemented
                break;
        }
    },
    init2dChart: function () {

    },
    update: function (chart, data) {
        var series = chart.series;
        while (series.length > 0) {
            series[0].remove(false);
        }
        chart.addSeries({
            data: data,
            turboThreshold: chartOptions.count + 1
        });
    },
    selectPoint: function (x, y, z) {
        selected3dPoint.x = x;
        selected3dPoint.y = y;
        selected3dPoint.z = z;

        $("#spSelected").html("(" + x + ", " + y + ", " + z + ")");

        for (var i = 0; i < chartOptions.count; i++) {
            if(originData[i][0] == x && originData[i][1] == y && originData[i][2] == z){
                var xText = originData[i][3];
                var yText = originData[i][4]
                var zText = originData[i][5];
            }
        }
        $("#spXInfo").html(chartOptions.x.title + " (" + x + ") : " + xText);
        $("#spYInfo").html(chartOptions.y.title + " (" + y + ") : " + yText);
        $("#spZInfo").html(chartOptions.z.title + " (" + z + ") : " + zText);
    }
};

$(function(){
    // init all the data we need
    dataHandler.init();

    // when first load shows the 3d scatter chart
    // init the 3d scatter chart
    chartHandler.init3dChart();
});