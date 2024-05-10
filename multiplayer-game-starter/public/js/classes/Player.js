
class Player{
  constructor({x, y, radius, color, username}) {
    this.x = x;
    this.y = y;
    this.radius = radius;
    this.color = color;
    this.username = username;
  }

  draw() {
    c.font = '12px sans-serif';  // Ensure the font size and family is correctly specified
    c.fillStyle = 'white';

    // Measure the text width
    const textWidth = c.measureText(this.username).width;

    // Center the text below the player model
    const textX = this.x - textWidth / 2;
    const textY = this.y + 20;  // Adjust Y offset as needed to position the text below the player model

    c.fillText(this.username, textX, textY);

    c.save();
    c.shadowColor = this.color;
    c.shadowBlur = 20;
    c.beginPath();
    c.arc(this.x, this.y, this.radius * window.devicePixelRatio, 0, Math.PI * 2, false);
    c.fillStyle = this.color;
    c.fill();
    c.restore();
  }
}
