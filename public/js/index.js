/**
 ***** the file that user uploads *****
 */
var file = {
    path: 'uploads/fe2d32e04d31f8834936272841dfc4e9',
    dim: 3,
    hasHeader: false,
    colNames: ['subject', 'word', 'count'],
    colTypes: [1, 1, 2],
    dataCase: 0
}

$(function () {
    // upload file
    $('#btnUpload').click(function () {
        $('#btnFileUpload').click();
    });
    $('#btnFileUpload').change(function () {
        $('#fileUpload').submit();
        $('#divUpload').hide();
        $('#loading').fadeIn();
    });

    // add or delete a column
    $('#divFile').on('click', '.del', function () {
        file.dim--;
        
        $(this).parent().prev().find('.op').eq(1).removeClass('none').addClass('add');
        if(file.dim > 2){
            $(this).parent().prev().find('.op').eq(0).removeClass('none').addClass('del');
        }
        $(this).parent().remove();
    });
    $('#divFile').on('click', '.add', function () {
        file.dim++;
        
        var str = '<p><span><b>COL' + file.dim + ' :</b></span>';
        str += '<input id=\"col' + file.dim + 'name\" type=\"text\" placeholder=\"The name of col' + file.dim + ' ...\" class=\"colname\" />';
        str += '<select id=\"col' + file.dim + 'type\" class=\"coltype\"><option value=\"1\">text</option><option value=\"2\">digit</option></select>';
        str += '<button class=\"op del\">-</button><button class=\"op add\">+</button></p>';
        $(this).parent().after(str);
        
        $(this).removeClass('add').addClass('none');
        $(this).prev().removeClass('del').addClass('none');
    });

    // click start button
    $('#btnStart').click(function () {
        $('#divFile').hide();
        $('#loading').fadeIn();
        
        // get columns' properties
        /*for (var i = 0; i < file.dim; i++) {
            file.colNames[i] = $('#col' + (i + 1) + 'name').val();
            file.colTypes[i] = parseInt($('#col' + (i + 1) + 'type').val());
        }

        // does the file has header
        file.hasHeader = $('#firstRowCheck').is(':checked');*/
        
        // define the data case
        switch (file.dim) {
            case 2:
                break;
            case 3:
                var colTypes = file.colTypes;
                if (colTypes[0] == 2 && colTypes[1] == 2 && colTypes[2] == 2) {
                    file.dataCase = 0;
                }
                if ((colTypes[0] == 2 && colTypes[1] == 2 && colTypes[2] == 1) ||
                    (colTypes[0] == 2 && colTypes[1] == 1 && colTypes[2] == 2) ||
                    (colTypes[0] == 1 && colTypes[1] == 2 && colTypes[2] == 2)) {
                    file.dataCase = 1;
                }
                if ((colTypes[0] == 2 && colTypes[1] == 1 && colTypes[2] == 1) ||
                    (colTypes[0] == 1 && colTypes[1] == 2 && colTypes[2] == 1) ||
                    (colTypes[0] == 1 && colTypes[1] == 1 && colTypes[2] == 2)) {
                    file.dataCase = 2;
                }
                if (colTypes[0] == 1 && colTypes[1] == 1 && colTypes[2] == 1) {
                    file.dataCase = 3;
                }
                break;
            default:
                break;
        }
        
        $.ajax({
            type: 'post',
            url: '/data/init',
            dataType: 'json',
            data: file
        })
        .then(function (res) {
            if (window.localStorage) {
                localStorage.setItem("VS_DATA", res);
                localStorage.setItem("VS_COL_NAMES", file.colNames.toString());
                localStorage.setItem("VS_DATA_CASE", file.dataCase);
            } else {
                alert("LocalStorage is not supported.");
            }

            $('#loading').hide();
            $('#divFile').fadeIn();

            switch (file.dim) {
                case 2:
                    break;
                case 3:
                    window.location.href = '3dscatter.html';
                    //window.location.href = '3dtest.html';
                    break;
                default:
                    break;
            }
        })
        .fail(function () {
            alert('Data Process Failed.');
            $('#loading').hide();
            $('#divFile').fadeIn();
        });
    });
});

/**
 ***** when the file uploads succeeds *****
 */
function uploadResult (path) {
    file.path = path;
    $('#loading').hide();
    $('#divFile').fadeIn();
}