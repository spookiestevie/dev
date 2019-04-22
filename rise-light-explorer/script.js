rise.nodeAddress = 'https://wallet.rise.vision';
//rise.nodeAddress = 'http://45.76.143.15:5555';
$( document ).ready(function() {
    $('#id_link').addClass('invisible');
    get_height();
    alert_success('Got height!');
    alert_warning('Waiting for a new block to get delegate info and id.');
    setInterval(get_height,5000);
});

function get_height(){
    $('#height').removeClass('animated rollIn');
    rise.blocks.getStatus(function(error, result) {
        if (!error) {
            let height = result["height"];
            let supply = result["supply"];
            let displayed_height = document.getElementById("height").innerHTML;
            if (parseInt(displayed_height) < parseInt(height)) {
                warning.close();//close warning when block updates
                alert_info('New block');
                height_id();
                $('#height').addClass('animated rollIn');//animate only on change
            } //else?
            $('#height').text(height); //get height value
            $('#supply').text(Math.round(supply/100000000) + ' RISE in circulation');
            $('#words').text(numberToWords.toWords(height) + ' blocks');
            return height, supply;
        } else {
            alert_error('Could not retrieve height, retrying...');
            console.log('error: ', error);
            get_height();//retry
        }
    });
}

function height_id() {
    rise.blocks.getBlocks({limit: 1, orderBy:"height:desc"}).then(function ({blocks}) {
        let id = blocks[0].id;
        let ntxs = blocks[0].numberOfTransactions;
        let txed = Math.round(blocks[0].totalAmount/100000000);
        let generatorPublicKey = blocks[0].generatorPublicKey;
        let id_link = 'https://explorer.rise.vision/block/' + id;
        get_delegate(generatorPublicKey);
        console.log(block_info(id));
        $('#id_link').removeClass('invisible').attr("href", id_link);//show and link to block
        $('#id').text('id: ' + id);
        $('#spinner').remove();
        $('#delegate_spinner').remove();
        $('#ntxs').text('Includes: '+ ntxs +' transaction/s');
        $('#txed').text('Transacted: ' + txed + ' RISE in this block');
        return id;
    }).catch(function (err) {
        alert_error('Could not retrieve latest block info, retrying...');
        console.log('Error: ', err); // handle error
        height_id();//retry
    })
}

function get_delegate(public_key){
    $('#forger').removeClass('animated fadeInRight');//remove to re-enable animation
    $('#rank').removeClass('animated fadeInRight');
    rise.delegates.getByPublicKey(public_key).then(function({ delegate }) {
        let username = delegate.username;
        let rank = delegate.rank;
        let delegate_link = 'https://explorer.rise.vision/address/' + delegate.address;
        $("#delegate").attr("href", delegate_link);
        $('#forger').text(username).addClass('animated fadeInRight');
        $('#rank').text(rank).addClass('animated fadeInRight');
        console.log(delegate);
        return username;
    })
        .catch(function(err) {
            alert_error('Could not retrieve delegate name, retrying...');
            console.log('Error: ', err); // handle error
            get_delegate(public_key);//retry
        })
}

function block_info(id) {
    rise.blocks.getBlock(id).then(function({ block }) {
        console.log(block);
        return block;
    })
        .catch(function(err) {
            alert_error('Could not retrieve block info, retrying...');
            console.log('Error: ', err); // handle error
            block_info(id);//retry
        })
}

function alert_success(message){
    $.notify({
        // options
        //icon: 'glyphicon glyphicon-warning-sign',
        title: 'Success: ',
        message: message
    },{
        // settings
        type: 'success',
        allow_dismiss: false,
        newest_on_top: false,
        delay: 5000,
        placement: {
            from: "bottom",
            align: "right"
        },
        animate: {
            enter: 'animated bounceIn',
            exit: 'animated bounceOut'
        }
    });
}

function alert_info(message){
    $.notify({
        // options
        //icon: 'glyphicon glyphicon-warning-sign',
        title: 'Info: ',
        message: message
    },{
        // settings
        type: 'info',
        allow_dismiss: false,
        newest_on_top: false,
        delay: 5000,
        placement: {
            from: "bottom",
            align: "right"
        },
        animate: {
            enter: 'animated bounceIn',
            exit: 'animated bounceOut'
        }
    });
}

function alert_error(message){
    $.notify({
        // options
        //icon: 'glyphicon glyphicon-warning-sign',
        title: 'Error: ',
        message: message
    },{
        // settings
        type: 'danger',
        allow_dismiss: false,
        newest_on_top: false,
        delay: 5000,
        placement: {
            from: "bottom",
            align: "right"
        },
        animate: {
            enter: 'animated bounceIn',
            exit: 'animated bounceOut'
        }
    });
}

function alert_warning(message){
    warning = $.notify({
        // options
        //icon: 'vendor/img/spinner.gif',
        title: '<div class="spinner-border spinner-border-sm" role="status">\n' +
            '  <span class="sr-only"></span>\n' +
            '</div>',
        message: message
    }, {
        // settings
        type: 'warning',
        allow_dismiss: false,
        newest_on_top: false,
        delay: 30000,
        //icon_type: 'image',
        placement: {
            from: "bottom",
            align: "right"
        },
        animate: {
            enter: 'animated bounceIn',
            exit: 'animated bounceOut'
        }
    });
}