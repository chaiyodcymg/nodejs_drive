
const express = require('express')
const app = express()
const PORT = process.env.PORT || 3001;
const path = require('path');
const fs = require('fs');
const bodyParser = require('body-parser');
const fileUpload = require('express-fileupload');
const directoryPath = path.join(__dirname, '/public/files/');


app.set('views', path.join(__dirname, 'views'))
app.set('views engine', 'ejs');
app.use(express.static(__dirname + '/public'));
const session = require('express-session')

const jsonextension = require("./Programming_Languages_Extensions.json");
const checkDiskSpace = require('check-disk-space').default


app.use(fileUpload({
    createParentPath: true
}));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use(session({
    secret: 'session_error',
    resave: false,
    saveUninitialized: true,

}))
let count = 0;
let innamefile = '';

let subdirec = [];
let allsubdirec = [];

const getFiles = (dir) => {
   
    if (fs.readdirSync(dir).length == 0) {
        return dir;
        
    }
    return fs.readdirSync(dir).flatMap((item) => {


        const path = `${dir}/${item}`;

        if (fs.statSync(path).isDirectory()) {
            allsubdirec.push(path) 
            return getFiles(path);

        }
        return path;

    });

}
let Spaceused = 0;
let Storage = 0;
let error = null;

var pathupload = "/fileupload/files";
app.use( async (req, res, next) => {
  
  
    try {
    
      await  checkDiskSpace('D:/').then((diskSpace) => {
        
            Storage = ((diskSpace.size / 1024) / 1024) / 1024;
            Spaceused = ((diskSpace.free / 1024) / 1024) / 1024;
        })

        let listfile = [];
        
        if (req.method != "POST") {

            if (req.originalUrl.indexOf('/delete/') != -1) {
            
              let index =   req.originalUrl.indexOf('/', 1)
                let pathurl = req.originalUrl.substring(index);
              
                fs.unlinkSync(__dirname + '/public' + decodeURIComponent(pathurl));
                res.redirect("back");
       
            }
            else if (decodeURIComponent(req.originalUrl).indexOf('/showresult/') != -1) {
                try {
                  let requrl =  decodeURIComponent(req.originalUrl);
                    let Index = requrl.indexOf("/",1);
                    let path = requrl.substring(Index );
                  
                
                    // console.log("public"+path);
                    let content = fs.readFileSync("public" + path);
                    content = " <code id='codeID'>" + content.toString().replace(/&/g, "&amp;").replace(/>/g, "&gt;").replace(/</g, "&lt;").replace(/"/g, "&quot;") + "</code>" ;
               
                    let spancountline = "";
                    for (let index = 1; index < content.split('\n').length+1; index++) {
                        spancountline += "<span>" + index +"</span>"
                        
                    }
                    res.render('showresult.ejs', { result: content ,spancountline:spancountline});
                  
                } catch (error) {
                    res.redirect("/");
                }

            }
            else if (req.originalUrl == '/' || req.originalUrl == '/images/' || req.originalUrl == '/styles/' ) {
                res.redirect("/files/");
            } 
            else if ( req.originalUrl == '/files/') {
               
             

             filenames = fs.readdirSync(directoryPath);
          
            filenames.forEach(file => {
                
                if (file.lastIndexOf(".") != -1) {
                    
                    
                    let day = new Date(fs.statSync(directoryPath + file).mtime).toLocaleDateString("th-TH", { timeZone: "Asia/Bangkok" })
                    let time = new Date(fs.statSync(directoryPath + file).mtime).toString().substring(16, 24)
                    let size = Math.ceil((fs.statSync(directoryPath + file).size / 1024));

                    let lastIndex = file.lastIndexOf(".");
                    let extension = file.substring(lastIndex+1);
                    // let extension = ".gif";
                

                    let urlpreview ="";
                    if (jsonextension[extension] == undefined) {
                        urlpreview = '/files/' +encodeURIComponent( file)
                    } else {
                        urlpreview = '/showresult/files/' + encodeURIComponent(file)
                        // console.log(urlpreview)
                    }
                 
            
                    listfile.push({ urlpreview: urlpreview , name: file, day: day, time: time, size: size, download: '/files/' + file, delete: encodeURIComponent('/delete/' +file)})
               
                } else {
                    let day = new Date(fs.statSync(directoryPath + file).mtime).toLocaleDateString("th-TH", { timeZone: "Asia/Bangkok" })
                    let time = new Date(fs.statSync(directoryPath + file).mtime).toString().substring(16, 24)
                    listfile.push({ urlpreview: encodeURIComponent(file) ,name: file, day: day, time: time, size: '-', download: '-', delete: '-'  })
                   
                }
            });
        

        
               
                res.render('index.ejs', { filenames: listfile, pathupload: pathupload, historyback: null, Storage: Storage, Spaceused: Spaceused, error: error, })
                res.send({ filenames: listfile, pathupload: pathupload, historyback: null, Storage: Storage, Spaceused: Spaceused, error: error, })
                res.end();
               
            } else {
         
                let reqUrl = decodeURIComponent(req.originalUrl);
              
                pathupload = "/fileupload" + reqUrl ;
                pathupload = pathupload.substring(0, pathupload.length - 1)

              
                let index = reqUrl .lastIndexOf("/", reqUrl .length - 2)
                let pathurl = reqUrl .substring(0, index)+"/";
                // console.log(pathurl)
                // console.log(reqUrl .lastIndexOf("/", reqUrl .length - 2));
             
                // namefile = "<!DOCTYPE html><html><head><style> th,td {padding:10px;  border-bottom: 1px solid; border-collapse: collapse;}</style></head><body><form action='" + pathupload +"' method='post' enctype='multipart/form-data'><input type='file' name='filetoupload' multiple><br><br><input type='submit'> </form><table> <tr><th>Name</th><th>Last modified</th><th>Size</th><th>Download</th><th>Delete</th></tr>  ";
        
                const directoryPath = path.join(__dirname, '/public/' + reqUrl +"/");
                filenames = fs.readdirSync(directoryPath);
                filenames.forEach(file => {
                    // console.log(file);
                    if (file.lastIndexOf(".") != -1) {


                        let day = new Date(fs.statSync(directoryPath + file).mtime).toLocaleDateString("th-TH", { timeZone: "Asia/Bangkok" })
                        let time = new Date(fs.statSync(directoryPath + file).mtime).toString().substring(16, 24)
                        let size = Math.ceil((fs.statSync(directoryPath + file).size / 1024));
                        let lastIndex = file.lastIndexOf(".");
                        let extension = file.substring(lastIndex + 1);
                        // let extension = ".gif";


                        let urlpreview = "";
                        if (jsonextension[extension] == undefined) {
                            urlpreview =  encodeURIComponent(file)
                        } else {
                            urlpreview = '/showresult' + encodeURIComponent(reqUrl + file)
                            // console.log(urlpreview)
                        }
                        
                    
                        listfile.push({ urlpreview: urlpreview, name: file, day: day, time: time, size: size, download: reqUrl + file, delete: '/delete' + reqUrl + encodeURIComponent(file) })
                    } else {
                        let day = new Date(fs.statSync(directoryPath + file).mtime).toLocaleDateString("th-TH", { timeZone: "Asia/Bangkok" })
                        let time = new Date(fs.statSync(directoryPath + file).mtime).toString().substring(16, 24)

                        // console.log(encodeURIComponent(reqUrl + file))
                        // namefile += "<tr><td><a href='" + reqUrl + file + "'>" + file + "/ </a></td><td>" + day + " " + time + "</td><td> - </td> <td>-</td><td>-</td></tr> "
                        listfile.push({ urlpreview:  encodeURIComponent( file), name: file, day: day, time: time, size: "-", download: '-', delete: '-' })
                    } 
                });
                


                // namefile += "</table></body></html>"
         
                res.render('index.ejs', { filenames: listfile, pathupload: pathupload, historyback: pathurl, Storage: Storage, Spaceused: Spaceused,error:error})
           
                res.end();
                    }
        } else if (req.method == "POST") {
          
            try {
               
                if (req.originalUrl == "/createfolder"){
                    console.log(req.originalUrl);
                    console.log("--------------------------");
                    console.log(req.body.name_folder);
                    var dir = __dirname + '/public/files/' + req.body.name_folder ;
                    if (!fs.existsSync(dir)) {
                        fs.mkdirSync(dir, { recursive: true });
                        res.redirect("back")
                    } else {
                        res.redirect("back")
                        res.render('error.ejs',{error:error})
                    }
                } else {
                    
                   
                    if (!req.files) {
                        res.send({
                            status: false,
                            message: 'No file uploaded'
                        });
                    } else {
                        // console.log(req.files);
                        var originalUrl = decodeURIComponent(req.originalUrl) 
                        let lastIndex = originalUrl.indexOf("/", 1);
                        let path = originalUrl.substring(lastIndex);
                      
                        // console.log('public' + path + req.files.file.name);
                        let namefile = req.files.file
                        console.log('public' + originalUrl + namefile.name);
                        namefile.mv('public' + originalUrl + namefile.name);
                        // if (Array.isArray(req.files.filetoupload)) {
                            
                       
                        //     req.files.filetoupload.forEach((key) => {

                        //         let namefile = key;
                        //         // console.log(key);
                        //         namefile.mv('public' + path + namefile.name);
                            
                        //     })
                        // } else {
                        //     let namefile = req.files.filetoupload;
                        //     // console.log('public' + path + namefile.name);
                        //     namefile.mv('public' + path + namefile.name); 
                        // }
                        // res.send("<script>alert('Upload success!')</>");
                        res.redirect(originalUrl);
                    }
                }
                } catch (err) {
                    res.status(500).send(err);
                }
        }


    } catch (error) {
        console.log(error);
        res.redirect("back");
    }
    next(); 
});
// app.get('/',  (req, res) => {
 
  
//     subdirec = getFiles(directoryPath);
//     // console.log(subdirec);
//   arr = []
//     allsubdirec.forEach(file => {
      
//         var index = file.indexOf('/');
//         var files = file.substring(index);


//         var index = files.indexOf('/',);
//         // var files2 = files.substring(index);

       
//         // if (files.indexOf('/', 1) <= -1) {
//         //     console.log(files+":name")
//         // } else {
//             // var index = files.indexOf('/',1);
//             console.log(files)
//         // }
//         // console.log(arr);
//     });
//     // subdirec.forEach(file => {
//     //     var index = file.indexOf('/');
//     //     var files = file.substring(index);
//     //     var path = "/";
//     //     // console.log(files);
//     //     if (files.indexOf(path,0) != -1) {
//     //         var index = files.indexOf(path, 0);

//     //         var index2 = files.indexOf(path, 1);
//     //         var files2 = files.substring(index);

//     //         // var files2 = files.substring(index2);
//     //         // console.log(files2);
         
//     //     }
//     //     // console.log(files);
//     //     // console.log(fs.statSync('public/' + files))
      
//     // })
   
//     //  console.log(subdirec)

//     namefile = "<!DOCTYPE html><html><head><style> th,td {padding:10px;  border-bottom: 1px solid; border-collapse: collapse;}</style></head><body><form action='/fileupload' method='post' enctype='multipart/form-data'><input type='file' name='filetoupload'><br><input type='submit'> </form><table> <tr><th>Name</th><th>Last modified</th><th>Size</th><th>Download</th><th>Delete</th></tr>  ";
   
//     filenames = fs.readdirSync(directoryPath);
//     filenames.forEach(file => {
//         // console.log(file.lastIndexOf("."));
//         if (file.lastIndexOf(".") != -1) {
            
       
//         let day = new Date(fs.statSync('public/files/' + file).mtime).toLocaleDateString("th-TH", { timeZone: "Asia/Bangkok" })
//         let time = new Date(fs.statSync('public/files/' + file).mtime).toString().substring(16, 24)
//         let size = Math.ceil((fs.statSync('public/files/' + file).size / 1024));
//         namefile += "<tr><td><a href='/files/showresult/" + file + "'>" + file + "</a></td><td>" + day + " " + time + "</td><td>" + size + " kb </td> <td><a href='/file/download/" + file + "'>Download File</a></td><td><a href='/files/delete/" + file + "'>Delete File</a></td></tr> "
//         } else {
//             let day = new Date(fs.statSync('public/files/' + file).mtime).toLocaleDateString("th-TH", { timeZone: "Asia/Bangkok" })
//             let time = new Date(fs.statSync('public/files/' + file).mtime).toString().substring(16, 24)
//             namefile += "<tr><td><a href='/directory/" + file + "'>" + file + "</a></td><td>" + day + " " + time + "</td><td> - </td> <td>-</td><td>-</td></tr> "
//         }
//     });
 

 
//     namefile += "</table></body></html>"
//     res.send(namefile);
 
   
// })

// app.get('/download/:namefile', (req, res) => {
//     // console.log(req.params.namefile)
//     const file = `${__dirname}/public/files/${req.params.namefile}`;
//     res.download(file);
// });
// app.get('/showresult/:namefile', (req, res) => {


   
// });

// app.post('/fileupload/:namefileupload', (req, res) => {
  
//     try {
//         if (!req.files) {
//             res.send({
//                 status: false,
//                 message: 'No file uploaded'
//             });
//         } else {
//             //Use the name of the input field (i.e. "avatar") to retrieve the uploaded file
//             let avatar = req.files.filetoupload;

//             //Use the mv() method to place the file in upload directory (i.e. "uploads")
//             avatar.mv('public/files/' + avatar.name);

//             //send response
//             // res.send("<script>alert('Upload success!')</script>");
//             res.redirect("/");
//         }
//     } catch (err) {
//         res.status(500).send(err);
//     }
 
// })

// app.get('/files/delete/:namefile', (req, res) => {

//     fs.unlinkSync(__dirname+'/public/files/'+req.params.namefile);
//     res.redirect("/");
// });
// app.get('/directory/:namedirectory', (req, res) => {
//     // console.log(req.params);
 
//     // let lastIndex = req.params.namedirectory.lastIndexOf("/");
//     // let extension = req.params.namedirectory.substring(lastIndex + 1);
//     // if (!subdirec.includes(req.params.namedirectory)) {
//     //     subdirec.push(req.params.namedirectory);
//     //     console.log("เข้า if");
//     //     console.log(subdirec.toString().replace(/,/g, "/") + "/");
//     //     subdirecstring = subdirec.toString().replace(/,/g, "/") + "/"
//     // } else if (subdirec.includes(req.params.namedirectory)) {
//     //     const index = subdirec.indexOf(req.params.namedirectory);
 
//     //     subdirec.splice(index, 1);
//     //     console.log("เข้า else");
//     //     console.log(subdirec.toString().replace(/,/g, "/") + "/");
//     //     subdirecstring = subdirec.toString().replace(/,/g, "/") + "/"
//     // }
   
   
//     // let lastIndex2 = subdirec.lastIndexOf("/");
//     // let extension2 = subdirec.substring(lastIndex2 + 1);

//     // if (extension != extension2 && count >= 1) {
//     //     subdirec += req.params.namedirectory+"/" ;
//     //     console.log(subdirec);
//     // } else if (count ==0) {
//     //     subdirec += req.params.namedirectory + "/";
//     // }
   
//     namefile = "<!DOCTYPE html><html><head><style> th,td {padding:10px;  border-bottom: 1px solid; border-collapse: collapse;}</style></head><body><form action='/fileupload' method='post' enctype='multipart/form-data'><input type='file' name='filetoupload'><br><input type='submit'> </form><table> <tr><th>Name</th><th>Last modified</th><th>Size</th><th>Download</th><th>Delete</th></tr>  ";
//     const directoryPath = path.join(__dirname, '/public/files/' + req.params.namedirectory+"/");
//     filenames = fs.readdirSync(directoryPath);
//     filenames.forEach(file => {
//         console.log(file);
//         if (file.lastIndexOf(".") != -1) {

//             let day = new Date(fs.statSync(directoryPath + file).mtime).toLocaleDateString("th-TH", { timeZone: "Asia/Bangkok" })
//             let time = new Date(fs.statSync(directoryPath + file).mtime).toString().substring(16, 24)
//             let size = Math.ceil((fs.statSync(directoryPath + file).size / 1024));
//             namefile += "<tr><td><a href='/files/showresult/" + file + "'>" + file + "</a></td><td>" + day + " " + time + "</td><td>" + size + " kb </td> <td><a href='/file/download/" + file + "'>Download File</a></td><td><a href='/files/delete/" + file + "'>Delete File</a></td></tr> "
//         } else {
//             let day = new Date(fs.statSync(directoryPath + file).mtime).toLocaleDateString("th-TH", { timeZone: "Asia/Bangkok" })
//             let time = new Date(fs.statSync(directoryPath + file).mtime).toString().substring(16, 24)
//             namefile += "<tr><td><a href='/directory/" + req.params.namedirectory+"/"+file + "'>" + file + "</a></td><td>" + day + " " + time + "</td><td> - </td> <td>-</td><td>-</td></tr> "
//         }
//     });
//     namefile += "</table></body></html>"
//     res.send(namefile);
//     // count++
// });
// app.get(['/pack/:a', '/pack2/:a',], (req, res) => {
//     console.log(req.params.a);
// });
module.exports = pathupload


app.listen(PORT, function () {
    console.log('Server started: http://localhost:' + PORT + '/')

})