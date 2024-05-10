const canvas = document.querySelector('canvas')
const c = canvas.getContext('2d')

const socket = io()

const scoreEl = document.querySelector('#scoreEl')

const devicePixelRatio = window.devicePixelRatio || 1

canvas.width = 1024 * devicePixelRatio
canvas.height = 576 * devicePixelRatio

c.scale(devicePixelRatio, devicePixelRatio)

const x = canvas.width / 2
const y = canvas.height / 2

const frontendPlayers ={}
const frontendProjectiles = {}

socket.on('updateProjectiles', (backendProjectiles) =>{
  for (const id in backendProjectiles) {
    const backendProjectile = backendProjectiles[id]

    if (!frontendProjectiles[id]){
        frontendProjectiles[id] = new Projectile({
          x: backendProjectile.x, 
          y: backendProjectile.y, 
          radius: 5, 
          color: frontendPlayers[backendProjectile.playerId]?.color,
          velocity: backendProjectile.velocity})
    } else{
        frontendProjectiles[id].x += backendProjectiles[id].velocity.x
        frontendProjectiles[id].y += backendProjectiles[id].velocity.y
    }
  }
  for (const frontendProjectileId in frontendProjectiles){
    if(!backendProjectiles[frontendProjectileId]){
      delete frontendProjectiles[frontendProjectileId]
    }
  }
})

socket.on('updatePlayers', (backendPlayers) =>{
  for (const id in backendPlayers){
    const backendPlayer = backendPlayers[id]
    if (!frontendPlayers[id]){
      frontendPlayers[id] = new Player({
        x: backendPlayer.x, 
        y: backendPlayer.y, 
        radius: 10, 
        color: backendPlayer.color,
        username: backendPlayer.username
      })
        
        //selects the player name to post on leaderboard/scoreboard
        document.querySelector('#playerLabels').innerHTML +=`<div data-id="${id}" data-score="${backendPlayer.score}"> ${backendPlayer.username}: ${backendPlayer.score}</div>`
    } else{
      document.querySelector(`div[data-id="${id}"]`).innerHTML = `${backendPlayer.username}: ${backendPlayer.score}`
      document.querySelector(`div[data-id="${id}"]`).setAttribute('data-score', backendPlayer.score)
      
      //sorts the leaderboard
      const parentDiv = document.querySelector(`#playerLabels`)
      const childDivs = Array.from(parentDiv.querySelectorAll('div'))

      childDivs.sort((a,b) => {
        const scoreA = Number(a.getAttribute('data-score'))
        const scoreB = Number(b.getAttribute('data-score'))

        return scoreB - scoreA
      })

      //remove old elements
      childDivs.forEach(div => {
        parentDiv.removeChild(div)
      })

      //adds sorted elements
      childDivs.forEach(div => {
        parentDiv.appendChild(div)
      })

      frontendPlayers[id].target = {
        x: backendPlayer.x,
        y: backendPlayer.y
      }

      if (id === socket.id){
        const lastBackendInputIndex = playerInputs.findIndex((input) => {
          return backendPlayer.sequenceNum === input.sequenceNum
    })
        if (lastBackendInputIndex > -1)
          playerInputs.splice(0, lastBackendInputIndex + 1)

          playerInputs.forEach((input) =>{
            frontendPlayers[id].target.x += input.dx
            frontendPlayers[id].target.y += input.dy
        })
      } 
    }
  }
  //deleting front end players
  for (const id in frontendPlayers){
    if(!backendPlayers[id]){
      const deleteDiv = document.querySelector(`div[data-id="${id}"]`)
      deleteDiv.parentNode.removeChild(deleteDiv)

      if(id === socket.id){
        document.querySelector('#usernameForm').style.display = 'block'
      }

      delete frontendPlayers[id]
    }
  }
})
let animationId
function animate() {
  animationId = requestAnimationFrame(animate)
  c.fillStyle = 'rgba(0, 0, 0, 0.1)'//maybe remove this
  c.clearRect(0, 0, canvas.width, canvas.height)

  for (const id in frontendPlayers ){
    const frontendPlayer = frontendPlayers[id]

    if(frontendPlayer.target){
      frontendPlayers[id].x += (frontendPlayers[id].target.x - frontendPlayers[id].x) * 0.5
      frontendPlayers[id].y += (frontendPlayers[id].target.y - frontendPlayers[id].y) * 0.5
      }

    frontendPlayer.draw()
  }
  for (const id in frontendProjectiles ){
    const frontendProjectile = frontendProjectiles[id]
    frontendProjectile.draw()
  }
  // for (let i = frontendProjectiles.length - 1; i >= 0; i--){
  //   const frontendProjectile = frontendProjectiles[i]
  //   frontendProjectile.update()
  // }
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
      keys.A.pressed = false
      break
    case 'KeyS':
      keys.S.pressed = false
      break
    case 'KeyD':
      keys.D.pressed = false
      break
  }
})

//when submitting form dont default refresh
document.querySelector('#usernameForm').addEventListener('submit', (event) =>{
   event.preventDefault()
   //hides interface once button is pressed
   document.querySelector('#usernameForm').style.display = 'none'
   socket.emit('init', {
    width: canvas.width,
    height: canvas.height,
    devicePixelRatio,
    username: document.querySelector('#usernameInput').value})
})
