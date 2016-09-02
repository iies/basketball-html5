var game = new Phaser.Game(480, 800, Phaser.CANVAS, 'game', { preload: preload, create: create, update: update, render: render });
var ball;
var isTrackDragging = false;
var isShootingBall = false;
var isFallingBall = false;
var isGoalSuccess = false;
var lastPointerPos = {};
var gameScore = 0;

var boundsAnchorLeft;
var boundsAnchorRight;
var boundsCollisionGroup;

function drawRectangle(x, y, width, height, color) {
    var rect = game.add.bitmapData(width, height);
    rect.ctx.beginPath();
    rect.ctx.rect(0, 0, width, height);
    rect.ctx.fillStyle = color;
    rect.ctx.fill();
    return game.add.sprite(x, y, rect);
}

function preload() {
    game.load.image('ball', 'images/ball.png');
}

function create() {
    game.physics.startSystem(Phaser.Physics.P2JS);
    game.physics.p2.setImpactEvents(true);
    game.physics.p2.gravity.y = 1600;
    game.physics.p2.restitution = 0.8;

    game.scale.scaleMode = Phaser.ScaleManager.SHOW_ALL;
    game.scale.minWidth = 480;
    game.scale.minHeight = 800;
    game.scale.maxWidth = 1440;
    game.scale.maxHeight = 2560;

    var ballCollisionGroup = game.physics.p2.createCollisionGroup();
    var goalCollisionGroup = game.physics.p2.createCollisionGroup();
    boundsCollisionGroup = game.physics.p2.createCollisionGroup();

	game.stage.backgroundColor = '#124184';

    boundsAnchorLeft = drawRectangle(game.world.centerX - 55, game.world.centerY - 100, 5, 5, "#aaa");
    game.physics.p2.enable(boundsAnchorLeft);
    boundsAnchorLeft.body.static = true;
    boundsAnchorLeft.body.setRectangle(5, 5);
    boundsAnchorLeft.body.collides(ballCollisionGroup);
    boundsAnchorLeft.body.setCollisionGroup(boundsCollisionGroup);

    boundsAnchorRight = drawRectangle(game.world.centerX + 55, game.world.centerY - 100, 5, 5, "#aaa");
    game.physics.p2.enable(boundsAnchorRight);
    boundsAnchorRight.body.static = true;
    boundsAnchorRight.body.setRectangle(5, 5);
    boundsAnchorRight.body.collides(ballCollisionGroup);
    boundsAnchorRight.body.setCollisionGroup(boundsCollisionGroup);

    var goalDetectionLine = drawRectangle(game.world.centerX, game.world.centerY - 80, 100, 5, "#124184");
    game.physics.p2.enable(goalDetectionLine);
    goalDetectionLine.body.static = true;
    goalDetectionLine.body.setRectangle(100, 5);
    goalDetectionLine.body.setCollisionGroup(goalCollisionGroup);
    goalDetectionLine.body.collides(ballCollisionGroup);
    goalDetectionLine.body.data.shapes[0].sensor = true;
    goalDetectionLine.body.onBeginContact.add(onBeginContact);

    ball = game.add.sprite(game.world.centerX, game.world.centerY + 200, 'ball');
    game.physics.p2.enable(ball);
    ball.body.setCircle(50);
    ball.body.mass = 1;
    ball.body.fixedRotation = false;
    ball.body.collideWorldBounds = false;
    ball.body.static = true;
    ball.body.setZeroVelocity();

    ball.body.setCollisionGroup(ballCollisionGroup);
    ball.body.collides([ boundsCollisionGroup, goalCollisionGroup ]);
    ball.body.data.shapes[0].sensor = true;

    Phaser.Canvas.setTouchAction(this.game.canvas, 'auto');
    game.input.touch.preventDefault = true;

    game.input.onDown.add(touchDown, this);
    game.input.onUp.add(touchUp, this);
}

function update() {
    if (isShootingBall) {
        if (ball.position.y < 185) {
            console.log(ball.position);
            ball.body.data.shapes[0].sensor = false;
            isFallingBall = true;
        }
        else if (ball.position.y > 1000) {
            isShootingBall = false;
            ball.body.data.shapes[0].sensor = true;
            resetGame();
        }

        ball.body.updateCollisionMask();
    }
    
}

function touchDown(pointer) {
    isTrackDragging = true;
    ball.body.static = true;
	ball.body.setZeroVelocity();

    lastPointerPos.x = pointer.position.x;
	lastPointerPos.y = pointer.position.y;
}

function touchUp(pointer) {
    if (isTrackDragging) {
        ball.body.static = false;
        isTrackDragging = false;

        var direction = new Phaser.Point(pointer.position.x - lastPointerPos.x, pointer.position.y - lastPointerPos.y);
        Phaser.Point.normalize(direction, direction);

        if (direction.y < 0) {
            ball.body.velocity.x = direction.x * 1200;
            ball.body.velocity.y = direction.y * 1200;

            isShootingBall = true;
        }
    }
}

function resetGame() {
    console.log("Reset game.");

    if (isGoalSuccess) {
        gameScore++;
    } else {
        gameScore = 0;
    }

    ball.body.setZeroVelocity();
    ball.body.setZeroRotation();
    ball.body.static = true;
    ball.body.reset(game.world.centerX, game.world.centerY + 200, true, true);

    isTrackDragging = false;
    isShootingBall = false;
    isFallingBall = false;
    isGoalSuccess = false;
}

function onBeginContact(body2, shapeA, shapeB, equation) {
    if (isFallingBall) {
        console.log("Goal!");
        isGoalSuccess = true;
    }
    
}

function render() {
    game.debug.text('Score: ' + gameScore, 32, 32);
}