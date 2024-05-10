const powerUp = new PowerUps({x: 100, y: 100, velocity:  {x: 0, y: 0}});


class Powerups{
    constructor({x, y, velocity}){
        this.x = x
        this.y = y
        this.velocity = velocity
    }
}