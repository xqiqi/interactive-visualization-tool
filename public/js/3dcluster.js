/** 
 ***** Definition *****
 *
 * [seriesData] when drawing the chart, the data it needs, it contains the series name and digit data of the chart
 * [chart3d] the highcharts object to draw a 3d chart
 * [cluster] contains all the properties of the cluster, including the amount of clusters and cluster series
 * [chart] defines all the properties of the chart
 */
var seriesData = [];
var chart3d = null;
var cluster = {
    k: 0,
    series: []
}
var chart = {
    count: 0,
    axises: {
        x: {
            min: 0,
            max: 0,
            title: ''
        },
        y: {
            min: 0,
            max: 0,
            title: ''
        },
        z: {
            min: 0,
            max: 0,
            title: ''
        }
    }
}
var DATA_CASES = {
    DIGITAL_THREE_TEXT_ZERO: 0, // no axis can be interacted
    DIGITAL_TWO_TEXT_ONE: 1,    // x axis can be interacted
    DIGITAL_ONE_TEXT_TW0: 2,    // x and z axises can be interacted
    DIGITAL_ZERO_TEXT_THREE: 3  // all axises can be interacted
};
var eData = [];
var clusterSum = [];

/**
 ***** Define All The Methods Related To Data Handling
 *
 * [init] parpare data
 */
var dataHandler = {
    init: function () {
        var data = null;
        var colNames = [];
        var colTypes = [];
        var dataCase = 0;
        var i = 0;

        if (window.localStorage) {
            data = JSON.parse(localStorage.getItem('VS_DATA_K') ? localStorage.getItem('VS_DATA_K') : '');
            colNames = localStorage.getItem('VS_COL_NAMES').split(',');
            colTypes = localStorage.getItem('VS_COL_TYPES').split(',');
            dataCase = parseInt(localStorage.getItem('VS_DATA_CASE'));
        } else {
            alert('LocalStorage is not supported.');
            return;
        }

        cluster.k = Math.max.apply(Math,data.cluster);

        for (i = 0; i < cluster.k; i++) {
            // init seriesData
            seriesData[i] = {
                name: 'Cluster' + (i + 1),
                data: []
            };

            // init cluster data
            cluster.series[i] = {
                originData: [],
                count: 0
            }
        }

        chart.count = data.V1.length;
        for (i = 0; i < chart.count; i++) {
            var v1 = data.V1[i];
            var v2 = data.V2[i];
            var v3 = data.V3[i];
            var v4 = data.V4[i];
            var v5 = data.V5[i];
            var v6 = data.V6[i];
            var k = data.cluster[i] - 1;

            var kcount = cluster.series[k].count;
            // set seriesData
            seriesData[k].data[kcount] = new Array();
            seriesData[k].data[kcount][0] = v1;
            seriesData[k].data[kcount][1] = v2;
            seriesData[k].data[kcount][2] = v3;
            // set cluster data
            cluster.series[k].originData[kcount] = new Array();
            cluster.series[k].originData[kcount][0] = v4;
            cluster.series[k].originData[kcount][1] = v5;
            cluster.series[k].originData[kcount][2] = v6;

            cluster.series[k].count++;

            // find min and max of each axis
            if (i == 0){
                chart.axises.x.min = v1;
                chart.axises.x.max = v1;
                chart.axises.y.min = v2;
                chart.axises.y.max = v2;
                chart.axises.z.min = v3;
                chart.axises.z.max = v3;
            }
            if (v1 < chart.axises.x.min) {
                chart.axises.x.min = v1;
            }
            if (v2 < chart.axises.y.min){
                chart.axises.y.min = v2;
            }
            if (v3 < chart.axises.z.min){
                chart.axises.z.min = v3;
            }
            if (v1 > chart.axises.x.max) {
                chart.axises.x.max = v1;
            }
            if (v2 > chart.axises.y.max) {
                chart.axises.y.max = v2;
            }
            if (v3 > chart.axises.z.max) {
                chart.axises.z.max = v3;
            }
        }

        if (dataCase == DATA_CASES.DIGITAL_TWO_TEXT_ONE && colTypes[0] == 2 && colTypes[1] == 2 && colTypes[2] == 1) {
            chart.axises.x.title = colNames[2];
            chart.axises.y.title = colNames[0];
            chart.axises.z.title = colNames[1];
        } else if ((dataCase == DATA_CASES.DIGITAL_TWO_TEXT_ONE && colTypes[0] == 2 && colTypes[1] == 1 && colTypes[2] == 2) || 
            (dataCase == DATA_CASES.DIGITAL_ONE_TEXT_TW0 && colTypes[0] == 2 && colTypes[1] == 1 && colTypes[2] == 1)) {
            chart.axises.x.title = colNames[1];
            chart.axises.y.title = colNames[0];
            chart.axises.z.title = colNames[2];
        } else if (dataCase == DATA_CASES.DIGITAL_ONE_TEXT_TW0 && colTypes[0] == 1 && colTypes[1] == 1 && colTypes[2] == 2) {
            chart.axises.x.title = colNames[0];
            chart.axises.y.title = colNames[2];
            chart.axises.z.title = colNames[1];
        } else {
            chart.axises.x.title = colNames[0];
            chart.axises.y.title = colNames[1];
            chart.axises.z.title = colNames[2];
        }
    }
};

