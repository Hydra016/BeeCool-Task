var credits = 100;
var credits_text;
var win_text;
var win = 0;

function getRandomArrayElement(array) {
  return array[Math.floor(Math.random() * array.length)];
}

var isSpinning = false;

var StateMain = {
  preload: function () {
    game.load.image("background", "images/background.png");
    game.load.image("bars", "images/strip_new.png");
    //loaded a new blurred strip
    game.load.image("bars-blur", "images/strip-blur.png");
    game.load.image("btnSpin", "images/btnSpin.png");
  },
  create: function () {
    this.background = game.add.sprite(0, 0, "background");
    this.background.anchor.set(0, 0);

    this.barGroup = game.add.group();
    this.graphics = game.add.graphics();

    //
    //add 3 bars
    //
    for (var i = 0; i < 3; i++) {
      var bar = game.add.sprite(i * 138, 0, isSpinning ? "bars-blur" : "bars");
      this.barGroup.add(bar);
    }
    //center the bar group horizontally
    this.barGroup.x = 50;
    //place the group 50 pixels up from the center
    //because 50 is half the height of the each cell
    this.barGroup.y = 110;
    //
    //draw graphics to use as a mask
    //
    this.graphics.beginFill(0xff0000);
    this.graphics.drawRect(0, 0, 400, 100);
    this.graphics.endFill();
    //subtract 150 from center
    //because the cells are 100 px each
    //and there are 3 of them
    //150 is half the width
    this.graphics.x = 50;
    this.graphics.y = this.barGroup.y;
    this.barGroup.mask = this.graphics;
    //
    //set initial values
    //
    this.setBar(0, 1);
    this.setBar(1, 1);
    this.setBar(2, 1);
    //
    //add spin button
    //
    this.btnSpin = game.add.sprite(game.width / 2, 370, "btnSpin");
    this.btnSpin.anchor.set(0.5, 0.5);
    this.btnSpin.inputEnabled = true;
    this.btnSpin.events.onInputDown.add(this.startSpin, this);

    //Add credits Text
    credits_text = game.add.text(175, 295, "" + credits);
    credits_text.anchor.set(0.5);
    credits_text.align = "center";

    credits_text.font = "Arial Black";
    credits_text.fontSize = 22;
    credits_text.fontWeight = "bold";
    credits_text.fill = "#fff";

    //Add win Text
    win_text = game.add.text(305, 295, "0");
    win_text.anchor.set(0.5);
    win_text.align = "center";

    win_text.font = "Arial Black";
    win_text.fontSize = 20;
    win_text.fontWeight = "bold";
    win_text.fill = "#fff";
  },
  startSpin() {
    credits--;
    credits_text.text = "" + credits;
    win_text.text = "";
    this.spinCount = 3;
    isSpinning = true;
    this.btnSpin.visible = false;

    //adding 30px tween
    game.add
      .tween(this.barGroup)
      .to({ y: this.barGroup.y + 30 }, 500, Phaser.Easing.Cubic.InOut, true)
      .onComplete.addOnce(function () {
        //making it simple rather than adding multiple cases
        var symbolArray = [1, 2, 3, 4, 5, 6, 17];

        var s1 = getRandomArrayElement(symbolArray);
        var s2 = getRandomArrayElement(symbolArray);
        var s3 = getRandomArrayElement(symbolArray);

        if (s1 == s2 && s2 == s3) {
          switch (s1) {
            case 1:
              win = 2;
              break; // 2bar
            case 2:
              win = 5;
              break; // bell
            case 3:
              win = 3;
              break; // 3bar
            case 4:
              win = 5;
              break; // cherry
            case 5:
              win = 10;
              break; // 7
            case 6:
              win = 1;
              break; // 1bar
            case 17:
              win = 50;
              break; // wild
          }
        }

        // case if 1 is wild and rest are same
        if (
          (s1 == 17 && s3 == s2) ||
          (s2 == 17 && s1 == s3) ||
          (s3 == 17 && s1 == s2)
        ) {
          win = 5;
        }

        this.setStop(0, s1);
        this.setStop(1, s2);
        this.setStop(2, s3);

        this.spinTimer = game.time.events.loop(
          Phaser.Timer.SECOND / 33.3333,
          this.spin,
          this
        );
      }, this);
  },
  setStop: function (i, stopPoint) {
    var bar = this.barGroup.getChildAt(i);
    bar.stopPoint = -stopPoint * 100;
    bar.active = true;
    bar.spins = 2 + 2 * i;
    //changin the y back to normal after the tween
    this.barGroup.y = 110;
  },
  setBar: function (i, pos) {
    var bar = this.barGroup.getChildAt(i);
    bar.y = -(pos - 1) * 100;
  },

  //loop through the bar group
  //and move each bar up by the number of spins it
  //has left by 2
  spin: function () {
    this.barGroup.forEach(
      function (bar) {
        if (bar.active == true) {
          bar.loadTexture(isSpinning ? "bars-blur" : "bars");

          bar.y += 50;
          //if the bar is at the end of a spin
          //which is when the y position
          //is less than the negative height of the bar
          //40 = bounce height
          if (bar.y > bar.stopPoint + 40) {
            //if out of spins then
            if (bar.spins <= 0) {
              bar.active = false;
              //do the final spin
              //which is a tween
              this.finalSpin(bar);
            }
          }
          if (bar.y > -100) {
            bar.y -= 500;
            //then subtract a spin
            bar.spins--;
            //if out of spins then
          }
        }
      }.bind(this)
    );
  },
  finalSpin: function (bar) {
    var ty = bar.stopPoint;
    var finalTween = game.add.tween(bar).to(
      {
        y: ty,
      },
      1000,
      Phaser.Easing.Cubic.InOut,
      true
    );

    finalTween.onComplete.add(function () {
      // Switch back to the regular bar image when the final spin is complete
      bar.loadTexture("bars");
      this.checkFinished();
    }, this);
  },
  checkFinished() {
    //subtract 1 from spinCount every time
    //a bar stops
    this.spinCount--;

    //if all bars have stop reset
    if (this.spinCount == 0) {
      game.time.events.remove(this.spinTimer);
      this.btnSpin.visible = true;
      Spinning = false;
      if (win > 0) {
        credits += win;
        win_text.text = "" + win;
        credits_text.text = "" + credits;
        win = 0;
      } else {
        win_text.text = "";
      }
    }
  },
  update: function () {},
};
