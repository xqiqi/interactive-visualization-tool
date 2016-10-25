/** 
 ***** Definition *****
 *
 * [originData] 2d chart will use the 1st and 2nd columns to draw the chart, and the 3rd and 4th columns are the text of 1st and 2nd columns
 * [chart2d] the highcharts object to draw a 2d chart
 * [chart] defines all the properties of the chart
 * [DATA_CASES] defines all the cases that this page can handle
 */
var originData = [];
var chart2d = null;
var chart = {
    count: 0,
    zone: 0,
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
    },
    movingPoint: {
        isMoving: false,
        point: {
            x: -1,
            y: -1
        },
        client: {
            x: -1,
            y: -1
        }
    }
};
var DATA_CASES = {
    DIGITAL_TWO_TEXT_ZERO: 0,   // no axis can be interacted
    DIGITAL_ONE_TEXT_ONE: 1,    // x axis can be interacted
    DIGITAL_ZERO_TEXT_TW0: 2    // x and y axises can be interacted
};
var dataCase = 0;

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
            data = JSON.parse(localStorage.getItem('VS_DATA') ? localStorage.getItem('VS_DATA') : '');
            colNames = localStorage.getItem('VS_COL_NAMES').split(',');
            //dataCase = parseInt(localStorage.getItem('VS_DATA_CASE'));
            dataCase = 1;
        } else {
            alert('LocalStorage is not supported.');
            return;
        }

        chart.count = data.v1.length;
        var k = 0;
        for (i = 0; i < chart.count; i++) {
            var v1 = data.v1[i];
            var v2 = data.v2[i];
            var v3 = data.v3[i];
            var v4 = data.v4[i];
            var v5 = data.v5[i];
            var v6 = data.v6[i];

            if (v1 == 183 && v2 >= 100) {
                originData[k] = new Array();
                originData[k][0] = v3;
                originData[k][1] = v2;
                originData[k][2] = v6;
                originData[k][3] = v5;
                k++;

                if (i == 0){
                    chart.axises.x.min = v3;
                    chart.axises.x.max = v3;
                    chart.axises.y.min = v2;
                    chart.axises.y.max = v2;
                }
                if (v3 < chart.axises.x.min) {
                    chart.axises.x.min = v3;
                }
                if (v2 < chart.axises.y.min){
                    chart.axises.y.min = v2;
                }
                if (v3 > chart.axises.x.max) {
                    chart.axises.x.max = v3;
                }
                if (v2 > chart.axises.y.max) {
                    chart.axises.y.max = v2;
                }
            }
        }

        // define the zone
        var zone = chart.axises.y.max;
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
        chart.zone = zone;

        chart.axises.x.title = colNames[1];
        chart.axises.y.title = colNames[2];
    },
    update2dData: function (x1, y1, x2, y2) {
        for (var i = 0; i < originData.length; i++) {
            var nowX = originData[i][0];
            var nowY = originData[i][1];

            if (x1 > x2) {
                // move the point to front
                if (nowX >= x2 && nowX < x1) {
                    originData[i][0] = nowX + 1;
                } else if (nowX == x1) {
                    originData[i][0] = x2;
                }
            } else if (x1 < x2) {
                // move the point to end
                if (nowX <= x2 && nowX > x1) {
                    originData[i][0] = nowX - 1;
                } else if (nowX == x1) {
                    originData[i][0] = x2;
                }
            }

            if (y1 > y2) {
                if (nowY >= y2 && nowY < y1) {
                    originData[i][1] = nowY + 1;
                } else if (nowY == y1) {
                    originData[i][1] = y2;
                }
            } else if (y1 < y2) {
                if (nowY <= y2 && nowY > y1) {
                    originData[i][1] = nowY - 1;
                } else if (nowY == y1) {
                    originData[i][1] = y2;
                }
            }
        }
    }
};

/**
 ***** Define All The Methods Related To Chart Handling
 *
 * [init2dChart] generate a new 2d chart and init some params
 */
