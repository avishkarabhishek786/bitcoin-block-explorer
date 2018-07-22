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

$(document).on('click', '#lsus-btn', function() {
   $.ajax({
     type: 'post',
     url: '/listunspent',
     success: function(data) {
       let t = '<ul>';
       for (let i = 0; i < data.listUnspent.length; i++) {
         const element = data.listUnspent[i];
         t += '<li>Address: '+element.address+'</li>';
         t += '<li>Amount: '+element.amount+'</li>';
         t += '<li> Txid: '+element.txid+'</li>';
         t += '<li> Vout: '+element.vout+'</li>';
         t += '<hr>';
       }
       t += '</ul>';
       $('#res-lsus').html(t);
     },
     error: function(jqXHR, textStatus, errorThrown) {
       console.log(textStatus, errorThrown);
    } 
   });
 });

$(document).on('click', '#crtx-btn', function() {
 let txid = $('#crtx-id').val();
 let addr = $('#addr-id').val();
 let amnt = $('#amnt').val();
 let sendaddr = $('#sendaddr').val();
 if(addr.length > 0) {
  $.ajax({
      type: 'post',
      url: '/rawtransaction',
      data: {addr:addr, txid:txid, sendaddr:sendaddr, amnt:amnt},
      success: function(data) {
        console.log(data);
        $('#res-card').text(data.prikey);
      },
      error: function(jqXHR, textStatus, errorThrown) {
        console.log(textStatus, errorThrown);
     } 
    });
 } 
  
});
