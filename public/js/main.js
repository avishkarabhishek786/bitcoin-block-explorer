const $ = require('jquery')
require('buffer') // comes in with browserify

$(document).on('click', '.screen-req', function(e) {
  e.preventDefault();
  e.stopPropagation() 
  var url = '';
  var href = $(this).attr('href');

  switch (href) {
    case 'getbestblockhash':
      url = '/getbestblockhash';
      break;

    case 'getblockchaininfo':
      url = '/getblockchaininfo';
      break;

    case 'getblockcount':
      url = '/getblockcount';
      break;

    case 'getchaintips':
      url = '/getchaintips';
      break;
    case 'getconnectioncount':
      url = '/getconnectioncount';
      break;
    case 'getmemoryinfo':
      url = '/getmemoryinfo';
      break;
  
    default:
      break;
  }
  
  $.ajax({
    url: url,
    type: 'post',
    success: function(res) {
      console.log(res);
      
      $('#res-card').removeClass(' d-none');
      var response = '<h5>Response: </h5>';
      
      if(typeof res.getbestblockhash !== 'undefined') {
        response += res.getbestblockhash;
      }
      if(typeof res.getblockcount !== 'undefined') {
        response += res.getblockcount;
      }
      if(typeof res.getchaintips !== 'undefined') {
        response += JSON.stringify(res);
      }
      if(typeof res.getconnectioncount !== 'undefined') {
        response += res.getconnectioncount;
      }

      if(typeof res.getblockchaininfo !== 'undefined') {
        response += JSON.stringify(res);
      }
      
      if(typeof res.getmemoryinfo.locked !== 'undefined') {
        response += JSON.stringify(res.getmemoryinfo.locked);
      }

      $('#screen').html(response);

    },
    error: function(jqXHR, textStatus, errorThrown) {
        console.log(textStatus, errorThrown);
    } 
  })    
})


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
       console.log(data);
       
       let t = '';
       for (let i = 0; i < data.listUnspent.length; i++) {
         const element = data.listUnspent[i];
         if (!element.spendable) {
           continue;
         }
         t += '<input type="checkbox" class="gchk"> Select this Tx';
         t += '<ul class="tclick">';
         t += '<li>Address: '+element.address+'</li>';
         t += 'Amount: <li id="gtxamount">'+element.amount+'</li>';
         t += 'Txid: <li id="gtx">'+element.txid+'</li>';
         t += 'Vout: <li id="gvout">'+element.vout+'</li>';
         t += '<li> Confirmations: '+element.confirmations+'</li>';
         t += '</ul>';
         t += '<hr>';
       }
       $('#res-lsus').html(t);
     },
     error: function(jqXHR, textStatus, errorThrown) {
       console.log(textStatus, errorThrown);
    } 
   });
 });


$(document).on('click', '#crtx-btn', function() {
 let amnt = $('#amnt').val();
 amnt = parseFloat(amnt);
 let sendaddr = $('#sendaddr').val();

 var boxes = $('input[class=gchk]:checked');

  var txArr = [];
  var voutArr = [];
  var txtext = "";
  var vouttext = "";
  var tx_amount = 0;

  boxes.each(function(box){
    var btn = this;
    txbal = $(btn).next('ul').children("#gtxamount").text();
    txtext = $(btn).next('ul').children("#gtx").text();
    vouttext = $(btn).next('ul').children("#gvout").text();
    vouttext = parseInt(vouttext);
    
    if (txtext.length>0 && vouttext>-1) {
      txArr.push(txtext);
      voutArr.push(vouttext);
    }

    // Add the amount in selected txes
    tx_amount += parseFloat(txbal);
  });
  // console.log(txArr); 
  // console.log(voutArr); 
  // console.log(tx_amount); 

 if(sendaddr.length > 0 && txArr.length > 0 && voutArr.length>0 && amnt>0 && tx_amount>0) {
  $.ajax({
      type: 'post',
      url: '/rawtransaction',
      data: {txArr:txArr, voutArr:voutArr, sendaddr:sendaddr, amnt:amnt, tx_amount:tx_amount},
      success: function(data) {

        if (data.error==true) {
          if (data.msg.length>0) {
            alert(data.msg)
          }
          return;
        }
        
        var t = '<p>Error: Something went wrong! Check console logs.</p>';
        if (data.data.length) {
          let dec = JSON.stringify(data.data[1]);
          t = '<p>This is your decoded raw transaction. Please double check evrything: </p>';
          t += `<div class="card">${dec}</div>`;
          t += `<br><p>If everything is right please click the button "Send transaction" below to send the transaction.</p>`;

          $('#sendTxDiv').text(data.data[0]);
        }
        $('#res-card').html(t);
      },
      error: function(jqXHR, textStatus, errorThrown) {
        console.log(textStatus, errorThrown);
     } 
    });
 } 
  
});

