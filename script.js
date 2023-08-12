/* Module that represents the game board and mantains its state through
every round */
const GameBoard = (() => {
  const board = ["", "", "", "", "", "", "", "", ""];

  const setPosition = (position, sign) => {
    board[position - 1] = sign;
  };

  const getPosition = (position) => {
    return board[position - 1];
  };

  const resetFields = () => {
    board.forEach((entry, index, array) => (array[index] = ""));
  };

  return { getPosition, setPosition, resetFields };
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
const layoutController = (function () {
  // ------------------------- module variables --------------------------------

  const gameInitializer = document.querySelector(".game-initializer"),
    gameInitializerButton = document.querySelector(
      ".game-initializer .start-button",
    ),
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

  // -------------------------- event listeners --------------------------------

  signSelector.addEventListener("click", (e) => {
    if (e.target.id === "sign-x") startSignSelection = "x";
    else startSignSelection = "o";
  });

  // listener to the button that start the interaction between the layout manager
  // and the game manager
  gameInitializerButton.addEventListener("click", (e) => {
    if (startSignSelection === undefined) return;

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

    // create the player instances via the game manager, and start altering the
    // DOM based on the random selection of the first player
    gameManager.setPlayers(
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
    gameManager.nextMatch();
  });

  // callback function to reset the game when a button with this objective is clicked
  const finishAll = () => {
    closeInfoRoundBox();
    tiles.forEach((tile) => tile.setAttribute("class", "tile"));
    gameManager.resetGame();
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
    gameManager.playRound(e.target);
  };

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
  };
})();

/* Module that manages the general flow of the game and connect the DOM interface
to the game board representation */
const gameManager = (function () {
  // ---------------------------- module variables -----------------------------

  let player1, player2, playerRound;
  let matchNumber = 0;
  let tiesNumber = 0;
  let tie = false;
  let move = 0;

  // ------------------------------ module methods -----------------------------

  // method to create the instances of the players and randomly select
  // the first player
  const setPlayers = (firstName, firstSign, secondName, secondSign) => {
    if (firstName === "") player1 = Player("HUMAN", firstSign);
    else player1 = Player(firstName, firstSign);

    if (secondName === "") player2 = Player("AI", secondSign);
    else player2 = Player(secondName, secondSign);

    firstMove();
    layoutController.updatePlayerData(
      playerRound.getSign(),
      playerRound.getName(),
    );
  };
  const firstMove = () => {
    playerRound = Math.random() >= 0.5 ? player1 : player2;
  };

  // method to play a round and update the info of the players, the game board,
  // and check the general state of the match
  const playRound = (tile) => {
    move++;

    const indexTile = Number(tile.dataset.index);
    GameBoard.setPosition(indexTile, playerRound.getSign());

    const endRound = checkGameState(move, indexTile, playerRound.getSign());
    if (endRound) {
      layoutController.deleteEventListenerBoard();
      if (tie) {
        layoutController.openInfoRoundBox(true, "", "");
      } else {
        layoutController.openInfoRoundBox(
          false,
          playerRound.getName(),
          playerRound.getSign(),
        );
      }
    }

    playerRound = playerRound == player1 ? player2 : player1;
    layoutController.updatePlayerData(
      playerRound.getSign(),
      playerRound.getName(),
    );
  };

  // method to check the game state after every move
  const checkGameState = (movesNumber, indexTile) => {
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
    let finalRound = false;
    let winnigGame = false;

    const possibilities = winningCombinations.filter((poss) =>
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
        layoutController.colorWinningGame(poss);
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
    layoutController.updateStatsInfo(
      xSignPlayerRounds,
      oSignPlayerRounds,
      tiesNumber,
    );

    layoutController.updatePlayerData(
      playerRound.getSign(),
      playerRound.getName(),
    );
    layoutController.addEventListenerBoard();
    GameBoard.resetFields();
    move = 0;
    matchNumber++;
  };

  const resetGame = () => {
    player1 = player2 = playerRound = null;
    matchNumber = tiesNumber = move = 0;
    GameBoard.resetFields();
    layoutController.updateStatsInfo(0, 0, 0);
  };

  return { setPlayers, playRound, nextMatch, resetGame };
})();
