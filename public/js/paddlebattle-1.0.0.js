const constants = {
  colors: {
    BALL_COLOR: 'white',
    PADDLE_COLOR: 'white',
    SCREEN_COLOR: 'black',
    INIT_SCORE_COLOR: 'white',
    FINAL_POINT_SCORE_COLOR: 'red'
  }
}

/**
 * @fileoverview Logic for Paddle Battle game.
 * @author Jesse Palmer
 */

/**
 * Main application.
 */
function canvasApp() {
    'use strict';

    var canvas = document.getElementById('canvas'),
        context = canvas.getContext('2d'),
        SCREEN_WIDTH = $(document).width(),
        SCREEN_HEIGHT = $(document).height(),
        ball = null,
        paddleOne = null,
        paddleTwo = null,
        players = 0,
        scoreOne = 0,
        scoreTwo = 0,
        scoreOneColor = '#fff',
        scoreTwoColor = '#fff',
        gameStatus = 'menu',
        blup,
        youWin,
        youLose;

    canvas.width = SCREEN_WIDTH;
    canvas.height = SCREEN_HEIGHT;

    /**
     * Game object classes
     */

    /** Class representing a point. */
     class Ball {

      /**
       * Creates a ball
       */ 
      constructor() {
        this.width = SCREEN_WIDTH * 0.012;
        this.defaultSpeed = 5;
        this.speed = this.defaultSpeed;
        this.speedLimit = 10;
        this.angle = 45;
        this.trips = 1;
        this.x1 = (SCREEN_WIDTH / 2) - this.width;
        this.x2 = this.x1 + this.width;
        this.y1 = 0;
        this.y2 = 0;
      }
    }

    /**
     * A Paddle.
     * @param {number} x1 The x1 position of the paddle.
     */
    class Paddle {

      /**
        * Creates a Paddle.
        * @param {number} x1 The x1 position of the paddle.
        */
      constructor(x1) {
        this.height = SCREEN_HEIGHT * 0.10;
        this.width = SCREEN_WIDTH * 0.014;
        this.color = constants.colors.PADDLE_COLOR;
        this.speed = 6;
        this.x1 = x1;
        this.y1 = (SCREEN_HEIGHT - SCREEN_HEIGHT * 0.10) / 2;
        this.x2 = this.x1 + this.width;
        this.y2 = this.y1 + this.height;
      }

      moveUp() {
        if (this.y1 <= 0) {
          this.y1 = 0;
        } else {
            this.y1 -= this.speed;
        }
        this.y2 = this.y1 + this.height;
      }

      moveDown() {
        if (this.y2 > SCREEN_HEIGHT) {
          this.y1 = SCREEN_HEIGHT - this.height;
        } else {
          this.y1 += this.speed;
        }
        this.y2 = this.y1 + this.height;
      }
    }

    /**
     * Ball movement functions
     */

    /**
     * Updates the position of the ball.
     */
    function updateBall() {
      ball.radians = ball.angle * Math.PI / 180;
      ball.xunits = Math.cos(ball.radians) * ball.speed;
      ball.yunits = Math.sin(ball.radians) * ball.speed;

      if (ball.trips % 2 === 0 && ball.speed < ball.speedLimit) {
        ball.trips += 1;
        ball.speed += 1;
      }
    }

    /**
     * Resets the angle of the ball. To be used at the beginning of the game
     * or after someone scores.
     * @param {string} situation The situation that helps determine the angle
     *     the ball should be set at.
     */

    function resetBallAngle(situation) {
        var randomNumber = 0;
        ball.trips = 1;
        ball.speed = ball.defaultSpeed;
				
        switch (situation) {
        case 'playerOneScores':
          randomNumber = Math.floor(Math.random() * 2);
          break;
        case 'playerTwoScores':
          randomNumber = Math.floor(Math.random() * 2) + 2;
          break;
        case 'startGame':
          randomNumber = Math.floor(Math.random() * 4);
          break;
        }

        switch (randomNumber) {
          case 0:
            ball.angle = 45;
            break;
          case 1:
            ball.angle = 315;
            break;
          case 2:
            ball.angle = 135;
            break;
          case 3:
            ball.angle = 225;
            break;
        }
    }

    /**
     * Places the ball random point along the middle of the line.
     */
    function resetBallPosition() {
        var max = SCREEN_HEIGHT - (5 * ball.width),
            min = 5 * ball.width,
            randomNumber = Math.floor(Math.random() * (max - min + 1)) + min;
        ball.y1 = randomNumber;
        ball.x1 = (SCREEN_WIDTH / 2) - ball.width;
    }

    /**
     * Resets the ball position and angle. This function should be called
     * after someone scores or starts the game.
     * @param {string} situation The situation that helps determine the angle
     *     the ball should be set at.
     */
    function resetBall(situation) {
        resetBallAngle(situation);
        resetBallPosition();
    }

    /**
     * Paddle functions
     */

    /**
     * Test to see if the ball moving toward the right.
     * @return {boolean} Returns true if the ball is moving to the right of the
     * screen.
     */
    function isBallMovingToRight() {
        return (ball.xunits > 0);
    }

    /**
     * Test to see if the ball moving toward the left.
     * @return {boolean} Returns true if the ball is moving to the left of the
     * screen.
     */
    function isBallMovingToLeft() {
        return (ball.xunits < 0);
    }

    /**
     * Test to see if the ball is above the paddle.
     * @param {Object} paddle This is the paddle that gets tested.
     * @return {boolean} Returns true if the ball is above the paddle.
     */
    function isBallAbovePaddle(paddle) {
        var cy = paddle.y1 + (paddle.height / 2);
        return (ball.y2 < cy);
    }

    /**
     * Test to see if the ball is below the paddle.
     * @param {Object} paddle This is the paddle that gets tested.
     * @return {boolean} Returns true if the ball is below the paddle.
     */
    function isBallBelowPaddle(paddle) {
        var cy = paddle.y1 + (paddle.height / 2);
        return (ball.y1 > cy);
    }

    /**
     * Returns the distance between the y midpoint of the paddle and screen.
     * @param {Object} paddle This is the paddle that gets tested.
     * @return {boolean} Returns the distance between the y midpoint of the
     * paddle and screen.
     */
    function findPaddlePositionToCenter(paddle) {
        var screenMidpointY = SCREEN_HEIGHT / 2,
            paddleOneMidpointY = paddle.y1 + (paddle.height / 2),
            dy = paddleOneMidpointY - screenMidpointY;

        return dy;
    }

    /**
     * Returns true if the paddle y midpoint is within 10 px of the center of
     * the screen.
     * @param {number} dy The distance between the y midpoint of the paddle
     * and screen.
     * @return {boolean} Returns true if the paddle y midpoint is within 10 px
     * of the center of the screen.
     */
    function isPaddleAtCenter(dy) {
        return ((dy > -10) && (dy < 10));
    }

    /**
     * Returns true if the paddle y midpoint is > 10 px of the center of the
     * screen.
     * @param {number} dy The distance between the y midpoint of the paddle
     * and screen.
     * @return {boolean} Returns true if the paddle y midpoint is > 10 px of the
     * center of the screen.
     */
    function isPaddleBelowCenter(dy) {
        return (dy > 10);
    }

    /**
     * Returns true if the paddle y midpoint is < 10 px of the center of the
     * screen.
     * @param {number} dy The distance between the y midpoint of the paddle
     * and screen.
     * @return {boolean} Returns true if the paddle y midpoint is < 10 px of the
     * center of the screen.
     */
    function isPaddleAboveCenter(dy) {
        return (dy < 10);
    }

    /**
     * Performs actions if ball is moving toward paddle.
     * @param {Object} paddle This is the paddle that gets tested.
     */
    function ballMovingTowardPaddleActions(paddle) {
        if (isBallAbovePaddle(paddle)) {
            paddle.moveUp();
        } else if (isBallBelowPaddle(paddle)) {
            paddle.moveDown();
        }
    }

    /**
     * Performs actions if ball is moving away from paddle.
     * @param {Object} paddle This is the paddle that gets tested.
     */
    function ballMovingAwayPaddleActions(paddle) {
        var dy = findPaddlePositionToCenter(paddle);

        if ((isPaddleBelowCenter(dy)) &&
                (!isPaddleAtCenter(dy))) {
            paddle.moveUp();
        } else if ((isPaddleAboveCenter(dy)) &&
                (!isPaddleAtCenter(dy))) {
            paddle.moveDown();
        }
    }

    /**
     * Collision check functions
     */

    /**
     * Checks to see if the ball collides with the wall.
     */
    function wallCollisionCheck() {
        if (ball.x2 > canvas.width) {
            ball.angle = 180 - ball.angle;
            if (gameStatus === 'game') { scoreOne += 1; }
            resetBall('playerOneScores');
        } else if (ball.x1 < 0) {
            ball.angle = 180 - ball.angle;
            if (gameStatus === 'game') { scoreTwo += 1; }
            resetBall('playerTwoScores');
        } else if (ball.y2 > canvas.height || ball.y1 < 0) {
            ball.angle = 360 - ball.angle;
        }
    }

    /**
    * Checks to see if the ball collides with the paddle.
    */
    function paddlesCollisionCheck() {
        if (isBallMovingToLeft()) {
            if (isCollidingTop(ball, paddleOne)) {
                ball.angle = 90 + ball.angle;
                ball.trips += 1;
                blup.play();
            } else if (isCollidingBottom(ball, paddleOne)) {
                ball.angle = -90 + ball.angle;
                ball.trips += 1;
                blup.play();
            } else if (isCollidingRightLeft(ball, paddleOne)) {
                ball.angle = 180 - ball.angle;
                ball.trips += 1;
                blup.play();
            }
        } else if (isBallMovingToRight()) {
            if (isCollidingTop(ball, paddleTwo)) {
                ball.angle = 90 + ball.angle;
                ball.trips += 1;
                blup.play();
            } else if (isCollidingBottom(ball, paddleTwo)) {
                ball.angle = -90 + ball.angle;
                ball.trips += 1;
                blup.play();
            } else if (isCollidingRightLeft(ball, paddleTwo)) {
                ball.angle = 180 - ball.angle;
                ball.trips += 1;
                blup.play();
            }
        }
    }

    /**
     * Automatically moves paddle one.
     * @param {Object} paddle This is the paddle that gets moved.
     */
    function autoMovePaddleOne(paddle) {
        if (isBallMovingToLeft()) {
            ballMovingTowardPaddleActions(paddle);
        } else if (isBallMovingToRight()) {
            ballMovingAwayPaddleActions(paddle);
        }
    }

    /**
     * Automatically moves paddle two.
     * @param {Object} paddle This is the paddle that gets moved.
     */
    function autoMovePaddleTwo(paddle) {
        if (isBallMovingToRight()) {
            ballMovingTowardPaddleActions(paddle);
        } else if (isBallMovingToLeft()) {
            ballMovingAwayPaddleActions(paddle);
        }
    }

    /*
     * UI functions
     */

    /**
     * Draws text on the screen.
     * @param {string} text The text that will be used for the main message
     * on the screen.
     * @param {string} subText This text will be directly under the main message
     * and servers as a sub heading.
     */
    function drawScreenText(text, subText) {
        var x = SCREEN_WIDTH * 0.04,
            y = SCREEN_HEIGHT * 0.60;

        context.font = "bold 40pt 'Courier New'";
        context.textBaseline = 'top';
        context.textAlign = 'left';
        context.fillStyle = '#fff';
        context.fillText(text, x, y);
        context.font = "18pt 'Impact'";
        context.fillText(subText, x + 2, y + 55);
    }

    /**
     * paddleOne winning sequence.
     */
    function paddleOneWinner() {
        if (gameStatus !== 'over') {
            youLose.play();
        }

        drawScreenText('YOU LOSE!', 'Click  on the screen to start.');
        players = 0;
        gameStatus = 'over';
    }

    /**
     * paddleTwo winning sequence.
     */
    function paddleTwoWinner() {
        if (gameStatus !== 'over') {
            youWin.play();
        }

        drawScreenText('YOU WIN!', 'Click on the screen to start.');
        players = 0;
        gameStatus = 'over';
    }

    /**
     * Checks to see the scores. Changes score colors and ends game when
     * appropriate.
     */
    function scoresCheck() {
        switch (scoreOne) {
        case 9:
            scoreOneColor = 'red';
            break;
        case 10:
            paddleOneWinner();
            break;
        }

        switch (scoreTwo) {
        case 9:
            scoreTwoColor = 'red';
            break;
        case 10:
            paddleTwoWinner();
            break;
        }
    }

    /**
     * Draws the background of the screen.
     */
    function drawBackground() {
        context.fillStyle = constants.colors.SCREEN_COLOR;
        context.fillRect(0, 0, SCREEN_WIDTH, SCREEN_HEIGHT);
    }

    /**
     * Draws the current scores on the screen.
     */
    function drawScores() {
        if (gameStatus !== 'menu') {
            var scoreOneX = SCREEN_WIDTH * 0.25,
                scoreTwoX = SCREEN_WIDTH * 0.75,
                y = 20;
            context.font = "bold 40pt 'Courier New'";
            context.textBaseline = 'top';
            context.textAlign = 'center';
            context.fillStyle = scoreOneColor;
            context.fillText(scoreOne, scoreOneX, y);
            context.fillStyle = scoreTwoColor;
            context.fillText(scoreTwo, scoreTwoX, y);
        }
        scoresCheck();
    }

    /**
     * Draws the center line.
     */
    function drawCenterLine() {
        var y1 = 0,
            y2 = 20,
            lineColor = '#fff',
            lineWidth = '10';

        while (y1 < SCREEN_HEIGHT + y2) {
            context.fillStyle = lineColor;
            context.fillRect((SCREEN_WIDTH - 5) / 2, y1,
                lineWidth, y2);
            y1 += 50;
        }
    }

    /**
     * Draws the ball.
     */
    function drawBall() {
        context.fillStyle = ball.color;
        context.fillRect(ball.x1, ball.y1, ball.width, ball.width);
        updateBall();
        ball.x1 += ball.xunits;
        ball.y1 += ball.yunits;
        ball.x2 = ball.x1 + ball.width;
        ball.y2 = ball.y1 + ball.width;
        wallCollisionCheck();
        paddlesCollisionCheck();
    }

    /**
     * Draws the paddles.
     */
    function drawPaddles() {
        if (players === 0) {
            autoMovePaddleOne(paddleOne);
            autoMovePaddleTwo(paddleTwo);
        } else if (players === 1) {
            autoMovePaddleOne(paddleOne);
        }

        context.fillStyle = paddleOne.color;
        context.fillRect(paddleOne.x1, paddleOne.y1, paddleOne.width,
            paddleOne.height);
        context.fillRect(paddleTwo.x1, paddleTwo.y1, paddleTwo.width,
            paddleTwo.height);
    }

    /**
     * Draws text on the main screen.
     */
    function drawMainScreen() {
        drawScreenText('Paddle Battle', 'Click on the screen to start.');
    }

    /**
     * Runs the functions needed to draw the screen.
     */
    function drawScreen() {
        drawBackground();
        drawScores();
        drawCenterLine();
        drawBall();
        drawPaddles();
        if ((players === 0) && (gameStatus === 'menu')) {
            drawMainScreen();
        }
    }

    /**
     * Game initialization functions
     */

    /**
     * Initializes variables.
     */
    function initVariables() {
        scoreOne = 0;
        scoreTwo = 0;
        scoreOneColor = '#fff';
        scoreTwoColor = '#fff';
        ball = new Ball();
        paddleOne = new Paddle(SCREEN_WIDTH * 0.1);
        paddleTwo = new Paddle((SCREEN_WIDTH * 0.90) - (SCREEN_WIDTH * 0.014));
    }

    /**
     * Initializes sounds.
     */
    function initSounds() {
        blup = document.getElementById('blup');
        blup.volume = 0.2;
        youWin = document.getElementById('youWin');
        youWin.volume = 0.2;
        youLose = document.getElementById('youLose');
        youLose.volume = 0.2;
    }

    /**
     * Initializes listeners.
     */
    function initListeners() {
        $(canvas).mousemove(function(e) {
            if ((e.pageY !== undefined) && (players === 1)) {
                if (e.pageY < paddleTwo.height / 2) {
                    paddleTwo.y1 = 0;
                    paddleTwo.y2 = paddleTwo.height;
                } else if (e.pageY + paddleTwo.height / 2 > SCREEN_HEIGHT) {
                    paddleTwo.y1 = SCREEN_HEIGHT - paddleTwo.height;
                    paddleTwo.y2 = paddleTwo.y1 + paddleTwo.height;
                } else {
                    paddleTwo.y1 = e.pageY - (paddleTwo.height / 2);
                    paddleTwo.y2 = paddleTwo.y1 + paddleTwo.height;
                }
            }
        });

        $(canvas).click(function() {
            if (players === 0) {
                players = 1;
                initVariables();
                gameStatus = 'game';
                resetBall('startGame');
            }
        });
    }

    /**
     * Initializes game.
     */
    function initGame() {
        initVariables();
        resetBall('startGame');
        initListeners();
        initSounds();
    }

    /**
     * Runs the actual game.
     */
    function runGame() {
        setInterval(drawScreen, 10);
    }

    initGame();
    runGame();
}

/**
 * Starts the application after the window has been loaded.
 */
$(function() {
    'use strict';
    canvasApp();
});
