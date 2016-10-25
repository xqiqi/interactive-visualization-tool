/** 
 ***** Define Data *****
 *
 * [originData] includes col1.factor, col2.factor, col3.factor, col1.text, col2.text, col3.text
 * [originData] for digit columns, the values of factor and text are same
 * [originData] col1: x, col2: y, col3: z
 *
 * [scatter3dData] inclues col1.factor, col2,factor, col3.factor
 *
 * [scatter2dData] used for 2d visulation section
 * [scatter2dData] the first and second columns are for generating a chart, other columns are for tmp use
 */
var originData = [];
var scatter3dData = [];
var scatter2dData = [];

/**
 ***** Define Chart *****
 *
 * [chart3d] highcharts object for 3d scatter chart
 * [chart2d] highcharts object for 2d scatter chart
 */
var chart3d = null;
var chart2d = null;

/**
 ***** Define Enums *****
 *
 * [DATA_CASES] defines all the cases that this page can handle
 * [dataCase] is one of DATA_CASES
 *
 * [TYPE_OF_2D] defines all the cases when 3d change to 2d
 * [typeOf2d] is one of TYPE_OF_2D
 */
var DATA_CASES = {
    DIGITAL_THREE_TEXT_ZERO: 0, // no axis can be interacted
    DIGITAL_TWO_TEXT_ONE: 1,    // x axis can be interacted
    DIGITAL_ONE_TEXT_TW0: 2,    // x and z axises can be interacted
    DIGITAL_ZERO_TEXT_THREE: 3  // all axises can be interacted
};
var TYPE_OF_2D = {
    BASE_X: 0,          // base on the specific x value and use y and z axises to generate the 2d scatter
    BASE_Y: 1,          // base on the specific y value and use x and z axises to generate the 2d scatter
    BASE_Z: 2,          // base on the specific z value and use x and y axises to generate the 2d scatter
    BASE_MERGE_X: 3,    // merge the values on x axises and use y and z axises to generate the 2d scatter
    BASE_MERGE_Y: 4,    // merge the values on y axises and ues x and z axises to generate the 2d scatter
    BASE_MERGE_Z: 5     // merge the values on z axises and use x and y axises to generate the 2d scatter
};
var dataCase = 0;
var typeOf2d = 0;

/**
 ***** Define All Properties of Chart *****
 */
var chart = {
    count: 0,
    zone: 0,
    axises: {
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
    },
    selectedPoint: {
        x: -1,
        y: -1,
        z: -1
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
    },
    maxy: 0
}

/**
 ***** Define All The Methods Related To Data Handling
 *
 * [init] parpare data
 * [update3dData] update data (x1, y1, z1) moves to (x2, y2, z2)
 * [get2dData] get data from origin data that 2d scatter needed
 * [update2dData] update data (x1, y1) moves to (x2, y2)
 * [sort] based on the y values to sort x
 * [save2dChanges] when user click save button to save changes to 3d data
 * [getNextPosition] when save2dChanges sometimes exists a change dependency and this method will find whether the same old value in following changes
 */
