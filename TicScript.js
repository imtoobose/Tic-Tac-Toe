var state = {
  win   : 0,
  winningCombo: [],
  started: 0,
  mode:'strict'
};

var stats={
  wins: 0,
  loss: 0,
  tie: 0
};

var computer = {
  token : 'x',
  name  : 'computer',
  avail : []
};

var human = {
  token : 'o',
  name  : 'human',
  avail : []
};

var interface = {
  reset:
    function(){
      $(".textContain").html("OPTIONS");
      for(var i in state.winningCombo){
        $("#childval-"+ state.winningCombo[i]+" > i").removeClass("pulse");
        $("#childval-"+state.winningCombo[i]).css("color", "black");
      }
      state.winningCombo=[];
      game.board=[0,0,0,0,0,0,0,0,0];
      human.avail=[];
      computer.avail=[];
      for(var i=0; i<9; i++){
        $("#childval-"+i).removeClass("disabled");
        $("#val-"+i+"> .data").html("");
      }
      if(state.win===1){
        state.win=0;
        interface.replayGame();
      }
      state.win=0;
    },
  
  showWinner:
    function(combo){
      for(var i in combo){
        $("#childval-"+combo[i]).css("color", "#F03A47");
        $("#childval-"+combo[i]+" > i").addClass("pulse");
      }
      
      for(var j in game.board){
        if(game.board[j]===0)
          $("#childval-"+j).addClass("disabled");
      }
      
      setTimeout(interface.reset, 3000);
    },
  replayGame:
    function(){
      if(computer.token=='x'){
        play();
      }
    },
  
  updateStat:
    function(val){
      var up=0;
      if(val=='win') up=stats.wins; 
      else if(val=='loss')up=stats.loss;
      else up=stats.tie;
      $("."+val).html(up);
    }
};

var game = {
  board       : [0,0,0,0,0,0,0,0,0],

  win_combos  : [[0,1,2], [0,3,6], [0,4,8],
                [1,4,7], [2,4,6], [2,5,8],
                [6,7,8], [3,4,5]] ,

  possible    : 
    function(board){
      var b=[];
      for(var i in board){
        if(board[i]===0) b.push(i);
      }
      return b;
    },

  isWinner    : 
    function(){
      var list=[human, computer];
                 
      for (var p in list){
        var player = list[p];
        var pos    = player.avail;
        var combo  = game.win_combos;
        var won;
        for(var i in combo){
          won=true;
          for(var j in combo[i]){
            if(pos.indexOf(combo[i][j])==-1)
              {
              won=false;
              break;
            }
          }
          if(won==true){
            state.winningCombo=combo[i];
            return player;
          }
        }
      }
      return false;
    },

  isComplete  : 
    function(){
      if((game.possible(game.board)).length===0) return true;
      else if (game.isWinner()!= false) return true;
      else return false;
    },
  
  getOpposite : 
    function(player){
      if(player.name=='computer')
        return human;
      else return computer;
    },

  minimax     : 
    function(player, depth){    
      if(game.isComplete()){
        var winner = game.isWinner();
        if(winner==false)
          return depth;
        else if (winner.name=='computer')
          return 100-depth;
        else 
          return depth-100;
      }

      var moves = game.possible(game.board);
      if(player.name=='computer')
        var best  = -10000;
      else 
        best= 10000;
      for(var i in moves){  
        game.board[moves[i]] = player.token;
        player.avail.push(+moves[i]);
        var score = game.minimax(game.getOpposite(player), depth+1);
        var t     = player.avail.pop();
        game.board[moves[i]]=0;
                  
        if(player.name=='computer'){
          if(score>best){
            best=score;
          }
        }
        else{
          if(score<best){
            best=score;
          }
        }
      }
      return best; 
    }
};

//easy mode logic:
//1. if you can make a winning move, make it
//2. if you can block a losing move, block it
//3. make a random move
//this leaves it open to forks 

function easyPlay(moves){
  var nowMove=-1;
  var nowR;
  console.log(moves);
  for(var i in moves){
    game.board[+moves[i]]=computer.token;
    computer.avail.push(+moves[i]);
    if(game.isComplete()){
      var insideWin= game.isWinner();
      if(insideWin!=false){
        nowMove=100;
        nowR=moves[i];
        game.board[moves[i]]=0;
        computer.avail.pop();
        break;
      }
    }
    game.board[moves[i]]=0;
    computer.avail.pop();
    game.board[+moves[i]]=human.token;
    human.avail.push(+moves[i]);
    if(nowMove==-1 && game.isComplete()){
      insideWin= game.isWinner();
      if(insideWin!=false){
        nowMove=-100;
        nowR=moves[i];
      }
    }
    game.board[moves[i]]=0;
    human.avail.pop();
  }
  
  if(nowMove==-1){
    var r= moves[Math.floor(Math.random()*moves.length)];
  }
  else{
    console.log(nowMove+" "+nowR)
    r= nowR;
  }
  
  computer.avail.push(+r);
  game.board[r]=computer.token;
  if(computer.token=='x') var wooClass= "fa fa-times";
  else wooClass= "fa fa-circle-o";
  $("#childval-"+r).html('<i class="'+wooClass+'" aria-hidden=true/>');
  $("#childval-"+r).addClass("disabled");
  
  if(game.isComplete()){
    var woo= game.isWinner();
    state.win=1;
    //console.log(state.winningCombo);
    if(woo==false){
      stats.tie++;
      $(".textContain").html("TIE");
      interface.updateStat('tie');
      setTimeout(interface.reset, 2000);
    }
    else if(woo.name=='computer'){
      stats.loss++;
      $(".textContain").html("LOSS");
      interface.updateStat('loss');
      interface.showWinner(state.winningCombo);
    }
    else{
      stats.wins++;
      interface.updateStat('win');
      $(".textContain").html("WIN");
      interface.showWinner(state.winningCombo);
    }
  }
  
}

