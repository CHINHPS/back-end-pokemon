import express from 'express';
import { Server,Socket } from 'socket.io'
import http from 'http'

const app = express();

app.use(express.static(__dirname + '/../public'));
const server = http.createServer(app);
 
const io = new Server(server, {
    path: '/socket.io',
    cors: {
      origin: "http://172.20.10.2:5500"
    }
});

let listUsers:{
    id: string,
    point: 0
}[] = []
let maTran: number[]

io.on('connection',(client: Socket) => {
    console.log(`Connected ${client.id}`);
    client.join("match chinhdz"); // tên phòng

    client.on('find-match',(data) => {
        listUsers.push({id: data.id, point: 0})

        maTran = data.maTran // lấy ma trận của thằng t2

        // nếu trên 2 người đang truy cập thì bắt đầu ghép đôi
        if(listUsers.length >= 2) {
            io.to('match chinhdz').emit('finded-match',{
                maTran
            })
        }
        console.log(listUsers);
    })
    
    client.on('Send-pokemon-to-server', (data) => {
        let idKill = listUsers.map(user => user.id).indexOf(data.id)
        listUsers[idKill]['point'] += 1 // tăng điểm
        io.to("match chinhdz").emit("Send-kill-pokemon",data); // gửi giữ liệu cho các thành viên trong phòng để xoá pokemon
        io.to("match chinhdz").emit("Send-point",listUsers)
        console.log(listUsers);
    })

    client.on('disconnect',() => {
        client.leave("match chinhdz")
        listUsers.splice(listUsers.map(user => user.id).indexOf(client.id),1);
        console.log(`Disconnected ${client.id}`);
    })
})

function getRandomInt(max: number) {
    return Math.floor(Math.random() * max);
}

server.listen(3000,()=>{
    console.log('start server');  
})