$(document).on('click', '#sendTxBtn', function() {
  var btn = this;
  var hex = $("#sendTxDiv").text();
  var job = "sendtx";

  if (hex.length<0) {
    alert("No Hex data found!");
    return;
  }
  $.ajax({
    type: 'post',
    url: '/sendrawtx',
    data: {job:job, hex:hex},
    success: function(data) {
      console.log(data);
      var t = '<p>Error: Something went wrong! Check console logs.</p>';
      if($.trim(data.signedtxid) !== null) {
        t = '<h5>Transaction Successful: ';
        t += "<a href='https://live.blockcypher.com/btc-testnet/tx/"+data.signedtxid+"' target='_blank'>View my transaction</a>  ";        
        t += "  <a href='https://testnet.blockchain.info/tx/"+data.signedtxid+"?format=json' target='_blank'>View my transaction JSON</a></h5>";        
      }
      $('#res-card-result').html(t);
    },
    error: function(jqXHR, textStatus, errorThrown) {
      console.log(textStatus, errorThrown);
   } 
  });
});

/**Multisig Operations */

$(document).on('click', '#MultiSigBtn', function() {

  let job = 'createmultisig';
  let m = $("#mreqkey").val();
  let keys = $("#nkeys").val();

  $.ajax({
    type: 'post',
    url: '/createmultisig',
    data: {job:job, m:m, keys:keys},
    success: function(res) {
      console.log(res);
      
      if (res == undefined) {
        alert("Something went wrong. Try again.");
        return;
      }

      if (res.error==true) {
        if (res.msg.length>0) {
          alert(res.msg);
          return;
        }
      }

      var t = '';
      if (res.error==false && res.msg.length>0 && res.data!=null) {
        t += '<p class="text-success">Multisig Address created successfully!</p>';
        t += `<p><strong>${res.data.address}</strong></p>`;
        t += '<p>Below is the corresponding reddem script:</p>';
        t += `<strong>${res.data.redeemScript}</strong>`;
      }
      $("#res-div").html(t);

    },
    error: function(jqXHR, textStatus, errorThrown) {
      console.log(textStatus, errorThrown);
   } 
  });

})

/**6.2: Spending a Transaction with a Multisig */
$(document).on('click', '#importaddress-btn', function() {
  let btn = this;
  let job = 'importaddress';
  let addr = $('#_importaddress').val();

  if ($.trim(addr)=="") {
    alert("Please specify a valid address!");
    return;
  }
  
  $.ajax({
    url:'/importaddress',
    type:'post',
    data: {job:job, addr:addr},
    success: function(response) {
      console.log(response);
      if (response.error==true) {
        alert("ERROR!");
        return;
      }
      if (response.error==false && response.msg.length>0) {
        alert(response.msg.length);
      } else {
        alert("Something is wrong! We got no response back.");
      }
    },
    error: function(jqXHR, textStatus, errorThrown) {
      console.log(textStatus, errorThrown);
   }    
  });
});
 



