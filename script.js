/* Module that represents the game board and mantains its state through
every round */
const GameBoard = (() => {
  const board = ["", "", "", "", "", "", "", "", ""];
  const winningCombinations = [
    [1, 2, 3],
    [4, 5, 6],
    [7, 8, 9],
    [1, 4, 7],
    [2, 5, 8],
    [3, 6, 9],
    [1, 5, 9],
    [3, 5, 7],
  ];

  const setPosition = (position, sign) => {
    board[position - 1] = sign;
  };

  const getPosition = (position) => {
    return board[position - 1];
  };

  const resetFields = () => {
    board.forEach((entry, index, array) => (array[index] = ""));
  };

  const getCopyBoard = () => {
    return [...board];
  };

  const getWinningCombinations = () => winningCombinations;

  return {
    getPosition,
    setPosition,
    resetFields,
    getCopyBoard,
    getWinningCombinations,
  };
})();

/* Factory functions to construct Player objects and keep track 
of the data that represents it */
const Player = (playerName, playerSign) => {
  const sign = playerSign;
  const name = playerName;

  let winningRounds = 0;

  const getName = () => name;
  const getSign = () => sign;
  const getWinningRounds = () => winningRounds;
  const updateWinningRounds = () => winningRounds++;

  return {
    getSign,
    getName,
    getWinningRounds,
    updateWinningRounds,
  };
};

