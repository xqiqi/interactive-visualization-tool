var originData = [];
var seriesData = [];
var chart3d = null;
var cluster = {
    k: 0,
    kcount: []
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

var dataHandler = {
    init: function () {
        var data = null;
        var colNames = [];
        var i = 0;

        if (window.localStorage) {
            data = JSON.parse(localStorage.getItem('VS_DATA_K') ? localStorage.getItem('VS_DATA_K') : '');
            cluster.k = parseInt(localStorage.getItem('VS_K'));
            colNames = localStorage.getItem('VS_COL_NAMES').split(',');
        } else {
            alert('LocalStorage is not supported.');
            return;
        }

        for (i = 0; i < cluster.k; i++) {
            seriesData[i] = {
                name: 'Cluster' + (i + 1),
                data: []
            };
            cluster.kcount[i] = 0;
        }

        chart.count = data.V1.length;
        for (i = 0; i < chart.count; i++) {
            var v1 = data.V1[i];
            var v2 = data.V2[i];
            var v3 = data.V3[i];
            var v4 = data.V4[i];
            var v5 = data.V5[i];
            var v6 = data.V6[i];
            var c = data.cluster[i] - 1;

            originData[i] = new Array();
            originData[i][0] = v1;
            originData[i][1] = v2;
            originData[i][2] = v3;
            originData[i][3] = v4;
            originData[i][4] = v5;
            originData[i][5] = v6;

            var kcount = cluster.kcount[c];
            seriesData[c].data[kcount] = new Array();
            seriesData[c].data[kcount][0] = v1;
            seriesData[c].data[kcount][1] = v2;
            seriesData[c].data[kcount][2] = v3;
            cluster.kcount[c]++;

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

        chart.axises.x.title = colNames[0];
        chart.axises.y.title = colNames[1];
        chart.axises.z.title = colNames[2];
    }
};

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
            legend: {
                enabled: false
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
    }
};

var clusterHandler = {
    init: function () {
        // add cluster selection
        var cstr = '';
        for (var i = 0; i < cluster.k; i++) {
            cstr += '<span id=\"c' + (i + 1) + '\">' + seriesData[i].name + ' (' + cluster.kcount[i] + ')</span>';
        }
        $('#clusterInfo .clusters').empty().append(cstr);

        // default select cluster1
        $('#c1').addClass('active');
        this.showClusterData(1);
    },
    showClusterData: function (c) {
        var data = seriesData[c].data;
        var str = '';

        for (var i = 0; i < data.length; i++) {
            var dataItem = data[i];
            for (var j = 0; j < dataItem.length - 1; j++) {
                str += dataItem[j] + ', ';
            }

            str += dataItem[j] + '<br />';
        }

        $('#clusterInfo .all').empty().append(str);
    }
}

$(function () {
    dataHandler.init();
    chartHandler.init3dChart();
    clusterHandler.init();
});