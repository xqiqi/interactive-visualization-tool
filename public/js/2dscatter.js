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
    DIGITAL_TWO_TEXT_ZERO: 0, // no axis can be interacted
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
        for (i = 0; i < chart.count; i++) {
            var v1 = data.v1[i];
            var v2 = data.v2[i];
            var v3 = data.v3[i];
            var v4 = data.v4[i];
            var v5 = data.v5[i];
            var v6 = data.v6[i];

            originData[i] = new Array();
            originData[i][0] = v1;
            originData[i][1] = v2;
            //originData[i][2] = v3;
            //originData[i][3] = v4;
            originData[i][2] = v4;
            originData[i][3] = v5;

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

        chart.axises.x.title = colNames[0];
        chart.axises.y.title = colNames[1];
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
        var k = $('#kmeansInput').val() ? $('#kmeansInput').val() : 0;
        if (k < 1 || parseInt(k) == NaN) {
            alert('Invalid k value!');
            return;
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
                    k: k,
                    ignored: [false, false],
                    dim: 2
                }
            })
            .done(function (res) {
                if (window.localStorage) {
                    localStorage.setItem("VS_DATA_K", res);
                    localStorage.setItem("VS_K", k);
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