var chartHandler = {
    init2dChart: function () {
        chart2d = new Highcharts.Chart({
            chart: {
                margin: [100,150,100,150],
                renderTo: 'chart2d',
                type: 'scatter',
                events: {
                    click: moveHandler.moveEnd
                }
            },
            title: {
                text: '2D Demonstration'
            },
            plotOptions: {
                series: {
                    point: {
                        events: {
                            click: function () {
                                chartHandler.select2d(this.x, this.y);
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
                        value: chart.zone/6,
                        color: '#ffff00'
                    }, {
                        value: chart.zone*2/6,
                        color: '#ffcc00'
                    },{
                        value: chart.zone*3/6,
                        color: '#ff9900'
                    },{
                        value: chart.zone*4/6,
                        color: '#ff6600'
                    },{
                        value: chart.zone*5/6,
                        color: '#ff3300'
                    },{
                        color: '#ff0000'
                    }]
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
            legend: {
                enabled: false
            },
            credits: {
                enabled: false
            },
            tooltip: {
                useHTML: true,
                formatter: function () {
                    if (!chart.movingPoint.isMoving) {
                        var s = 'x represents <b>' + chart.axises.x.title + '</b>, y represents <b>' + chart.axises.y.title + '</b><br />';
                        s += '(x, y) = (' + this.x + ', ' + this.y + ')<br />';
                        if (dataCase != DATA_CASES.DIGITAL_TWO_TEXT_ZERO) {
                            s += '<br /><a href=\"javascript:moveHandler.moveStart(' + this.x + ',' + this.y + ',' + (this.point.plotX + 450) + ',' + (this.point.plotY + 100) + ')\">Change Position?</a>';
                        }
                        return s;
                    }
                    return false;
                }
            },
            series: [{
                data: originData,
                turboThreshold: chart.count + 1
            }]
        });
    },
    select2d: function (x, y) {
        $('#spSelectedS').html('(' + x + ', ' + y + ')');

        for (var i = 0; i < originData.length; i++) {
            if (originData[i][0] == x && originData[i][1] == y) {
                var xText = originData[i][2];
                var yText = originData[i][3];
            }
        }

        $('#spXInfoS').html(chart.axises.x.title + ' (' + x + ') : ' + xText);
        $('#spYInfoS').html(chart.axises.y.title + ' (' + y + ') : ' + yText);
    },
    update: function (chart, data) {
        var series = chart.series;
        while (series.length > 0) {
            series[0].remove(false);
        }
        chart.addSeries({
            data: data,
            turboThreshold: chart.count + 1
        });

        $('#spSelectedS').html('NOTHING SELECTED');
        $('#spXInfoS').html('x : NOTHING SELECTED');
        $('#spYInfoS').html('y : NOTHING SELECTED');
    }
};

/**
 ***** Define All The Methods Related To Point Moving
 *
 * [moveStart] when move start
 * [moveProgress] when move in progress
 * [moveEnd] when move end
 *
 * [changeSave] move end and user save the change
 * [changeCancel] move end but user cancel the change
 */
var moveHandler = {
    moveStart: function (x, y, cx, cy) {
        // set the property to be true to let others know I'm moving a point
        chart.movingPoint.isMoving = true;
        chart.movingPoint.point.x = x;
        chart.movingPoint.point.y = y;
        chart.movingPoint.client.x = cx;
        chart.movingPoint.client.y = cy;

        // change the text in operation section
        chartHandler.select2d(x, y);

        $('#spMoving').html('(' + x + ', ' + y + ')');
        $(chart2d.container).bind('mousemove', this.moveProgress);
    },
    moveProgress: function (e) {
        var cWidth = chart2d.plotWidth;
        var cHeight = chart2d.plotHeight;
        var x = e.clientX;
        var y = e.clientY;

        if (chart.movingPoint.isMoving) {
            // hide the auto show tooltip when moving the point
            $('#chart2d .highcharts-tooltip').hide();

            // define the edge of the chart
            if (x < 450) {
                x = 450;
            } else if (x > 450 + cWidth) {
                x = 450 + cWidth;
            }
            if (y < 100) {
                y = 100;
            } else if (y > 100 + cHeight) {
                y = 100 + cHeight;
            }

            // for some cases, digit value can't change
            if (dataCase == DATA_CASES.DIGITAL_ONE_TEXT_ONE) {
                y = chart.movingPoint.client.y;
            }

            $('#moveDot').css('top', y - 4 + 'px');
            $('#moveDot').css('left', x - 4 + 'px');
            $('#moveInfo').css('top', y - $('#moveInfo').height() - 15 + 'px');
            $('#moveInfo').css('left', x - $('#moveInfo').width()/2 + 'px');
            $('#moveDot').show();
            $('#moveInfo').show();
        }
    },
    moveEnd: function (e) {
        if (chart.movingPoint.isMoving) {
            var px = Math.floor(e.xAxis[0].value);
            var py = Math.floor(e.yAxis[0].value);

            px = px < chart.axises.x.min ? chart.axises.x.min : px;
            px = px > chart.axises.x.max ? chart.axises.x.max : px;
            py = py < chart.axises.y.min ? chart.axises.y.min : py;
            py = py > chart.axises.y.max ? chart.axises.y.max : py;
            if (dataCase == DATA_CASES.DIGITAL_ONE_TEXT_ONE) {
                py = chart.movingPoint.point.y;
            }

            var s = 'You are moving to this Point (' + px + ', ' + py + ')<br />';
            s += 'Are you sure to commit? <a href=\"javascript:moveHandler.changeSave(' + chart.movingPoint.point.x + ',' + chart.movingPoint.point.y + ',' + px + ',' + py + ')\">YES</a> / <a href=\"javascript:moveHandler.changeCancel()\">No</a>';
            $('#moveInfo').empty().append(s);
            $(chart2d.container).unbind('mousemove', this.moveProgress);
            chart.movingPoint.isMoving = 0;
        }
    },
    changeSave: function (x1, y1, x2, y2) {
        // update scatter2dData
        dataHandler.update2dData(x1, y1, x2, y2);

        // update 2d chart
        chartHandler.update(chart2d, originData);

        // init moving
        this.changeCancel();

        // show the point's info after moving
        chartHandler.select2d(x2, y2);
    },
    changeCancel: function () {
        $('#moveDot').hide();
        $('#moveInfo').hide();
        $('#chart2d .highcharts-tooltip').show();

        var s = 'You have chosen the Point <span id=\"spMoving\">(x, y)</span>.<br />Please move to the Point that you want and click.';
        $('#moveInfo').empty().append(s);

        chart.movingPoint.isMoving = false;
        chart.movingPoint.point.x = -1;
        chart.movingPoint.point.y = -1;
        chart.movingPoint.client.x = -1;
        chart.movingPoint.client.y = -1;
    }
}


$(function () {
    // init all the data we need
    dataHandler.init();

    // init the 2d scatter chart
    chartHandler.init2dChart();

    // cluster
    $('#goCluster').click(function () {
        var ctype = parseInt($('#clusterSelector').val());
        var cdata = {};

        switch (ctype) {
            case 1:
                // kmeans
                cdata.k = $('#kmeansK').val() ? parseInt($('#kmeansK').val()) : 0;
                if (cdata.k < 1 || isNaN(cdata.k)) {
                    alert('Invalid input!');
                    return;
                }
                break;
            case 2:
                // dbscan
                cdata.eps = $('#dbscanEps').val() ? parseInt($('#dbscanEps').val()) : 0;
                cdata.minpts = $('#dbscanMinPts').val() ? parseInt($('#dbscanMinPts').val()) : 0;
                if (cdata.eps < 0 || cdata.minpts < 0 || isNaN(cdata.eps) || isNaN(cdata.minpts)) {
                    alert('Invalid input!');
                    return;
                }
                break;
        }

        // store originData to a tmp file and let R to call the tmp file
        $.ajax({
            type: 'post',
            url: '/createFile',
            dataType: 'json',
            data: {
                data: JSON.stringify(originData)
            }
        })
        .done(function () {
            $.ajax({
                type: 'post',
                url: '/data/cluster',
                dataType: 'json',
                data: {
                    dim: 2,
                    type: ctype,
                    param: cdata
                }
            })
            .done(function (res) {
                if (window.localStorage) {
                    localStorage.setItem("VS_DATA_K", res);
                } else {
                    alert("LocalStorage is not supported.");
                }

                window.location.href = '2dcluster.html';
            })
            .fail(function () {
                alert('Data Cluster Failed.');
            })
        });
    });
});