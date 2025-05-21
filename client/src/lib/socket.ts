import io from "socket.io-client"

const socketUrl = 'http://localhost:8080'


function initializeSocket (currentuserId: string){

   const options = {
    reconnectionAttempts: Infinity,
    reconnection:true,
    reconnectionDelay:1000,
    reconnectionDelayMax:5000,
    query:{userId:currentuserId}
   }

    const socket = io(socketUrl, options)
    return socket
}

export default initializeSocket