var dataHandler = {
    init: function () {
        var data = null;
        var colNames = [];
        var colTypes = [];
        var i = 0;

        // get data from localStorage
        if (window.localStorage) {
            data = JSON.parse(localStorage.getItem('VS_DATA') ? localStorage.getItem('VS_DATA') : '');
            colNames = localStorage.getItem('VS_COL_NAMES').split(',');
            colTypes = localStorage.getItem('VS_COL_TYPES').split(',');
            dataCase = parseInt(localStorage.getItem('VS_DATA_CASE'));
        } else {
            alert('LocalStorage is not supported.');
            return;
        }

        chart.count = data.v1.length;
        for (i = 0; i < chart.count; i++) {
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

        // set other chart options
        chart.axises.x.length = chart.axises.x.max - chart.axises.x.min;
        chart.axises.y.length = chart.axises.y.max - chart.axises.y.min;
        chart.axises.z.length = chart.axises.z.max - chart.axises.z.min;
        $('#rx .rMin').html(chart.axises.x.min);
        $('#ry .rMin').html(chart.axises.y.min);
        $('#rz .rMin').html(chart.axises.z.min);
        $('#rx .rMax').html(chart.axises.x.max);
        $('#ry .rMax').html(chart.axises.y.max);
        $('#rz .rMax').html(chart.axises.z.max);

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
    },
    update3dData: function (x1, y1, z1, x2, y2, z2) {
        for (var i = 0; i < scatter3dData.length; i++) {
            var nowX = scatter3dData[i][0];
            var nowY = scatter3dData[i][1];
            var nowZ = scatter3dData[i][2];

            if (x1 > x2) {
                // move the point to front
                if (nowX >= x2 && nowX < x1) {
                    scatter3dData[i][0] = nowX + 1;
                    originData[i][0] = nowX + 1;
                } else if (nowX == x1) {
                    scatter3dData[i][0] = x2;
                    originData[i][0] = x2;
                }
            } else if (x1 < x2) {
                // move the point to end
                if (nowX <= x2 && nowX > x1) {
                    scatter3dData[i][0] = nowX - 1;
                    originData[i][0] = nowX - 1;
                } else if (nowX == x1) {
                    scatter3dData[i][0] = x2;
                    originData[i][0] = x2;
                }
            }

            if (y1 > y2) {
                if (nowY >= y2 && nowY < y1) {
                    scatter3dData[i][1] = nowY + 1;
                    originData[i][1] = nowY + 1;
                } else if (nowY == y1) {
                    scatter3dData[i][1] = y2;
                    originData[i][1] = y2;
                }
            } else if (y1 < y2) {
                if (nowY <= y2 && nowY > y1) {
                    scatter3dData[i][1] = nowY - 1;
                    originData[i][1] = nowY - 1;
                } else if (nowY == y1) {
                    scatter3dData[i][1] = y2;
                    originData[i][1] = y2;
                }
            }

            if (z1 > z2) {
                if (nowZ >= z2 && nowZ < z1) {
                    scatter3dData[i][2] = nowZ + 1;
                    originData[i][2] = nowZ + 1;
                } else if (nowZ == z1) {
                    scatter3dData[i][2] = z2;
                    originData[i][2] = z2;
                }
            } else if (z1 < z2) {
                if (nowZ <= z2 && nowZ > z1) {
                    scatter3dData[i][2] = nowZ - 1;
                    originData[i][2] = nowZ - 1;
                } else if (nowZ == z1) {
                    scatter3dData[i][2] = z2;
                    originData[i][2] = z2;
                }
            }            
        }
    },
    get2dData: function (type, value) {
        var i = 0;
        var j = 0;

        switch (type) {
            case TYPE_OF_2D.BASE_X:
                for (i = 0; i < chart.count; i++) {
                    var x = originData[i][0];

                    if (x == value) {
                        var y = originData[i][1];
                        var z = originData[i][2];
                        var yText = originData[i][4];
                        var zText = originData[i][5];
                        scatter2dData[j] = new Array();

                        scatter2dData[j][0] = z; // z goes to x
                        scatter2dData[j][1] = y; // y stays y
                        scatter2dData[j][2] = zText;
                        scatter2dData[j][3] = yText;
                        scatter2dData[j][4] = z; // keep origin value
                        scatter2dData[j][5] = y;

                        j++
                    }
                }
                break;
            case TYPE_OF_2D.BASE_Y:
                for (i = 0; i < chart.count; i++) {
                    var y = originData[i][1];

                    if (y == value) {
                        var x = originData[i][0];
                        var z = originData[i][2];
                        var xText = originData[i][3];
                        var zText = originData[i][5];
                        scatter2dData[j] = new Array();

                        scatter2dData[j][0] = x; // x stays x
                        scatter2dData[j][1] = z; // z goes to y
                        scatter2dData[j][2] = xText;
                        scatter2dData[j][3] = zText;
                        scatter2dData[j][4] = x; // keep origin value
                        scatter2dData[j][5] = z;

                        j++
                    }
                }
                break;
            case TYPE_OF_2D.BASE_Z:
                for (i = 0; i < chart.count; i++) {
                    var z = originData[i][2];

                    if (z == value) {
                        var x = originData[i][0];
                        var y = originData[i][1];
                        var xText = originData[i][3];
                        var yText = originData[i][4];
                        scatter2dData[j] = new Array();

                        scatter2dData[j][0] = x; // x stays x
                        scatter2dData[j][1] = y; // z stays y
                        scatter2dData[j][2] = xText;
                        scatter2dData[j][3] = yText;
                        scatter2dData[j][4] = x; // keep origin value
                        scatter2dData[j][5] = y;

                        j++
                    }
                }
                break;
            case TYPE_OF_2D.BASE_MERGE_X:
                chart.maxy = 0;
                var k = 0;
                for (i = 0; i < chart.count; i++) {
                    var count = 0;
                    for (j = 0; j < scatter2dData.length; j++) {
                        // find if originData[i] in scatter2dData
                        // if exists, add the y value
                        if (originData[i][2] == scatter2dData[j][0]) {
                            scatter2dData[j][1] += originData[i][1];
                            count++;
                        }

                        if (scatter2dData[j][1] > chart.maxy) {
                            chart.maxy = scatter2dData[j][1];
                        }
                    }

                    // if not exists, new a array to store originData[i]
                    if (count == 0) {
                        scatter2dData[k] = new Array();
                        scatter2dData[k][0] = originData[i][2];
                        scatter2dData[k][1] = originData[i][1];
                        scatter2dData[k][2] = originData[i][5];
                        scatter2dData[k][3] = originData[i][4];
                        scatter2dData[k][4] = originData[i][2];
                        scatter2dData[k][5] = originData[i][1];
                        k++;
                    }
                }

                // scatter2dData[i][3] = scatter2dData[i][1]
                // because y can be added, scatter2dData[i][3] represents ytext
                for (i = 0; i < scatter2dData.length; i++) {
                    scatter2dData[i][3] = scatter2dData[i][1];
                    scatter2dData[i][5] = scatter2dData[i][1];
                }
                break;
            case TYPE_OF_2D.BASE_MERGE_Y:
                chart.maxy = 0;
                var k = 0;
                for (i = 0; i < chart.count; i++) {
                    var count = 0;
                    for (j = 0; j < scatter2dData.length; j++) {
                        if (originData[i][0] == scatter2dData[j][0]) {
                            scatter2dData[j][1] += originData[i][2];
                            count++;
                        }

                        if (scatter2dData[j][1] > chart.maxy) {
                            chart.maxy = scatter2dData[j][1];
                        }
                    }

                    if (count == 0) {
                        scatter2dData[k] = new Array();
                        scatter2dData[k][0] = originData[i][0];
                        scatter2dData[k][1] = originData[i][2];
                        scatter2dData[k][2] = originData[i][3];
                        scatter2dData[k][3] = originData[i][5];
                        scatter2dData[k][4] = originData[i][0];
                        scatter2dData[k][5] = originData[i][2];
                        k++;
                    }
                }

                for (i = 0; i < scatter2dData.length; i++) {
                    scatter2dData[i][3] = scatter2dData[i][1];
                    scatter2dData[i][5] = scatter2dData[i][1];
                }
                break;
            case TYPE_OF_2D.BASE_MERGE_Z:
                chart.maxy = 0;
                var k = 0;
                for (i = 0; i < chart.count; i++) {
                    var count = 0;
                    for (j = 0; j < scatter2dData.length; j++) {
                        if (originData[i][0] == scatter2dData[j][0]) {
                            scatter2dData[j][1] += originData[i][1];
                            count++;
                        }

                        if (scatter2dData[j][1] > chart.maxy) {
                            chart.maxy = scatter2dData[j][1];
                        }
                    }

                    if (count == 0) {
                        scatter2dData[k] = new Array();
                        scatter2dData[k][0] = originData[i][0];
                        scatter2dData[k][1] = originData[i][1];
                        scatter2dData[k][2] = originData[i][3];
                        scatter2dData[k][3] = originData[i][4];
                        scatter2dData[k][4] = originData[i][0];
                        scatter2dData[k][5] = originData[i][1];
                        k++;
                    }
                }
                
                for (i = 0; i < scatter2dData.length; i++) {
                    scatter2dData[i][3] = scatter2dData[i][1];
                    scatter2dData[i][5] = scatter2dData[i][1];
                }
                break;
        }
    },
    update2dData: function (x1, y1, x2, y2) {
        for (var i = 0; i < scatter2dData.length; i++) {
            var nowX = scatter2dData[i][0];
            var nowY = scatter2dData[i][1];

            if (x1 > x2) {
                // move the point to front
                if (nowX >= x2 && nowX < x1) {
                    scatter2dData[i][0] = nowX + 1;
                } else if (nowX == x1) {
                    scatter2dData[i][0] = x2;
                }
            } else if (x1 < x2) {
                // move the point to end
                if (nowX <= x2 && nowX > x1) {
                    scatter2dData[i][0] = nowX - 1;
                } else if (nowX == x1) {
                    scatter2dData[i][0] = x2;
                }
            }

            if (y1 > y2) {
                if (nowY >= y2 && nowY < y1) {
                    scatter2dData[i][1] = nowY + 1;
                } else if (nowY == y1) {
                    scatter2dData[i][1] = y2;
                }
            } else if (y1 < y2) {
                if (nowY <= y2 && nowY > y1) {
                    scatter2dData[i][1] = nowY - 1;
                } else if (nowY == y1) {
                    scatter2dData[i][1] = y2;
                }
            }
        }
    },
    sort: function (type) {
        var i = 0;
        var j = 0;

        // sort the scatter2dData but not effective for the chart display
        for (i = 0; i < scatter2dData.length - 1; i++) {
            for (j = 0; j < scatter2dData.length; j++) {
                if(type == 'ASC' ? (scatter2dData[j][1] > scatter2dData[i][1]) : (scatter2dData[j][1] < scatter2dData[i][1])) {
                    var tmp = scatter2dData[j];
                    scatter2dData[j] = scatter2dData[i];
                    scatter2dData[i] = tmp;
                }
            }
        }

        // change the x value of 2d chart to enable the sort
        // 1. find the minX and maxX
        var minX = 0;
        switch (typeOf2d) {
            case TYPE_OF_2D.BASE_X:
            case TYPE_OF_2D.BASE_MERGE_X:
                minX = chart.axises.z.min;
                break;
            case TYPE_OF_2D.BASE_Y:
            case TYPE_OF_2D.BASE_MERGE_Y:
            case TYPE_OF_2D.BASE_Z:
            case TYPE_OF_2D.BASE_MERGE_Z:
                minX = chart.axises.x.min;
                break;
        }
        // 2. update the x value of 2d chart based on the minX and maxX
        for (i = 0; i < scatter2dData.length; i++) {
            scatter2dData[i][0] = i + minX;
        }
    },
    save2dChanges: function () {
        var list = new Array();     // the list for exchange new value and old value
        var clist = new Array();    // the list that one point is the head of circle
        var tmp = new Array();
        var k = 0;  // for tmp
        var n = 0;  // for clist
        var i = 0;
        var j = 0;

        // find x exchange list
        for (i = 0; i < scatter2dData.length; i++) {
            if (list.indexOf(i) == -1 && clist.indexOf(i)) {
                tmp[k] = i;
                var next = this.getNextPosition(i + 1, scatter2dData[i][0], 'X');

                while (next != -1) {
                    if (scatter2dData[next][0] == scatter2dData[i][4]) {
                        clist[n++] = next;
                        break;
                    }

                    tmp[++k] = next;
                    next = this.getNextPosition(i + 1, scatter2dData[next][0], 'X');
                }

                tmp = tmp.reverse();
                list = list.concat(tmp);
                k = 0;
                tmp = [];
            }
        }

        // exchange x values
        for (i = 0; i < list.length; i++) {
            var xold = scatter2dData[list[i]][4];
            var xnew = scatter2dData[list[i]][0];

            for (j = 0; j < chart.count; j++) {
                // different type, x represents different axis in 3d chart
                switch (typeOf2d) {
                    case TYPE_OF_2D.BASE_X:
                    case TYPE_OF_2D.BASE_MERGE_X:
                        // 2d x represents 3d z
                        if (originData[j][2] == xold) {
                            originData[j][2] = xnew;
                            scatter3dData[j][2] = xnew;
                        } else if (originData[j][2] == xnew) {
                            originData[j][2] = xold;
                            scatter3dData[j][2] = xold;
                        }
                        break;
                    case TYPE_OF_2D.BASE_Y:
                    case TYPE_OF_2D.BASE_MERGE_Y:
                    case TYPE_OF_2D.BASE_Z:
                    case TYPE_OF_2D.BASE_MERGE_Z:
                        // 2d x represents 3d x
                        if (originData[j][0] == xold) {
                            originData[j][0] = xnew;
                            scatter3dData[j][0] = xnew;
                        } else if (originData[j][0] == xnew) {
                            originData[j][0] = xold;
                            scatter3dData[j][0] = xold;
                        }
                        break;
                }
            }
        }

        // for some cases, we need exchange y values
        if (dataCase == DATA_CASES.DIGITAL_ZERO_TEXT_THREE || (dataCase == DATA_CASES.DIGITAL_ONE_TEXT_TW0 && typeOf2d == TYPE_OF_2D.BASE_Y)) {
            list = [];
            clist = [];
            tmp = [];
            k = 0;
            n = 0;

            // find the y exchange list first
            for (i = 0; i < scatter2dData.length; i++) {
                if (list.indexOf(i) == -1 && clist.indexOf(i)) {
                    tmp[k] = i;
                    var next = this.getNextPosition(i + 1, scatter2dData[i][1], 'Y');

                    while (next != -1) {
                        if (scatter2dData[next][1] == scatter2dData[i][5]) {
                            clist[n++] = next;
                            break;
                        }

                        tmp[++k] = next;
                        next = this.getNextPosition(i + 1, this.scatter2dData[next][1], 'Y');
                    }

                    tmp = tmp.reverse();
                    list = list.concat(tmp);
                    k = 0;
                    tmp = [];
                }
            }

            // exchange y values
            for (i = 0; i < list.length; i++) {
                var yold = scatter2dData[list[i]][5];
                var ynew = scatter2dData[list[i]][1];

                for (j = 0; j < chart.count; j++) {
                    // different type, y represents different axis in 3d chart
                    switch (typeOf2d) {
                        case TYPE_OF_2D.BASE_X:
                        case TYPE_OF_2D.BASE_MERGE_X:
                        case TYPE_OF_2D.BASE_Z:
                        case TYPE_OF_2D.BASE_MERGE_Z:
                            // 2d y represents 3d y
                            if (originData[j][1] == yold) {
                                originData[j][1] = ynew;
                                scatter3dData[j][1] = ynew;
                            } else if (originData[j][1] == ynew) {
                                originData[j][1] = yold;
                                scatter3dData[j][1] = yold;
                            }
                            break;
                        case TYPE_OF_2D.BASE_Y:
                        case TYPE_OF_2D.BASE_MERGE_Y:
                            // 2d y represents 3d z
                            if (originData[j][2] == yold) {
                                originData[j][2] = ynew;
                                scatter3dData[j][2] = ynew;
                            } else if (originData[j][2] == ynew) {
                                originData[j][2] = yold;
                                scatter3dData[j][2] = yold;
                            }
                            break;
                    }
                }
            }
        }
    },
    getNextPosition: function (index, value, type) {
        // type 'X' means we find x old values, scatter2dData[i][4]
        // type 'Y' means we find y old values, scatter2dData[i][5]
        for (var i = index; i < scatter2dData.length; i++) {
            // if the old value (will be replaced in the future) equals the value parma
            // if equals return the index in scatter2dData array
            // this kind of dependency will create a list
            // then when exchange the new value and old value, if there is a list, we will follow the list order
            if ((scatter2dData[i][4] == value && type == 'X') || (scatter2dData[i][5] == value && type == 'Y')) {
                return i;
            }
        }
        return -1;
    }
};

/**
 ***** Define All The Methods Related To Chart Handling
 *
 * [init3dChart] generate a new 3d chart and init some params
 * [init2dChart] generate a new 2d chart
 * [update] re-render a chart because of data change
 * [select3d] when one point is selected
 * [select2d] when one point is selected
 * [changeTo2d] 3d chart changes to 2d chart
 * [changeTo3d] 2d chart changes to 3d chart
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
                    viewDistance: 5,
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
                            click: function () {
                                chartHandler.select3d(this.x, this.y, this.z);
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
                        value: chart.zone*1/6,
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
            tooltip: {
                useHTML: true,
                formatter: function () {
                    var p = this.point;
                    var s = '(' + p.x + ', ' + p.y + ', ' + p.z + ')<br />';
                    s += '<br /><a href=\"javascript:chartHandler.changeTo2d(' + TYPE_OF_2D.BASE_X + ', ' + p.x + ')\">To 2D Section : x = ' + p.x + '</a>';
                    s += '<br /><a href=\"javascript:chartHandler.changeTo2d(' + TYPE_OF_2D.BASE_Y + ', ' + p.y + ')\">To 2D Section : y = ' + p.y + '</a>';
                    s += '<br /><a href=\"javascript:chartHandler.changeTo2d(' + TYPE_OF_2D.BASE_Z + ', ' + p.z + ')\">To 2D Section : z = ' + p.z + '</a>';
                    return s;
                }
            },
            series: [{
                data: scatter3dData,
                turboThreshold: chart.count + 1
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
                sensitivity = 10; // lower is more sensitive

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
                $('#xpre').prop('disabled', true);
                $('#xnext').prop('disabled', true);
                $('#ypre').prop('disabled', true);
                $('#ynext').prop('disabled', true);
                $('#zpre').prop('disabled', true);
                $('#znext').prop('disabled', true);
                break;
            case DATA_CASES.DIGITAL_TWO_TEXT_ONE:
                $('#ypre').prop('disabled', true);
                $('#ynext').prop('disabled', true);
                $('#zpre').prop('disabled', true);
                $('#znext').prop('disabled', true);
                break;
            case DATA_CASES.DIGITAL_ONE_TEXT_TW0:
                $('#ypre').prop('disabled', true);
                $('#ynext').prop('disabled', true);
                $('#btnMergeY').prop('disabled', true);
                break;
            case DATA_CASES.DIGITAL_ZERO_TEXT_THREE:
                $('#btnMergeX').prop('disabled', true);
                $('#btnMergeY').prop('disabled', true);
                $('#btnMergeZ').prop('disabled', true);
                break;
        }
    },
    init2dChart: function (type, value) {
        typeOf2d = type;
        // form scatter2dData
        dataHandler.get2dData(type, value);

        // generate 2d chart
        switch (type) {
            case TYPE_OF_2D.BASE_X:
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
                    subtitle: {
                        text: 'x = <span style=\"color: #fc7408; font-weight: bold\">' + value + '</span>'
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
                        min: chart.axises.z.min,
                        max: chart.axises.z.max,
                        title: {
                            text: chart.axises.z.title,
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
                                var s = 'x represents <b>' + chart.axises.z.title + '</b>, y represents <b>' + chart.axises.y.title + '</b><br />';
                                s += '(x, y) = (' + this.x + ', ' + this.y + ')<br />';
                                if (dataCase == DATA_CASES.DIGITAL_ONE_TEXT_TW0 || dataCase == DATA_CASES.DIGITAL_ZERO_TEXT_THREE) {
                                    s += '<br /><a href=\"javascript:moveHandler.moveStart(' + this.x + ',' + this.y + ',' + (this.point.plotX + 450) + ',' + (this.point.plotY + 100) + ')\">Change Position?</a>';
                                }
                                return s;
                            }
                            return false;
                        }
                    },
                    series: [{
                        data: scatter2dData,
                        turboThreshold: chart.count + 1
                    }]
                });
                break;
            case TYPE_OF_2D.BASE_Y:
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
                    subtitle: {
                        text: 'y = <span style=\"color: #fc7408; font-weight: bold\">' + value + '</span>'
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
                    tooltip: {
                        useHTML: true,
                        formatter: function () {
                            if (!chart.movingPoint.isMoving) {
                                var s = 'x represents <b>' + chart.axises.x.title + '</b>, y represents <b>' + chart.axises.z.title + '</b><br />';
                                s += '(x, y) = (' + this.x + ', ' + this.y + ')<br />';
                                if (dataCase != DATA_CASES.DIGITAL_THREE_TEXT_ZERO) {
                                    s += '<br /><a href=\"javascript:moveHandler.moveStart(' + this.x + ',' + this.y + ',' + (this.point.plotX + 450) + ',' + (this.point.plotY + 100) + ')\">Change Position?</a>';
                                }
                                return s;
                            }
                            return false;
                        }
                    },
                    series: [{
                        data: scatter2dData,
                        turboThreshold: chart.count + 1
                    }]
                });
                break;
            case TYPE_OF_2D.BASE_Z:
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
                    subtitle: {
                        text: 'z = <span style=\"color: #fc7408; font-weight: bold\">' + value + '</span>'
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
                                if (dataCase != DATA_CASES.DIGITAL_THREE_TEXT_ZERO) {
                                    s += '<br /><a href=\"javascript:moveHandler.moveStart(' + this.x + ',' + this.y + ',' + (this.point.plotX + 450) + ',' + (this.point.plotY + 100) + ')\">Change Position?</a>';
                                }
                                return s;
                            }
                            return false;
                        }
                    },
                    series: [{
                        data: scatter2dData,
                        turboThreshold: chart.count + 1
                    }]
                });
                break;
            case TYPE_OF_2D.BASE_MERGE_X:
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
                    subtitle: {
                        text: 'Merge X : Sum(Y)'
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
                        min: chart.axises.z.min,
                        max: chart.axises.z.max,
                        title: {
                            text: chart.axises.z.title,
                        }
                    },
                    yAxis: {
                        min: chart.axises.y.min,
                        max: chart.maxy,
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
                                var s = 'x represents <b>' + chart.axises.z.title + '</b>, y represents <b>' + chart.axises.y.title + '</b><br />';
                                s += '(x, y) = (' + this.x + ', ' + this.y + ')<br />';
                                if (dataCase == DATA_CASES.DIGITAL_ONE_TEXT_TW0 || dataCase == DATA_CASES.DIGITAL_ZERO_TEXT_THREE) {
                                    s += '<br /><a href=\"javascript:moveHandler.moveStart(' + this.x + ',' + this.y + ',' + (this.point.plotX + 450) + ',' + (this.point.plotY + 100) + ')\">Change Position?</a>';
                                }
                                return s;
                            }
                            return false;
                        }
                    },
                    series: [{
                        data: scatter2dData,
                        turboThreshold: chart.count + 1
                    }]
                });
                break;
            case TYPE_OF_2D.BASE_MERGE_Y:
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
                    subtitle: {
                        text: 'Merge Y : Sum(Z)'
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
                        min: chart.axises.z.min,
                        max: chart.maxy,
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
                    tooltip: {
                        useHTML: true,
                        formatter: function () {
                            if (!chart.movingPoint.isMoving) {
                                var s = 'x represents <b>' + chart.axises.x.title + '</b>, y represents <b>' + chart.axises.z.title + '</b><br />';
                                s += '(x, y) = (' + this.x + ', ' + this.y + ')<br />';
                                if (dataCase != DATA_CASES.DIGITAL_THREE_TEXT_ZERO) {
                                    s += '<br /><a href=\"javascript:moveHandler.moveStart(' + this.x + ',' + this.y + ',' + (this.point.plotX + 450) + ',' + (this.point.plotY + 100) + ')\">Change Position?</a>';
                                }
                                return s;
                            }
                            return false;
                        }
                    },
                    series: [{
                        data: scatter2dData,
                        turboThreshold: chart.count + 1
                    }]
                });
                break;
            case TYPE_OF_2D.BASE_MERGE_Z:
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
                    subtitle: {
                        text: 'Merge Z : Sum(Y)'
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
                        max: chart.maxy,
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
                                if (dataCase != DATA_CASES.DIGITAL_THREE_TEXT_ZERO) {
                                    s += '<br /><a href=\"javascript:moveHandler.moveStart(' + this.x + ',' + this.y + ',' + (this.point.plotX + 450) + ',' + (this.point.plotY + 100) + ')\">Change Position?</a>';
                                }
                                return s;
                            }
                            return false;
                        }
                    },
                    series: [{
                        data: scatter2dData,
                        turboThreshold: chart.count + 1
                    }]
                });
                break;
        }
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

        $('#spSelected').html('NOTHING SELECTED');
        $('#spXInfo').html('x : NOTHING SELECTED');
        $('#spYInfo').html('y : NOTHING SELECTED');
        $('#spZInfo').html('z : NOTHING SELECTED');
        $('#spSelectedS').html('NOTHING SELECTED');
        $('#spXInfoS').html('x : NOTHING SELECTED');
        $('#spYInfoS').html('y : NOTHING SELECTED');
    },
    select3d: function (x, y, z) {
        chart.selectedPoint.x = x;
        chart.selectedPoint.y = y;
        chart.selectedPoint.z = z;

        $('#spSelected').html('(' + x + ', ' + y + ', ' + z + ')');

        for (var i = 0; i < chart.count; i++) {
            if(originData[i][0] == x && originData[i][1] == y && originData[i][2] == z){
                var xText = originData[i][3];
                var yText = originData[i][4];
                var zText = originData[i][5];
            }
        }
        $('#spXInfo').html(chart.axises.x.title + ' (' + x + ') : ' + xText);
        $('#spYInfo').html(chart.axises.y.title + ' (' + y + ') : ' + yText);
        $('#spZInfo').html(chart.axises.z.title + ' (' + z + ') : ' + zText);
    },
    select2d: function (x, y) {
        $('#spSelectedS').html('(' + x + ', ' + y + ')');

        for (var i = 0; i < scatter2dData.length; i++) {
            if (scatter2dData[i][0] == x && scatter2dData[i][1] == y) {
                var xText = scatter2dData[i][2];
                var yText = scatter2dData[i][3];
            }
        }

        switch (typeOf2d) {
            case TYPE_OF_2D.BASE_X:
            case TYPE_OF_2D.BASE_MERGE_X:
                $('#spXInfoS').html(chart.axises.z.title + ' (' + x + ') : ' + xText);
                $('#spYInfoS').html(chart.axises.y.title + ' (' + y + ') : ' + yText);
                break;
            case TYPE_OF_2D.BASE_Y:
            case TYPE_OF_2D.BASE_MERGE_Y:
                $('#spXInfoS').html(chart.axises.x.title + ' (' + x + ') : ' + xText);
                $('#spYInfoS').html(chart.axises.z.title + ' (' + y + ') : ' + yText);
                break;
            case TYPE_OF_2D.BASE_Z:
            case TYPE_OF_2D.BASE_MERGE_Z:
                $('#spXInfoS').html(chart.axises.x.title + ' (' + x + ') : ' + xText);
                $('#spYInfoS').html(chart.axises.y.title + ' (' + y + ') : ' + yText);
                break;
        }
    },
    changeTo2d: function (type, value) {
        $('#chart3d').hide();
        $('#contentT').hide();
        $('#btnMergeX').hide();
        $('#btnMergeY').hide();
        $('#btnMergeZ').hide();
        $('#chart2d').fadeIn();
        $('#contentS').fadeIn();
        $('#btnSave').fadeIn();
        $('#btnCancel').fadeIn();

        // generate the chart
        this.init2dChart(type, value);

        // set default operations
        $('#sortAsc').prop('disabled', true);
        $('#sortDesc').prop('disabled', true);
        // only enabled when merge
        switch (dataCase) {
            case DATA_CASES.DIGITAL_TWO_TEXT_ONE:
                if (typeOf2d == TYPE_OF_2D.BASE_MERGE_Y || typeOf2d == TYPE_OF_2D.BASE_MERGE_Z) {
                    $('#sortAsc').prop('disabled', false);
                    $('#sortDesc').prop('disabled', false);
                }
                break;
            case DATA_CASES.DIGITAL_ONE_TEXT_TW0:
                if (typeOf2d == TYPE_OF_2D.BASE_MERGE_X || typeOf2d == TYPE_OF_2D.BASE_MERGE_Z) {
                    $('#sortAsc').prop('disabled', false);
                    $('#sortDesc').prop('disabled', false);
                }
                break;
        }
    },
    changeTo3d: function (type) {
        if (type == 'SAVE') {
            dataHandler.save2dChanges();
            this.update(chart3d, scatter3dData);
        }

        // destory 2d chart
        chart2d.destroy();
        chart2d = null;
        scatter2dData = [];
        typeOf2d = 0;
        chart.maxy = 0;
        chart.movingPoint.isMoving = false;
        chart.movingPoint.point.x = -1;
        chart.movingPoint.point.y = -1;
        chart.movingPoint.client.x = -1;
        chart.movingPoint.client.y = -1;

        $('#spSelectedS').html('NOTHING SELECTED');
        $('#spXInfoS').html('x : NOTHING SELECTED');
        $('#spYInfoS').html('y : NOTHING SELECTED');

        $('#moveDot').hide();
        $('#moveInfo').hide();
        $('#btnSave').hide();
        $('#btnCancel').hide();
        $('#chart2d').hide();
        $('#contentS').hide();
        $('#chart3d').fadeIn();
        $('#contentT').fadeIn();
        $('#btnMergeX').fadeIn();
        $('#btnMergeY').fadeIn();
        $('#btnMergeZ').fadeIn();
        $('#chart2d .highcharts-tooltip').show();
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
            switch (dataCase) {
                case DATA_CASES.DIGITAL_TWO_TEXT_ONE:
                    y = chart.movingPoint.client.y;
                    break;
                case DATA_CASES.DIGITAL_ONE_TEXT_TW0:
                    if (typeOf2d != TYPE_OF_2D.BASE_Y && typeOf2d != TYPE_OF_2D.BASE_MERGE_Y) {
                        y = chart.movingPoint.client.y;
                    }
                    break;
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

            switch (dataCase) {
                case DATA_CASES.DIGITAL_TWO_TEXT_ONE:
                    py = chart.movingPoint.point.y;
                    px = px < chart.axises.x.min ? chart.axises.x.min : px;
                    px = px > chart.axises.x.max ? chart.axises.x.max : px;
                    break;
                case DATA_CASES.DIGITAL_ONE_TEXT_TW0:
                    if (typeOf2d != TYPE_OF_2D.BASE_Y && typeOf2d != TYPE_OF_2D.BASE_MERGE_Y) {
                        py = chart.movingPoint.point.y;
                        if (typeOf2d == TYPE_OF_2D.BASE_X || typeOf2d == TYPE_OF_2D.BASE_MERGE_X) {
                            px = px < chart.axises.z.min ? chart.axises.z.min : px;
                            px = px > chart.axises.z.max ? chart.axises.z.max : px;
                        }
                        if (typeOf2d == TYPE_OF_2D.BASE_Z || typeOf2d == TYPE_OF_2D.BASE_MERGE_Z) {
                            px = px < chart.axises.x.min ? chart.axises.x.min : px;
                            px = px > chart.axises.x.max ? chart.axises.x.max : px;
                        }
                    } else {
                        px = px < chart.axises.x.min ? chart.axises.x.min : px;
                        px = px > chart.axises.x.max ? chart.axises.x.max : px;
                        py = py < chart.axises.z.min ? chart.axises.z.min : py;
                        py = py > chart.axises.z.max ? chart.axises.z.max : py;
                    }
                    break;
                case DATA_CASES.DIGITAL_ZERO_TEXT_THREE:
                    if (typeOf2d == TYPE_OF_2D.BASE_X || typeOf2d == TYPE_OF_2D.BASE_MERGE_X) {
                        px = px < chart.axises.z.min ? chart.axises.z.min : px;
                        px = px > chart.axises.z.max ? chart.axises.z.max : px;
                        py = py < chart.axises.y.min ? chart.axises.y.min : py;
                        py = py > chart.axises.y.max ? chart.axises.y.max : py;
                    }
                    if (typeOf2d == TYPE_OF_2D.BASE_Y || typeOf2d == TYPE_OF_2D.BASE_MERGE_Y) {
                        px = px < chart.axises.x.min ? chart.axises.x.min : px;
                        px = px > chart.axises.x.max ? chart.axises.x.max : px;
                        py = py < chart.axises.z.min ? chart.axises.z.min : py;
                        py = py > chart.axises.z.max ? chart.axises.z.max : py;
                    }
                    if (typeOf2d == TYPE_OF_2D.BASE_Z || typeOf2d == TYPE_OF_2D.BASE_MERGE_Z) {
                        px = px < chart.axises.x.min ? chart.axises.x.min : px;
                        px = px > chart.axises.x.max ? chart.axises.x.max : px;
                        py = py < chart.axises.y.min ? chart.axises.y.min : py;
                        py = py > chart.axises.y.max ? chart.axises.y.max : py;
                    }
                    break;
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
        chartHandler.update(chart2d, scatter2dData);

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

    // when first load shows the 3d scatter chart
    // init the 3d scatter chart
    chartHandler.init3dChart();

    // init range set dots
    var rDots = document.querySelectorAll('.rDot');
    for(var i = 0; i < rDots.length; i++) {
        new Dot(rDots[i]);
    }
    $('.rItem').hover(function () {
        var l = parseInt($(this).children('.dMin').css('left').replace(/[a-z][A-Z]/ig, '')) + 5,
            r = parseInt($(this).children('.dMax').css('left').replace(/[a-z][A-Z]/ig, '')) + 5,
            pl = 0,
            pr = 0,
            id = $(this).attr('id');

        if(id == 'rx'){
            pl = Math.round(l / 260 * chart.axises.x.length) + 1;
            pr = Math.round(r / 260 * chart.axises.x.length) + 1;
        }else if(id == 'ry'){
            pl = Math.round(l / 260 * chart.axises.y.length) + 1;
            pr = Math.round(r / 260 * chart.axises.y.length) + 1;
        }else{
            pl = Math.round(l / 260 * chart.axises.z.length) + 1;
            pr = Math.round(r / 260 * chart.axises.z.length) + 1;
        }

        $(this).children('.float').css('left', (r - l)/2 + l - 45).html('[ ' + pl + ' - ' + pr + ' ]').show();
    },function () {
        $(this).children('.float').hide();
    });

    // 3d chart btn click
    $('#xpre').click(function () {
        var p = chart.selectedPoint;
        if (p.x == -1 && p.y == -1 && p.z == -1) {
            alert("Nothing Selected!");
            return;
        }
        if (p.x - 1 < chart.axises.x.min) {
            alert("Aready Boundary!");
            return;
        }

        dataHandler.update3dData(p.x, p.y, p.z, p.x - 1, p.y, p.z);
        chartHandler.update(chart3d, scatter3dData);
        chartHandler.select3d(p.x - 1, p.y, p.z);
    });
    $('#xnext').click(function () {
        var p = chart.selectedPoint;
        if (p.x == -1 && p.y == -1 && p.z == -1) {
            alert("Nothing Selected!");
            return;
        }
        if (p.x + 1 > chart.axises.x.max) {
            alert("Aready Boundary!");
            return;
        }

        dataHandler.update3dData(p.x, p.y, p.z, p.x + 1, p.y, p.z);
        chartHandler.update(chart3d, scatter3dData);
        chartHandler.select3d(p.x + 1, p.y, p.z);
    });
    $('#ypre').click(function () {
        var p = chart.selectedPoint;
        if (p.x == -1 && p.y == -1 && p.z == -1) {
            alert("Nothing Selected!");
            return;
        }
        if (p.y - 1 < chart.axises.y.min) {
            alert("Aready Boundary!");
            return;
        }

        dataHandler.update3dData(p.x, p.y, p.z, p.x, p.y - 1, p.z);
        chartHandler.update(chart3d, scatter3dData);
        chartHandler.select3d(p.x, p.y - 1, p.z);
    });
    $('#ynext').click(function () {
        var p = chart.selectedPoint;
        if (p.x == -1 && p.y == -1 && p.z == -1) {
            alert("Nothing Selected!");
            return;
        }
        if (p.y + 1 > chart.axises.y.max) {
            alert("Aready Boundary!");
            return;
        }

        dataHandler.update3dData(p.x, p.y, p.z, p.x, p.y + 1, p.z);
        chartHandler.update(chart3d, scatter3dData);
        chartHandler.select3d(p.x, p.y + 1, p.z);
    });
    $('#zpre').click(function () {
        var p = chart.selectedPoint;
        if (p.x == -1 && p.y == -1 && p.z == -1) {
            alert("Nothing Selected!");
            return;
        }
        if (p.z - 1 < chart.axises.z.min) {
            alert("Aready Boundary!");
            return;
        }

        dataHandler.update3dData(p.x, p.y, p.z, p.x, p.y, p.z - 1);
        chartHandler.update(chart3d, scatter3dData);
        chartHandler.select3d(p.x, p.y, p.z - 1);
    });
    $('#znext').click(function () {
        var p = chart.selectedPoint;
        if (p.x == -1 && p.y == -1 && p.z == -1) {
            alert("Nothing Selected!");
            return;
        }
        if (p.z + 1 > chart.axises.z.max) {
            alert("Aready Boundary!");
            return;
        }

        dataHandler.update3dData(p.x, p.y, p.z, p.x, p.y, p.z + 1);
        chartHandler.update(chart3d, scatter3dData);
        chartHandler.select3d(p.x, p.y, p.z + 1);
    });
    $('#btnMergeX').click(function () {
        chartHandler.changeTo2d(TYPE_OF_2D.BASE_MERGE_X);
    });
    $('#btnMergeY').click(function () {
        chartHandler.changeTo2d(TYPE_OF_2D.BASE_MERGE_Y);
    });
    $('#btnMergeZ').click(function () {
        chartHandler.changeTo2d(TYPE_OF_2D.BASE_MERGE_Z);
    });

    // 2d chart btn click
    $('#btnSave').click(function () {
        if(!confirm("Are you sure to update the original data?")){
            return;
        }
        chartHandler.changeTo3d('SAVE');
    });
    $('#btnCancel').click(function () {
        chartHandler.changeTo3d('CANCEL');
    });
    $('#sortAsc').click(function () {
        dataHandler.sort('ASC');
        chartHandler.update(chart2d, scatter2dData);
    });
    $('#sortDesc').click(function () {
        dataHandler.sort('DESC');
        chartHandler.update(chart2d, scatter2dData);
    });

    // cluster
    $('#clusterSelector').change(function () {
        var value = parseInt($(this).val());
        switch (value) {
            case 1:
                // kmeans
                $('.dbscan').hide();
                $('.kmeans input').val('');
                $('.kmeans').show();
                break;
            case 2:
                // dbscan
                $('.kmeans').hide();
                $('.dbscan input').val('');
                $('.dbscan').show();
                break;
        }
    });
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

        // get originData inside the range
        var ax = chart.axises.x;
        var ay = chart.axises.y;
        var az = chart.axises.z;
        for (var i = 0; i < originData.length; i++) {
            if ((originData[i][0] < ax.min || originData[i][0] > ax.max) || 
                (originData[i][1] < ay.min || originData[i][1] > ay.max) ||
                (originData[i][2] < az.min || originData[i][2] > az.max)) {
                originData.splice(i, 1);
                i--;
            }
        }

        // store originData to a tmp file and let R to call the tmp file
        $.ajax({
            type: 'post',
            url: '/createFile',
            dataType: 'json',
            data: {
                //data: JSON.stringify(originData)
                data: localStorage.getItem('VS_TEMP')
            }
        })
        .done(function () {
            $.ajax({
                type: 'post',
                url: '/data/cluster',
                dataType: 'json',
                data: {
                    dim: 3,
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

                window.location.href = '3dcluster.html';
            })
            .fail(function () {
                alert('Data Cluster Failed.');
            })
        });
    });
});


/**
 ***** Range Set Dot *****
 */
function Dot(element){
    var rItem = $(element).parent();
    var info = $(rItem).children('.float');
    var l = 0, r = 0;
    var pl = 0, pr = 0;

    this.handleStart = function (e) {
        document.addEventListener('mousemove', this.handleMove);
        document.addEventListener('mouseup', this.handleEnd);
    }.bind(this);

    this.handleMove = function (e) {
        if(e.clientX <= 280 && e.clientX >= 20 && l <= r){
            $(element).css('left', e.clientX - 25 + 'px');
        }

        l = parseInt($(rItem).children('.dMin').css('left').replace(/[a-z][A-Z]/ig, '')) + 5;
        r = parseInt($(rItem).children('.dMax').css('left').replace(/[a-z][A-Z]/ig, '')) + 5;
        var id = $(element).parent().attr('id');

        if(id == 'rx'){
            pl = Math.round(l / 260 * chart.axises.x.length) + 1;
            pr = Math.round(r / 260 * chart.axises.x.length) + 1;
        }else if(id == 'ry'){
            pl = Math.round(l / 260 * chart.axises.y.length) + 1;
            pr = Math.round(r / 260 * chart.axises.y.length) + 1;
        }else{
            pl = Math.round(l / 260 * chart.axises.z.length) + 1;
            pr = Math.round(r / 260 * chart.axises.z.length) + 1;
        }

        $(info).css('left', (r - l)/2 + l - 45).html('[ ' + pl + ' - ' + pr + ' ]').show();
    }.bind(this);

    this.handleEnd = function (e) {
        if(e.clientX <= 280 && e.clientX >= 20 && l <= r){
            $(element).css('left', e.clientX - 25 + 'px');
        }
        document.removeEventListener('mousemove', this.handleMove);
        document.removeEventListener('mouseup', this.handleEnd);

        var axis = $(rItem).attr('id');
        if(axis == 'rx'){
            chart.axises.x.min = pl;
            chart.axises.x.max = pr;
            chart3d.xAxis[0].setExtremes(pl, pr);
        }else if(axis == 'ry'){
            chart.axises.y.min = pl;
            chart.axises.y.max = pr;
            chart3d.yAxis[0].setExtremes(pl, pr);
        }else{
            chart.axises.z.min = pl;
            chart.axises.z.max = pr;
            chart3d.zAxis[0].setExtremes(pl, pr);
        }
    }.bind(this);

    element.addEventListener('mousedown', this.handleStart);
}