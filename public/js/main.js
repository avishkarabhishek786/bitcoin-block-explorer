const $ = require('jquery')
require('buffer') // comes in with browserify

$(document).on('click', '#blockhash-sub', function(e) {
  e.preventDefault();

  var blockhash = $('#_blockhash').val();

  $.ajax({
      url: "/getBlock",
      type: "post",
      data: {blockhash:blockhash} ,
      success: function (response) {
        //console.log(response);
          var t = '';
          t += '<div class="card">';
          t += '<div class="card-header">';
          Blockhash: response.hash
          t += '</div>';
          t += '<div class="card-body">';
          t += '<p> Confirmations: '+response.confirmations+'</p>';
          t += '<p> Size: '+response.size+'</p>';
          t += '<p> Height: '+response.height+'</p>';
          t += '<p> Merkel Root: '+response.merkleroot+'</p>';
          t += '<p> Time: '+response.time+'</p>';
          t += '<p> Nonce: '+response.nonce+'</p>';
          t += '<p> Previousblockhash'+response.previousblockhash+'</p>';
          t += '<p> Nextblockhash: '+response.nextblockhash+'</p>';
          t += '<h5>Transactions included: </h5>';
          if(response.tx.length>0) {
            for (var i = 0; i < response.tx.length; i++) {
              t += '<p> txid: '+response.tx[i].txid+'</p>';
              t += '<p> hash: '+response.tx[i].hash+'</p>';
              t += '<p> floData: '+response.tx[i].floData+'</p>';
              if (response.tx[i].vin.length > 0) {
                t += '<strong>vin: </strong>';
                t += '<ul>';
                for (var j = 0; j < response.tx[i].vin.length; j++) {
                  t += '<li> coinbase: '+response.tx[i].vin[j].coinbase+'</li>';
                  t += '<li> sequence: '+response.tx[i].vin[j].sequence+'</li>';
                }
                t += '</ul>';
              }
              if (response.tx[i].vout.length > 0) {
                t += '<strong>vout: </strong>';
                t += '<ul>';
                for (var k = 0; k < response.tx[i].vout.length; k++) {
                  t += '<li> value: '+response.tx[i].vout[k].value+'</li>';
                  t += '<li> n: '+response.tx[i].vout[k].n+'</li>';
                  t += '<li> scriptPubKey asm: '+response.tx[i].vout[k].scriptPubKey.asm+'</li>';
                  t += '<li> scriptPubKey type: '+response.tx[i].vout[k].scriptPubKey.type+'</li>';
                  t += '<li> scriptPubKey addrresses: </li>';
                  t += '<ul>';
                  if (typeof response.tx[i].vout[k].scriptPubKey.addresses !== 'undefined') {
                    for (var l = 0; l < response.tx[i].vout[k].scriptPubKey.addresses.length-1; l++) {
                      t += '<li> scriptPubKey addrress '+k+': '+response.tx[i].vout[k].scriptPubKey.addresses[l]+'</li>';
                    }
                  }
                  t += '<hr>';
                  t += '</ul>';
                }
                t += '</ul>';
              }

            }
          }

          t += '</div>';
          t += '</div>';

          $('#blockhash-result').html(t);
      },
      error: function(jqXHR, textStatus, errorThrown) {
         console.log(textStatus, errorThrown);
      }
  });

});

$(document).on('click', '#test-btn', function() {
  var priKey = "bffc7b9388275f89cac5a0f90b166440fbd9209656b866c4210478efbb8faeaf";
  var bbb = Buffer.from(priKey);
  console.log(bbb);
  const privateKey = Buffer.from(priKey).toString('hex');
  //console.log(`Private key: ${privateKey}`);

  var buff = new Buffer( privateKey, 'hex' );
  console.log(buff);
})
