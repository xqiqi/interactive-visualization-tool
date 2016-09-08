/** 
 ***** Definition *****
 *
 * [seriesData] when drawing the chart, the data it needs, it contains the series name and digit data of the chart
 * [chart2d] the highcharts object to draw a 2d chart
 * [cluster] contains all the properties of the cluster, including the amount of clusters and cluster series
 * [chart] defines all the properties of the chart
 */
var seriesData = [];
var chart2d = null;
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
        }
    }
}

/**
 ***** Define All The Methods Related To Data Handling
 *
 * [init] parpare data
 */
var dataHandler = {
    init: function () {
        var data = null;
        var colNames = [];
        var i = 0;

        if (window.localStorage) {
            data = JSON.parse(localStorage.getItem('VS_DATA_K') ? localStorage.getItem('VS_DATA_K') : '');
            colNames = localStorage.getItem('VS_COL_NAMES').split(',');
            cluster.k = parseInt(localStorage.getItem('VS_K'));
        } else {
            alert('LocalStorage is not supported.');
            return;
        }

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
            var k = data.cluster[i] - 1;

            var kcount = cluster.series[k].count;
            // set seriesData
            seriesData[k].data[kcount] = new Array();
            seriesData[k].data[kcount][0] = v1;
            seriesData[k].data[kcount][1] = v2;
            // set cluster data
            cluster.series[k].originData[kcount] = new Array();
            cluster.series[k].originData[kcount][0] = v3;
            cluster.series[k].originData[kcount][1] = v4;

            cluster.series[k].count++;

            // find min and max of each axis
            if (i == 0){
                chart.axises.x.min = v1;
                chart.axises.x.max = v1;
                chart.axises.y.min = v2;
                chart.axises.y.max = v2;
            }
            if (v1 < chart.axises.x.min) {
                chart.axises.x.min = v1;
            }
            if (v2 < chart.axises.y.min){
                chart.axises.y.min = v2;
            }
            if (v1 > chart.axises.x.max) {
                chart.axises.x.max = v1;
            }
            if (v2 > chart.axises.y.max) {
                chart.axises.y.max = v2;
            }
        }

        chart.axises.x.title = colNames[0];
        chart.axises.y.title = colNames[1];
    }
};

/**
 ***** Define All The Methods Related To Chart Handling
 *
 * [init3dChart] generate a new 3d chart and init some params
 */
var chartHandler = {
    init2dChart: function () {
        chart2d = new Highcharts.Chart({
            chart: {
                margin: [100,150,100,150],
                renderTo: 'chart2d',
                type: 'scatter'
            },
            title: {
                text: '2D Cluster Demonstration'
            },
            plotOptions: {
                series: {
                    point: {
                        events: {
                            click: function () {
                                chartHandler.select2d(this);
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
            credits: {
                enabled: false
            },
            series: seriesData
        });
    },
    select2d: function (o) {
        var x = o.x;
        var y = o.y;
        var k = o.series._i;
        var index = o.index;
        var name = o.series.name;

        var origin = cluster.series[k].originData[index];
        var xText = origin[0];
        var yText = origin[1];

        $('#spCluster').html(name);
        $('#spXInfo').html(chart.axises.x.title + ' (' + x + ') : ' + xText);
        $('#spYInfo').html(chart.axises.y.title + ' (' + y + ') : ' + yText);
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
            for (var j = 0; j < cItem.length - 1; j++) {
                str += cItem[j] + '(' + oItem[j] + '), ';
            }

            str += cItem[j] + '(' + oItem[j] + ')<br />';
        }

        $('#clusterInfo .all').empty().append(str);
    }
}

$(function () {
    dataHandler.init();
    chartHandler.init2dChart();
    clusterHandler.init();

    $('#clusterInfo .clusters').on('click', 'span', function () {
        var k = $(this).attr('id').replace(/[a-z]/ig, '') - 1;
        clusterHandler.showClusterData(k);
        $('#clusterInfo .clusters span').removeClass('active');
        $(this).addClass('active');
    });
});