//the main function call
function play(){
  var best        = -100000;
  var bestmove    = null;
  var valid_moves = [];
  var p           = game.possible(game.board);
  
  if(state.mode=='easy'){
    easyPlay(p);
    return;
  }
  
  if(p.length==9){
    var rand= Math.floor(Math.random()*8);
    computer.avail.push(rand);
    game.board[rand]=computer.token;
    $("#childval-"+rand).html('<i class="fa fa-times" aria-hidden=true/>');
    $("#childval-"+rand).addClass("disabled");
    return;
  }
  
  for(var i in p){
    game.board[p[i]] = computer.token;
    computer.avail.push(+p[i]);
    var now;

    if(game.isComplete()){
      var winner = game.isWinner();
      if(winner==false)
        now=0;
      else if(winner.name=='computer')
        now=100;
      else 
        now=-100;
    }

    else
      now = game.minimax(human, 0);

    game.board[p[i]]=0;
    computer.avail.pop();
    
    if(now>best){
      best       = now;
      valid_moves= [+p[i]];
    }

    else if(now==best){
      valid_moves.push(+p[i]);
    }
  }
  
  bestmove = valid_moves[
              Math.floor(
                Math.random()*
                  valid_moves.length)];

  game.board[bestmove] = computer.token;
  computer.avail.push(bestmove);
  if(computer.token=='x')
    $('#childval-'+bestmove).html('<i class="fa fa-times" aria-hidden=true/>');
  else
    $('#childval-'+bestmove).html('<i class="fa fa-circle-o" aria-hidden=true/>');
  $("#childval-"+bestmove).addClass('disabled');
  if(game.isComplete()){
    var woo= game.isWinner();
    state.win=1;
    //console.log(state.winningCombo);
    if(woo==false){
      stats.tie++;
      interface.updateStat('tie');
      $(".textContain").html("TIE");
      setTimeout(interface.reset, 2000);
    }
    else if(woo.name=='computer'){
      stats.loss++;
      interface.updateStat('loss');
      $(".textContain").html('LOSS');
      interface.showWinner(state.winningCombo);
    }
    else{
      stats.wins++;
      interface.updateStat(stats.wins);
      $(".textContain").html('win');
      interface.showWinner(state.winningCombo);
    }
  }
}

$('.data').on('click', function(e){
  var id= '#'+e.target.id;
  var val= id.slice(-1);
  game.board[val]=human.token;
  if(human.token=='x')
    $(id).html('<i class="fa fa-times" aria-hidden=true/>');
  else
    $(id).html('<i class="fa fa-circle-o" aria-hidden=true/>');
  $(id).addClass('disabled');
  human.avail.push(+val);
  if(game.isComplete()){
    var winner= game.isWinner();
    state.win=1;
    console.log(state.winningCombo);
    if(winner==false){
      stats.tie++;
      interface.updateStat('tie');
      $(".textContain").html("TIE");
      setTimeout(interface.reset, 2000);
    }
    else if(winner.name=='computer'){
      stats.loss++;
      interface.updateStat('loss');
      $(".textContain").html("LOSS");
      interface.showWinner(state.winningCombo);
    }
    else{ 
      stats.wins++;
      interface.updateStat('win');
      $(".textContain").html("WIN");
      interface.showWinner(state.winningCombo);
    }
  }  
  else{
    play();
  }
});

$("#butt-o").click(function(){
  interface.reset();
  human.token='o';
  computer.token='x';
  $("#butt-x").removeClass("activeButt");
  //$("butt-x").removeClass("disabled");
  $("#butt-o").addClass("activeButt");
  //$("#butt-o").addClass("disabled");
  play();
});

$("#butt-x").click(function(){
  interface.reset();
  human.token='x';
  computer.token='o';
  $("#butt-o").removeClass("activeButt");
  //$("#butt-o").removeClass("disabled");
  $("#butt-x").addClass("activeButt");
 // $("#butt-x").addClass("disabled");
});

$(".text").click(function(){
  var val= $(".text > .textContain").html();
  if(val=='OPTIONS' || val=='TIE' || val=='WIN' || val=='LOSS'){
    $(".boxContain").addClass("disabledFade");
    $(".options").fadeIn(200);
    $(".text > .textContain").html('CLOSE');
    $(".butt").hide();
  }
  else{
    $(".boxContain").removeClass("disabledFade");
    $(".options").fadeOut(200);
    $(".butt").show();
    $(".text > .textContain").html('OPTIONS');
  }
});

$(".modeChoice").click(function(){
  if(state.mode=='easy'){
    state.mode='strict'
    $(this).html("HARD");
  }
  else{
    state.mode='easy';
    $(this).html("EASY");
  }
});

$(document).ready(function(){
  $(".container").hide();
  $(".options").hide();
  $(".startbutt").click(function(e){
    var id= ''+e.target.id.slice(-1);
    //console.log(e.target.id);
    if(id=='x'){
      $("#butt-x").addClass("activeButt");
      //$("#butt-x").addClass("disabled");
      computer.token='o';
      human.token='x';
    }
    else{
      $("#butt-o").addClass("activeButt");
      //$("#butt-o").addClass("disabled");
      computer.token='x';
      human.token='o';
      play();
    }
   $(".startBox").fadeOut(300);
   $(".container").fadeIn(500);
  });
});