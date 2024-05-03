const canvas = document.querySelector('canvas')
const c = canvas.getContext('2d')

const socket = io()

const scoreEl = document.querySelector('#scoreEl')

const devicePixelRatio = window.devicePixelRatio || 1

canvas.width = innerWidth * devicePixelRatio
canvas.height = innerHeight * devicePixelRatio

const x = canvas.width / 2
const y = canvas.height / 2

const frontendPlayers ={}

socket.on('updatePlayers', (backendPlayers) =>{
  for (const id in backendPlayers){
    const backendPlayer = backendPlayers[id]
    if (!frontendPlayers[id]){
      frontendPlayers[id] = new Player({
        x: backendPlayer.x, 
        y: backendPlayer.y, 
        radius: 10, 
        color: backendPlayer.color})
    } else{
      // if player already exist
    frontendPlayers[id].x = backendPlayer.x
    frontendPlayers[id].y = backendPlayer.y
    }
  }
  for (const id in frontendPlayers){
    if(!backendPlayers[id]){
      delete frontendPlayers[id]
    }
  }
})
let animationId
function animate() {
  animationId = requestAnimationFrame(animate)
  c.fillStyle = 'rgba(0, 0, 0, 0.1)'
  c.fillRect(0, 0, canvas.width, canvas.height)

  for (const id in frontendPlayers ){
    const frontendPlayer = frontendPlayers[id]
    frontendPlayer.draw()
  }
}

animate()

const keys ={
  W:{
    pressed: false
  },
  A:{
    pressed: false
  },
  S:{
    pressed: false
  },
  D:{
    pressed: false
  }
}

const SPEED= 10
const playerInputs = []
let sequenceNum = 0
setInterval(() => {
  if (keys.W.pressed){
    sequenceNum++
    playerInputs.push({sequenceNum, dx: 0, dy: -SPEED})
    frontendPlayers[socket.id].y -= SPEED
    socket.emit('keydown', {keycode: 'KeyW', sequenceNum})

  }
  if (keys.A.pressed){
    sequenceNum++
    playerInputs.push({sequenceNum, dx: -SPEED, dy: 0})
    frontendPlayers[socket.id].x -= SPEED
    socket.emit('keydown', {keycode: 'KeyA', sequenceNum})
  }
  if (keys.S.pressed){
    sequenceNum++
    playerInputs.push({sequenceNum, dx: 0, dy: SPEED})
    frontendPlayers[socket.id].y += SPEED
    socket.emit('keydown', {keycode: 'KeyS', sequenceNum})
  }
  if (keys.D.pressed){
    sequenceNum++
    playerInputs.push({sequenceNum, dx: SPEED, dy: 0})
    frontendPlayers[socket.id].x += SPEED
    socket.emit('keydown', {keycode: 'KeyD', sequenceNum})
  }
}, 15)

window.addEventListener('keydown', (event)=>{
  if (!frontendPlayers[socket.id]) return
  switch(event.code){
    case 'KeyW':
      keys.W.pressed = true
      break
    case 'KeyA':
      keys.A.pressed = true
      break
    case 'KeyS':
      keys.S.pressed = true
      break
    case 'KeyD':
      keys.D.pressed = true
      break
  }
})
window.addEventListener('keyup', (event) => {
  if (!frontendPlayers[socket.id]) return
  switch(event.code){
    case 'KeyW':
      keys.W.pressed = false
      break
    case 'KeyA':
      keys.S.pressed = false
      break
    case 'KeyS':
      keys.S.pressed = false
      break
    case 'KeyD':
      keys.D.pressed = false
      break
  }
})
