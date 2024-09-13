// Importing Packages
import express from "express";
import http from "http";
import { Server } from "socket.io";
import { Chess } from "chess.js";
import { fileURLToPath } from 'url';
import path, { dirname } from 'path';


// Get the directory name of the current module
const __dirname = dirname(fileURLToPath(import.meta.url));
// Initializing Servers
const app = express()
const server = http.createServer(app)
const io = new Server(server)

const chess = new Chess()

// Setting up our Variables
let players ={}
let currentPlayer="w" // W - White , B - Black
app.set("view engine","ejs")
app.use(express.static(path.join(__dirname,"public")))

app.get("/",(req,res)=>{
    res.render("index")
})
io.on("connection",(socket)=>{
    console.log("User is Connected")
    if(!players.white){
        players.white = socket.id;
        socket.emit("playerRole","w")

    }
    else if(!players.black){
        players.black= socket.id;
        socket.emit("playerRole","b");
    }
    else{
        socket.emit("spectatorRole");
    }

    socket.on("disconnect",()=>{ 
       if(socket.id===players.white){delete players.white}
       else if(socket.id===players.black){delete players.black}
    })

    socket.on("move",(move)=>{
        try {
            if(chess.turn()==="w" && socket.id!== players.white) return;
            if(chess.turn()==="b" && socket.id!== players.black) return;
            const result= chess.move(move);
            if(result){
                currentPlayer= chess.turn();
                io.emit("move",move);
                io.emit("boardState",chess.fen())
            }
            else{
                console.log("Invaid Move:",move)
                socket.emit("invalidMove",move)
            }
        } 
        catch(err){
            console.log(error)
            //-------------------------------------------
            socket.emit("invalidMove",move)
        }
    })
   
})
server.listen(3000,()=>{console.log("Server is up and running")})