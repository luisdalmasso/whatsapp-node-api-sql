const router = require('express').Router();
const { MessageMedia, Location, GroupChat } = require("whatsapp-web.js");
const request = require('request')
const vuri = require('valid-url');
const fs = require('fs');

const sql = require('mssql');
var configsql = {
    server: 'desarrollo2012',
    database: 'ssalud',
    user: 'websis',
    password: '123456',
    port: 1433,
    options: {
        encrypt: false ,
        enableArithAbort: true
    }
};

const mediadownloader = (url, path, callback) => {
    request.head(url, (err, res, body) => {
      request(url)
        .pipe(fs.createWriteStream(path))
        .on('close', callback)
    })
  }

router.post('/sendmessage/:phone', async (req,res) => {
    let phone = req.params.phone;
    let message = req.body.message;

    if(phone==undefined||message==undefined){
        res.send({status:"error",message:"please enter valid phone and message"})
    }else{
        client.sendMessage(phone+'@c.us',message).then((response)=>{
            if(response.id.fromMe){
                res.send({status:'success',message:'Message successfully sent to '+phone})
            }
        });
    }
});

router.post('/sendimage/:phone', async (req,res) => {
    var base64regex = /^([0-9a-zA-Z+/]{4})*(([0-9a-zA-Z+/]{2}==)|([0-9a-zA-Z+/]{3}=))?$/;

    let phone = req.params.phone;
    let image = req.body.image;
    let caption = req.body.caption;

    if(phone==undefined||image==undefined){
        res.send({status:"error",message:"please enter valid phone and base64/url of image"})
    }else{
        if(base64regex.test(image)){
            let media = new MessageMedia('image/png',image);
            client.sendMessage(phone+'@c.us',media,{caption:caption||""}).then((response)=>{
                if(response.id.fromMe){
                    res.send({status:'success',message:'MediaMessage successfully sent to '+phone})
                }
            });
        }else if(vuri.isWebUri(image)){
            if (!fs.existsSync('./temp')){
                await fs.mkdirSync('./temp');
            }
            var path = './temp/' + image.split("/").slice(-1)[0]
            mediadownloader(image,path,()=>{
                let media = MessageMedia.fromFilePath(path);
                client.sendMessage(phone+'@c.us',media,{caption:caption||""}).then((response)=>{
                    if(response.id.fromMe){
                        res.send({status:'success',message:'MediaMessage successfully sent to '+phone})
                    }
                });
            })
        }else{
            res.send({status:'error',message:'Invalid URL/Base64 Encoded Media'})
        }
    }
});


router.post('/sendlocation/:phone', async (req,res) => {
    let phone = req.params.phone;
    let latitude = req.body.latitude;
    let longitude = req.body.longitude;
    let desc = req.body.description;

    if(phone==undefined||latitude==undefined||longitude==undefined){
        res.send({status:"error",message:"please enter valid phone, latitude and longitude"})
    }else{
        let loc = new Location(latitude,longitude,desc||"");
        client.sendMessage(phone+'@c.us',loc).then((response)=>{
            if(response.id.fromMe){
                res.send({status:'success',message:'Location successfully sent to '+phone})
            }
        });
    }
});

router.get('/getchatbyid/:phone', async (req,res) => {
    let phone = req.params.phone;
    if(phone==undefined){
        res.send({status:"error",message:"please enter valid phone number"});
    }else{
        client.getChatById(phone+"@c.us").then((chat) => {
            res.send({ status: "success", message: chat });
            console.log(chat)
        }).catch(() => {
            console.error("getchaterror")
            res.send({status:"error",message:"getchaterror"})
        })
    }
});

router.get('/getchats', async (req,res) => {
    client.getChats().then((chats) => {
        res.send({ status:"success", message: chats});
    }).catch(() => {
        res.send({status:"error",message:"getchatserror"})
    })
});

