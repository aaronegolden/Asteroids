const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

const laserSound = new Audio('laser.wav');

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

// Player
let player = {
  x: canvas.width / 2,
  y: canvas.height / 2,
  radius: 10,
  angle: 0,
  vx: 0,
  vy: 0,
  acceleration: 0,
  rotation: 0,
  firing: false,
  fireCooldown: 0,
};

// Asteroids
let asteroids = [];
const asteroidCount = 10;
for (let i = 0; i < asteroidCount; i++) {
  asteroids.push({
    x: Math.random() * canvas.width,
    y: Math.random() * canvas.height,
    radius: Math.random() * 20 + 10,
    angle: Math.random() * Math.PI * 2,
    speed: Math.random() * 2 + 1,
    numPoints: Math.floor(Math.random() * 3) + 5,
    sound: new Audio('explosion.wav'),
    dead: false,
  });
}

let particles = [];

let bullets = [];
const bulletCount = 5;
const buletLength = 3;
for (let i = 0; i < bulletCount; i++) {
    bullets.push({
        x: -100,
        y: -100,
        vx: 0,
        vy: 0,
        ready: true,
        sound: new Audio('laser.wav'),
    });
}

// Game loop
function gameLoop() {
  // Clear canvas
  ctx.fillStyle = 'black';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Update player
  player.angle += player.rotation;
  player.vx += -Math.sin(player.angle) * player.acceleration;
  player.vy += Math.cos(player.angle) * player.acceleration;
  let mod = Math.sqrt(player.vx * player.vx + player.vy * player.vy);
  if (mod > 5) {
    player.vx *= 5 / mod;
    player.vy *= 5 / mod;
  }
  player.x += player.vx;
  player.y += player.vy;

  if (player.firing && player.fireCooldown == 0) {
    for (let i = 0; i < bulletCount; i++) {
        let nextBullet = bullets[i];
        if (nextBullet.ready) {
            nextBullet.x = player.x;
            nextBullet.y = player.y;
            nextBullet.vx = -Math.sin(player.angle) * 10;
            nextBullet.vy = Math.cos(player.angle) * 10;
            nextBullet.ready = false;
            nextBullet.sound.play();
            player.fireCooldown = 10;
            break;
        }
    }
  }
  if (player.fireCooldown > 0) {
    player.fireCooldown--;
  }

  for (let i = 0; i < bullets.length; i++) {
    const bullet = bullets[i];
    bullet.x += bullet.vx;
    bullet.y += bullet.vy;
    drawBullet(bullet);

    if (bullet.x < -20 || bullet.y < -20 || bullet.x > canvas.width + 20 || bullet.y > canvas.height + 20) {
        bullet.ready = true;
        bullet.vx = 0;
        bullet.vy = 0;
    }
  }

  // Wrap player around screen
  if (player.x < 0) player.x += canvas.width;
  if (player.x > canvas.width) player.x -= canvas.width;
  if (player.y < 0) player.y += canvas.height;
  if (player.y > canvas.height) player.y -= canvas.height;

  // Update and draw asteroids
  for (let i = 0; i < asteroids.length; i++) {
    const asteroid = asteroids[i];
    asteroid.x += Math.cos(asteroid.angle) * asteroid.speed;
    asteroid.y += Math.sin(asteroid.angle) * asteroid.speed;

    // Wrap asteroids around screen
    if (asteroid.x < 0) asteroid.x += canvas.width;
    if (asteroid.x > canvas.width) asteroid.x -= canvas.width;
    if (asteroid.y < 0) asteroid.y += canvas.height;
    if (asteroid.y > canvas.height) asteroid.y -= canvas.height;

    drawAsteroid(asteroid);
  }

  for (let i = 0; i < asteroids.length; i++) {
    const asteroid = asteroids[i];
    for (let i = 0; i < bullets.length; i++) {
        const bullet = bullets[i];
        if (bullet.ready == false) {
            let dx = bullet.x - asteroid.x;
            let dy = bullet.y - asteroid.y;
            let r = Math.sqrt(dx * dx + dy * dy);
            if (r <= asteroid.radius && asteroid.dead == false) {
                bullet.ready = true;
                asteroid.dead = true;
                asteroid.sound.play();

                for (let i = 0; i < 20; i++) {
                  particles.push({
                    x: asteroid.x,
                    y: asteroid.y,
                    angle: Math.random() * Math.PI * 2,
                    speed: Math.random() * 5,
                    life: 50,
                  });
                }

                if (asteroid.radius > 10) {
                  asteroids.push({
                    x: asteroid.x,
                    y: asteroid.y,
                    radius: 10,
                    angle: asteroid.angle - Math.random() * Math.PI / 2.0,
                    speed: asteroid.speed,
                    numPoints: Math.floor(Math.random() * 3) + 5,
                    sound: asteroid.sound,
                    dead: false,
                  });
                  asteroids.push({
                    x: asteroid.x,
                    y: asteroid.y,
                    radius: 10,
                    angle: asteroid.angle + Math.random() * Math.PI / 2.0,
                    speed: asteroid.speed,
                    numPoints: Math.floor(Math.random() * 3) + 5,
                    sound: asteroid.sound,
                    dead: false,
                  });
                }
            }
        }
    }    
  }
  asteroids = asteroids.filter(function(a) {
    return a.dead == false;
  });

  for (let i = 0; i < particles.length; i++) {
    p = particles[i];
    p.x += p.speed * Math.cos(p.angle);
    p.y += p.speed * Math.sin(p.angle);
    p.life--;
  }
  drawParticles();
  particles = particles.filter(function(p) {
    return p.life > 0;
  });

  // Draw player
  drawPlayer();

  requestAnimationFrame(gameLoop);
}

