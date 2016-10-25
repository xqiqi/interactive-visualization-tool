$(function () {
    var data = JSON.parse(localStorage.getItem('EDATA') ? localStorage.getItem('EDATA') : '');
    var str = '';
    for (var i = 0; i < data.length; i++) {
        if (data[i][2] == '报' || 
            data[i][2] == '转' || 
            data[i][2] == '款' || 
            data[i][2] == '汇' || 
            data[i][2] == '付' || 
            data[i][2] == '补') {
            str += '<tr class="others">';
        } else {
            str += '<tr>';
        }
        str += '<td align="center">' + (i + 1) + '</td>';
        str += '<td>' + data[i][0] + '</td>';
        str += '<td align="center">' + data[i][2] + '</td>';
        str += '<td align="center">' + data[i][1] + '</td>';
        str += '<td align="center"><input type="checkbox" class="isException" /></td></tr>';
    }

    $('#allExceptions tbody').append(str);
});