/* Module that is in charge of the DOM manipulation through the game */
const LayoutController = (function () {
  // ------------------------- module variables --------------------------------

  const gameInitializer = document.querySelector(".game-initializer"),
    gameInitializerButton = document.querySelector(
      ".game-initializer .start-button",
    ),
    typeSelector = document.querySelector(".game-initializer .type-selector"),
    signSelector = document.querySelector(".game-initializer .sign-selector"),
    mainLayout = document.querySelector("main"),
    turnInfo = mainLayout.querySelector(".turn-info"),
    turnInfoFinishAll = document.querySelector(".game-info > button"),
    statsInfo = mainLayout.querySelector(".stats-info"),
    infoRound = document.querySelector(".round-info"),
    buttonNextMatch = infoRound.querySelector(".next-match"),
    buttonFinishAll = infoRound.querySelector(".finish-all"),
    tiles = [...mainLayout.querySelectorAll(".tile")],
    board = mainLayout.querySelector(".board"),
    overlay = document.querySelector(".overlay");

  // variables to keep track of the sign of the selected player in the start menu
  let startSignSelection = "";
  let typeSelection = "";

  // -------------------------- event listeners --------------------------------

  // listener to the type of game selector
  typeSelector.addEventListener("click", (e) => {
    if (e.target.id === "human-human") typeSelection = "human-human";
    else typeSelection = "human-ai";

    if (typeSelection === "human-ai")
      signSelector.parentElement.classList.remove("disabled");
    else signSelector.parentElement.classList.add("disabled");
  });

  // listener to the sign of the player selected when in the AI mode
  signSelector.addEventListener("click", (e) => {
    if (e.target.id === "sign-x") startSignSelection = "x";
    else startSignSelection = "o";
  });

  // listener to the button that start the interaction between the layout manager
  // and the game manager
  gameInitializerButton.addEventListener("click", (e) => {
    if (startSignSelection === undefined && typeSelection === "human-ai")
      return;

    // get the appropiate data for the players
    let firstPlayerSign,
      secondPlayerSign,
      firstPlayerName = "",
      secondPlayerName = "";

    if (e.target.id === "sign-x") {
      firstPlayerSign = "x";
      secondPlayerSign = "o";
    } else {
      firstPlayerSign = "o";
      secondPlayerSign = "x";
    }

    if (typeSelection === "human-human") {
      firstPlayerName = "player 1";
      secondPlayerName = "player 2";
    } else {
      firstPlayerName = "human";
      secondPlayerName = "ai";
    }

    // create the player instances via the game manager, and start altering the
    // DOM based on the random selection of the first player
    GameManager.setPlayers(
      firstPlayerName,
      firstPlayerSign,
      secondPlayerName,
      secondPlayerSign,
    );

    addEventListenerBoard();

    animateButton(e.target);

    // remove the start section and show the actual game section
    setTimeout(() => {
      gameInitializer.classList.add("disabled");
      mainLayout.classList.remove("disabled");
    }, 500);
  });

  // event listener to the next round button present on the round information box
  // displayed after game finalization
  buttonNextMatch.addEventListener("click", () => {
    closeInfoRoundBox();
    tiles.forEach((tile) => tile.setAttribute("class", "tile"));
    GameManager.nextMatch();
  });

  // callback function to reset the game when a button with this objective is clicked
  const finishAll = () => {
    closeInfoRoundBox();
    tiles.forEach((tile) => tile.setAttribute("class", "tile"));
    GameManager.resetGame();
    mainLayout.classList.add("disabled");
    gameInitializer.classList.remove("disabled");
  };

  buttonFinishAll.addEventListener("click", finishAll);
  turnInfoFinishAll.addEventListener("click", finishAll);

  // methods to bind and unbind event listeners of the board when is necessary
  const addEventListenerBoard = () => {
    board.addEventListener("click", playRound);
  };
  const deleteEventListenerBoard = () => {
    board.removeEventListener("click", playRound);
  };

  // -------------------------------- module methods ---------------------------

  // method to animate when clicked some DOM elements
  const animateButton = (element) => {
    function removeTransition(e) {
      if (e.propertyName !== "transform") return;
      element.classList.remove("clicked");
    }

    element.classList.add("clicked");
    element.addEventListener("transitionend", removeTransition);
  };

  // methods to open and close the info round box, based on the game state
  const openInfoRoundBox = (tie, playerName, playerSign) => {
    infoRound.classList.add("active");
    overlay.classList.add("active");

    if (tie) {
      infoRound.querySelector(".round-info-text > p").textContent =
        "It's a Tie!";

      infoRound
        .querySelector(".round-info-text .winner-round-sign")
        .setAttribute("class", "winner-round-sign");

      infoRound.querySelector(".round-info-text > div > p").textContent = "";
    } else {
      const signClass = playerSign === "o" ? "sign--o" : "sign--x";
      infoRound
        .querySelector(".round-info-text .winner-round-sign")
        .setAttribute("class", `winner-round-sign ${signClass}`);

      infoRound.querySelector(".round-info-text > div > p").textContent =
        playerName;

      infoRound.querySelector(".round-info-text > p").textContent =
        "It's the winner!";
    }
  };
  const closeInfoRoundBox = () => {
    infoRound.classList.remove("active");
    overlay.classList.remove("active");
  };

  // method to mark a specific tile and play a round of the game
  const playRound = (e) => {
    if (
      !e.target.classList.contains("tile") ||
      e.target.classList.contains("sign")
    )
      return;

    markTile(e.target);
    GameManager.playRound(e.target);
  };

  // method to mark a tile when the AI makes a selection
  const aiMarkTile = (indexTile) => {
    const tile = tiles[indexTile];
    markTile(tile);
  };

  // method to add the respective classes to the tile marked
  const markTile = (tile) => {
    animateButton(tile);
    tile.classList.add("sign");
  };

  // method to update the data of the board and the info pane, based on the
  // data of the round player (change the signs showed in the board)
  const updatePlayerData = (playerSign, playerName) => {
    const signClass = playerSign === "o" ? "sign--o" : "sign--x";
    const notSignClass = playerSign === "o" ? "sign--x" : "sign--o";

    turnInfo
      .querySelector(".turn-info-sign")
      .setAttribute("class", `turn-info-sign ${signClass}`);
    turnInfo.querySelector("p").textContent = playerName;

    tiles.forEach((tile) => {
      if (!tile.classList.contains("sign")) {
        if (tile.classList.contains(notSignClass))
          tile.classList.remove(notSignClass);
        tile.classList.add(signClass);
      }
    });
  };

  // method used to modify the counter of the stats of all games
  const updateStatsInfo = (player1Rounds, player2Rounds, tiesNumber) => {
    statsInfo.querySelector(".stat.sign--x > p:last-of-type").textContent =
      player1Rounds;
    statsInfo.querySelector(".stat.sign--o > p:last-of-type").textContent =
      player2Rounds;
    statsInfo.querySelector(".stat.ties > p:last-of-type").textContent =
      tiesNumber;
  };

  // method use to color the tiles of a winning game
  const colorWinningGame = (winningGame) => {
    const targetTiles = tiles.filter((tile) =>
      winningGame.includes(Number(tile.dataset.index)),
    );
    targetTiles.forEach((tile) => tile.classList.add("winning-tile"));
  };

  return {
    updatePlayerData,
    updateStatsInfo,
    colorWinningGame,
    addEventListenerBoard,
    deleteEventListenerBoard,
    openInfoRoundBox,
    aiMarkTile,
  };
})();

