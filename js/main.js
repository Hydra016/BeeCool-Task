var game;
window.onload = function()
{

        game=new Phaser.Game(480,400,Phaser.AUTO,"ph_game");


    game.state.add("StateMain",StateMain);
    game.state.start("StateMain");
}