router.get('/getmessages/:last', async (req,res) => {

    let last = req.params.last;
    last==undefined ? 100 : last; 
    if (global.authed =false)
    {        
        res.send({status:"error",message:"No Autenticado"});
    }else {
        ccmd = "SET QUOTED_IDENTIFIER OFF  select top "+ last +"id, id2, mensaje, origen as autor, ACK as status, tipo, fecha, chat, iif(media>'','true','false') as TieneAdjunto from wa_mensage where dispo_numero = '"+ dispositivo  +"' order by id desc ";
   // console.log(ccmd)
    sql.connect(configsql, function (err) {
        var request = new sql.Request();
        request.query(ccmd, function (err, recordset) {
            if (err) {
                //console.log(err);
                res.send({status:"error",message:"getmessageserror"});
            }
           // console.log(recordset)    
            res.send({ status:"success", message: recordset});
        });     

    });
    }
});
router.get('/getmessagesbyid/:chatid', async (req,res) => {
    let chatid = req.params.chatid;
    if(chatid==undefined){
        res.send({status:"error",message:"debe ingresar chatid"});
    }else{     
        ccmd = "SET QUOTED_IDENTIFIER OFF  select id, id2, mensaje, origen as autor, ACK as status, tipo, fecha, chat, iif(media>'','true','false') as TieneAdjunto from wa_mensage where chat='"+chatid.toString()+"' and dispo_numero = '"+ dispositivo  +"'";
       // console.log(ccmd)
        sql.connect(configsql, function (err) {
            var request = new sql.Request();
            request.query(ccmd, function (err, recordset) {
                if (err) {
                    //console.log(err);
                    res.send({status:"error",message:"getmessageserror"});
                }
                //console.log(recordset)    
                res.send({ status:"success", message: recordset});
            });     

        });
    };
});


router.get('/getmensajesbyid/:phone', async (req, res) => {
    try
    { let phone = req.params.phone;
    if (phone == undefined) {
        res.send({ status: "error", message: "please enter valid phone number" });
    } else {
        let elchat = await client.getChatById(phone + "@c.us");
        let mmsgs = await elchat.fetchMessages({ limit: 200 });  
        res.send({ status: "success", message: mmsgs });
        //elchat.then(fetchMessages({ limit: 500 }).then(chat) => {
        //  res.send({ status: "success", message: chat });
        //    console.log(chat)
        //}).catch(() => {
        //    console.error("getchaterror")
        //   res.send({ status: "error", message: "getchaterror" })
        //});
        //client.getChatById(phone + "@c.us").then((chat) => {
        //    res.send({ status: "success", message: chat });
        //    console.log(chat)
        //}).catch(() => {
        //    console.error("getchaterror")
        //    res.send({ status: "error", message: "getchaterror" })
        //})
    }
    }
    catch{ 
        res.send({ status: "error", message: "getchaterror" })
    }
});




router.get('/getadjunto/:messageid', async (req,res) => {
    let messageid = req.params.messageid;
    if(messageid==undefined){
        res.send({status:"error",message:"debe ingresar messageid"});
    }else{     
        ccmd = "SET QUOTED_IDENTIFIER OFF  select id, media, mime from wa_mensage where id2='"+messageid.toString()+"' and dispo_numero = '"+ dispositivo  +"'";
        sql.connect(configsql, function (err) {
            var request = new sql.Request();
            request.query(ccmd, function (err, recordset) {
                if (err) {
                    console.log(err);
                    res.send({status:"error",message:"getmessageserror"});
                }
                //console.log(recordset) ;
                if (recordset.recordset[0].media = undefined )  {
                    res.send({status:"error",message:"No se encuentra Adjunto para el mensaje"});
            }
                var media = recordset.recordset[0].media ;
                var mime = recordset.recordset[0].mime ;
                var id = recordset.recordset[0].id ;
                var FilePath= id.toString();
                aext = mime.split('/');
                sext = aext[1].includes('ogg') ? '.ogg' : '.'+aext[1];
                FilePath = config.pathmedia+FilePath.replace(/"/gi,'')+sext;
                fs.writeFileSync(FilePath, media, 'base64');
                FilePath=__dirname+FilePath.substring(12)                ;
                res.download(FilePath); // Set disposition and send it.                
            });     

        });
    };
});

module.exports = router;

//client.getChats().then((chats) => { chats.fetchMessages().then((resp) =>
//    { res.send({status:"success", message: resp }) }
//).catch(() => {  res.send({status:"error",message:"getchatserror"})});
//});

// client.getChats().then((chats) => {
//     for (const n_chat of chats) {
//         var n_id = n_chat.id;        
//         n_chat.fetchMessages().then(messages);
//         res.send({ status:"success", message: messages});
//     };    
//     }).catch(() => {   res.send({status:"error",message:"getchatserror"})
//     });
// });




// client.getChat().then((chat) => { chat.fetchMessage().then((resp) => { send status here } } 
//    client.getChats().then((chat) => { chat.fetchMessage().then((resp) => { message: resp 
// })
//    .catch(() => {              
//             res.send({status:"error",message:"getmessageserror"})      
//         });
//     });
// });     

   //client.getChatById(phone+"@c.us").fetchMessages().then((messages) => {
   //       res.send({ status:"success", message: messages });