/* Module that manages the general flow of the game and connect the DOM interface
to the game board representation */
const GameManager = (function () {
  // ---------------------------- module variables -----------------------------

  let player1, player2, playerRound;
  let tiesNumber = 0;
  let tie = false;
  let move = 0;

  // ------------------------------ module methods -----------------------------

  // method to create the instances of the players and randomly select
  // the first player
  const setPlayers = (firstName, firstSign, secondName, secondSign) => {
    player1 = Player(firstName, firstSign);
    player2 = Player(secondName, secondSign);

    // console.log(player1.getName(), player1.getSign());
    // console.log(player2.getName(), player2.getSign());

    firstMove();

    LayoutController.updatePlayerData(
      playerRound.getSign(),
      playerRound.getName(),
    );

    if (playerRound.getName() === "ai") playRound();
  };
  const firstMove = () => {
    playerRound = Math.random() >= 0.5 ? player1 : player2;
  };

  // method to play a round and update the info of the players, the game board,
  // and check the general state of the match
  const playRound = (tile) => {
    
    let indexTile = 0;
    if (playerRound.getName() !== "ai") {
      indexTile = Number(tile.dataset.index);
    } else {
      const bestMove = findBestMove(GameBoard.getCopyBoard());
      LayoutController.aiMarkTile(bestMove);
      indexTile = bestMove + 1;
    }
    GameBoard.setPosition(indexTile, playerRound.getSign());
    move++;

    const endRound = checkGameStateAfterMove(
      move,
      indexTile,
      playerRound.getSign(),
    );
    if (endRound) {
      LayoutController.deleteEventListenerBoard();
      if (tie) {
        LayoutController.openInfoRoundBox(true, "", "");
      } else {
        LayoutController.openInfoRoundBox(
          false,
          playerRound.getName(),
          playerRound.getSign(),
        );
      }
    }

    playerRound = playerRound == player1 ? player2 : player1;
    LayoutController.updatePlayerData(
      playerRound.getSign(),
      playerRound.getName(),
    );

    if (playerRound.getName() === "ai" && !endRound) playRound();
  };

  // method to check the game state after every move
  const checkGameStateAfterMove = (movesNumber, indexTile) => {
    let finalRound = false;
    let winnigGame = false;

    const possibilities = GameBoard.getWinningCombinations().filter((poss) =>
      poss.includes(indexTile),
    );

    for (let poss of possibilities) {
      if (
        poss.every(
          (index) => GameBoard.getPosition(index) === playerRound.getSign(),
        )
      ) {
        finalRound = true;
        winnigGame = true;
        tie = false;
        playerRound.updateWinningRounds();
        LayoutController.colorWinningGame(poss);
        break;
      }
    }

    if (movesNumber === 9) {
      if (!winnigGame) {
        tiesNumber++;
        tie = true;
      }
      finalRound = true;
    }

    return finalRound;
  };

  // method to start the next match and reset some values
  const nextMatch = () => {
    firstMove();

    let xSignPlayerRounds, oSignPlayerRounds;
    if (player1.getSign() === "x") {
      xSignPlayerRounds = player1.getWinningRounds();
      oSignPlayerRounds = player2.getWinningRounds();
    } else {
      oSignPlayerRounds = player1.getWinningRounds();
      xSignPlayerRounds = player2.getWinningRounds();
    }
    LayoutController.updateStatsInfo(
      xSignPlayerRounds,
      oSignPlayerRounds,
      tiesNumber,
    );

    LayoutController.updatePlayerData(
      playerRound.getSign(),
      playerRound.getName(),
    );
    LayoutController.addEventListenerBoard();
    GameBoard.resetFields();
    move = 0;

    if (playerRound.getName() === "ai") playRound();
  };

  // method to reset the whole game when needed
  const resetGame = () => {
    player1 = player2 = playerRound = null;
    tiesNumber = move = 0;
    GameBoard.resetFields();
    LayoutController.updateStatsInfo(0, 0, 0);
  };

  /* --------- AI game decision and helper methods ---------------------------*/

  // helper function to check wheter the games has a winner already or its a tie
  const checkWinner = (board) => {
    let winner;

    for (let comb of GameBoard.getWinningCombinations()) {
      const baseSign = board[comb[0] - 1];
      if (
        comb.every((element) => board[element - 1] === baseSign) &&
        baseSign != ""
      ) {
        winner =
          baseSign === player1.getSign()
            ? player1.getName()
            : player2.getName();
        break;
      }
    }

    if (winner) return winner;
    else return "tie";
  };

  // helper method to check if the board have free slots
  const isMovesLeft = (board) => {
    for (let i = 0; i < board.length; i++) if (board[i] === "") return true;
    return false;
  };

  // entry point of the AI to select the best move given a bord
  const findBestMove = (board) => {
    let maxScore = -Infinity;
    let maxMove = null;

    for (let i = 0; i < board.length; i++) {
      if (board[i] === "") {
        board[i] = player2.getSign();
        let score = minimax(board, false);
        board[i] = "";

        if (score > maxScore) {
          maxScore = score;
          maxMove = i;
        }
      }
    }

    return maxMove;
  };

  // minimax function to get the combinations of the board recursively and select the best option
  // alternating between players and assuming both players plays the best
  const minimax = (board, aiPlayer) => {
    let winner = checkWinner(board);

    if (winner === "ai") return 10;
    else if (winner === "human") return -10;

    if (!isMovesLeft(board)) return 0;

    if (aiPlayer) {
      let bestScore = -Infinity;

      for (let i = 0; i < board.length; i++) {
        if (board[i] === "") {
          board[i] = player2.getSign();
          bestScore = Math.max(bestScore, minimax(board, false));
          board[i] = "";
        }
      }

      return bestScore;
    } else {
      let bestScore = Infinity;

      for (let i = 0; i < board.length; i++) {
        if (board[i] === "") {
          board[i] = player1.getSign();
          bestScore = Math.min(bestScore, minimax(board, true));
          board[i] = "";
        }
      }

      return bestScore;
    }
  };

  return { setPlayers, playRound, nextMatch, resetGame };
})();