/**
 ***** Define All The Methods Related To Chart Handling
 *
 * [init3dChart] generate a new 3d chart and init some params
 */
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
                text: '3D Cluster Demonstration'
            },
            plotOptions: {
                series: {
                    point: {
                        events: {
                            click: function () {
                                chartHandler.select3d(this);
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
                    }
                }
            },
            xAxis: {
                min: chart.axises.x.min,
                max: chart.axises.x.max,
                title: {
                    text: chart.axises.x.title,
                }
            },
            yAxis: {
                min: chart.axises.y.min,
                max: chart.axises.y.max,
                title: {
                    text: chart.axises.y.title,
                }
            },
            zAxis: {
                min: chart.axises.z.min,
                max: chart.axises.z.max,
                title: {
                    text: chart.axises.z.title,
                }
            },
            credits: {
                enabled: false
            },
            series: seriesData
        });

        $(chart3d.container).bind('mousedown.hc touchstart.hc', function (e) {
            e = chart3d.pointer.normalize(e);

            var posX = e.pageX,
                posY = e.pageY,
                alpha = chart3d.options.chart.options3d.alpha,
                beta = chart3d.options.chart.options3d.beta,
                newAlpha,
                newBeta,
                sensitivity = 5;

            $(document).bind({
                'mousemove.hc touchdrag.hc': function (e) {
                    newBeta = beta + (posX - e.pageX) / sensitivity;
                    newBeta = Math.min(100, Math.max(-100, newBeta));
                    chart3d.options.chart.options3d.beta = newBeta;
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
    },
    select3d: function (o) {
        var x = o.x;
        var y = o.y;
        var z = o.z;
        var k = o.series._i;
        var index = o.index;
        var name = o.series.name;

        var origin = cluster.series[k].originData[index];
        var xText = origin[0];
        var yText = origin[1];
        var zText = origin[2];

        $('#spCluster').html(name);
        $('#spXInfo').html(chart.axises.x.title + ' (' + x + ') : ' + xText);
        $('#spYInfo').html(chart.axises.y.title + ' (' + y + ') : ' + yText);
        $('#spZInfo').html(chart.axises.z.title + ' (' + z + ') : ' + zText);
    }
};

/**
 ***** Define All The Methods Related To Cluster Handling
 *
 * [init] generate cluster selection and show these on the page
 * [showClusterData] get all data from given k and show these on the page
 */
var clusterHandler = {
    init: function () {
        // add cluster selection
        var str = '';
        for (var i = 0; i < cluster.k; i++) {
            str += '<span id=\"c' + (i + 1) + '\">' + seriesData[i].name + ' (' + cluster.series[i].count + ')</span>';
        }
        $('#clusterInfo .clusters').empty().append(str);

        // set default selection - cluster1
        $('#c1').addClass('active');
        this.showClusterData(0);
    },
    showClusterData: function (k) {
        var chartData = seriesData[k].data;
        var originData = cluster.series[k].originData;
        var count = cluster.series[k].count;
        var str = '';

        for (var i = 0; i < count; i++) {
            var cItem = chartData[i];
            var oItem = originData[i];
            
            str += cItem[0] + '(' + oItem[0] + '), ';
            str += cItem[1] + '(' + oItem[1] + '), ';
            str += cItem[2] + '(' + oItem[2] + ')<br />';
        }

        $('#clusterInfo .all').empty().append(str);
    }
}

$(function () {
    dataHandler.init();
    chartHandler.init3dChart();
    clusterHandler.init();

    $('#clusterInfo .clusters').on('click', 'span', function () {
        var k = $(this).attr('id').replace(/[a-z]/ig, '') - 1;
        clusterHandler.showClusterData(k);
        $('#clusterInfo .clusters span').removeClass('active');
        $(this).addClass('active');
    });

    $('#getEs').click(function () {
        dataHandler.getExceptions();
    });
});