// Draw player function
function drawPlayer() {
  ctx.save();
  ctx.translate(player.x, player.y);
  ctx.rotate(player.angle);

  ctx.fillStyle = 'white';
  ctx.beginPath();
  ctx.moveTo(-10, -10);
  ctx.lineTo(10, -10);
  ctx.lineTo(0, 20);
  ctx.closePath();
  ctx.fill();

  if (player.acceleration > 0) {
    ctx.fillStyle = 'cyan';
    ctx.beginPath();
    ctx.moveTo(-8, -10);
    ctx.lineTo(8, -10);
    ctx.lineTo(0, -18);
    ctx.closePath();
    ctx.fill();
  }

  ctx.restore();
}

// Draw asteroid function
function drawAsteroid(asteroid) {
    if (asteroid.dead) {
        return;
    }
  ctx.fillStyle = 'gray';
  ctx.beginPath();
  const angleStep = Math.PI * 2 / asteroid.numPoints;
  let angle = 0;
  ctx.moveTo(asteroid.x + asteroid.radius * Math.cos(angle), 
             asteroid.y + asteroid.radius * Math.sin(angle));
  for (let i = 1; i <= asteroid.numPoints; i++) {
    angle += angleStep;
    ctx.lineTo(asteroid.x + asteroid.radius * Math.cos(angle), 
               asteroid.y + asteroid.radius * Math.sin(angle));
  }
  ctx.closePath();
  ctx.fill();
}

function drawParticles() {
  for (let i = 0; i < particles.length; i++) {
    p = particles[i];
    ctx.fillRect(p.x - 1, p.y - 1, 2, 2);
  }
}

// Draw bulet function
function drawBullet(bullet) {
    if (bullet.ready) {
      return;
    }
    ctx.strokeStyle = 'green';
    ctx.beginPath();
    ctx.moveTo(bullet.x, bullet.y);
    ctx.lineTo(bullet.x + bullet.vx * buletLength, bullet.y + bullet.vy * buletLength);
    ctx.closePath();
    ctx.stroke();
  }
  
  

window.addEventListener('keydown', (event) => {
    if (event.key === 'ArrowLeft') {
      player.rotation = -0.1; 
    } else if (event.key === 'ArrowRight') {
      player.rotation = 0.1;
    } else if (event.key === 'ArrowUp') {
      player.acceleration += 1; 
    } else if (event.key === ' ') {
      player.firing = true;
    }
  });
  
window.addEventListener('keyup', (event) => {
    if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
      player.rotation = 0; 
    } else if (event.key === 'ArrowUp') {
      player.acceleration = 0; 
    } else if (event.key === ' ') {
      player.firing = false;
    }
  });

requestAnimationFrame(gameLoop);