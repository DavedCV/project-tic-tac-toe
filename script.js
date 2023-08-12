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

const Player = (playerName, playerSign) => {
  const sign = playerSign;
  const name = playerName;

  let tries = 0;
  let winningRounds = 0;

  const getName = () => name;
  const getSign = () => sign;
  const getTries = () => tries;
  const updateTries = () => tries++;
  const getWinningRounds = () => winningRounds;
  const updateWinningRounds = () => winningRounds++;

  return {
    getSign,
    getTries,
    updateTries,
    getName,
    getWinningRounds,
    updateWinningRounds,
  };
};

const layoutController = (function () {
  const gameInitializerButton = document.querySelector(
      ".game-initializer .start-button",
    ),
    signSelector = document.querySelector(".game-initializer .sign-selector"),
    mainLayout = document.querySelector("main"),
    turnInfo = mainLayout.querySelector(".turn-info"),
    tiles = [...mainLayout.querySelectorAll(".tile")],
    board = mainLayout.querySelector(".board"),
    overlay = document.querySelector(".overlay"),
    infoRound = document.querySelector(".round-info");

  let firstPlayerSign,
    secondPlayerSign,
    firstPlayerName = "",
    secondPlayerName = "";

  signSelector.addEventListener("click", (e) => {
    if (e.target.id === "sign-x") {
      firstPlayerSign = "x";
      secondPlayerSign = "o";
    } else {
      firstPlayerSign = "o";
      secondPlayerSign = "x";
    }
  });

  gameInitializerButton.addEventListener("click", (e) => {
    if (firstPlayerSign === undefined) return;

    const firstPlayer = gameManager.setPlayers(
      firstPlayerName,
      firstPlayerSign,
      secondPlayerName,
      secondPlayerSign,
    );

    updatePlayerData(firstPlayer);
    addEventListenerBoard();

    animateButton(e.target);

    setTimeout(() => {
      e.target.parentElement.classList.add("disabled");
      mainLayout.classList.remove("disabled");
    }, 500);
  });

  const openInfoRoundBox = () => {
    infoRound.classList.add("active");
    overlay.classList.add("active");
  };

  const closeInfoRoundBox = () => {
    infoRound.classList.remove("active");
    overlay.classList.remove("active");
  };

  const playRound = (e) => {
    if (
      !e.target.classList.contains("tile") ||
      e.target.classList.contains("sign")
    )
      return;
    gameManager.playRound(e.target);
  };

  const addEventListenerBoard = () => {
    board.addEventListener("click", playRound);
  };

  const deleteEventListenerBoard = () => {
    board.removeEventListener("click", playRound);
  };

  const animateButton = (button) => {
    function removeTransition(e) {
      if (e.propertyName !== "transform") return;
      button.classList.remove("clicked");
    }

    button.classList.add("clicked");
    button.addEventListener("transitionend", removeTransition);
  };

  const updatePlayerData = (player) => {
    const signClass = player.getSign() === "o" ? "sign--o" : "sign--x";
    const notSignClass = player.getSign() === "o" ? "sign--x" : "sign--o";

    turnInfo
      .querySelector(".turn-info-sign")
      .setAttribute("class", `turn-info-sign ${signClass}`);
    turnInfo.querySelector("p").textContent = player.getName();

    tiles.forEach((tile) => {
      if (!tile.classList.contains("sign")) {
        if (tile.classList.contains(notSignClass))
          tile.classList.remove(notSignClass);
        tile.classList.add(signClass);
      }
    });
  };

  const markTile = (tile, sign) => {
    const signClass = sign === "o" ? "sign--o" : "sign--x";
    animateButton(tile);
    tile.classList.add("sign");
  };

  const colorWinningGame = (winningGame) => {
    const targetTiles = tiles.filter((tile) =>
      winningGame.includes(Number(tile.dataset.index)),
    );
    targetTiles.forEach((tile) => tile.classList.add("winning-tile"));
  };

  return {
    markTile,
    updatePlayerData,
    colorWinningGame,
    deleteEventListenerBoard,
    openInfoRoundBox,
  };
})();

const gameManager = (function () {
  let player1, player2, playerRound;
  let round = 0;
  let move = 0;

  const setPlayers = (firstName, firstSign, secondName, secondSign) => {
    if (firstName === "") player1 = Player("HUMAN", firstSign);
    else player1 = Player(firstName, firstSign);

    if (secondName === "") player2 = Player("AI", secondSign);
    else player2 = Player(secondName, secondSign);

    firstMove();
    return playerRound;
  };

  const firstMove = () => {
    playerRound = Math.random() >= 0.5 ? player1 : player2;
  };

  const playRound = (tile) => {
    const indexTile = Number(tile.dataset.index);

    GameBoard.setPosition(indexTile, playerRound.getSign());

    move++;
    playerRound.updateTries();

    layoutController.markTile(tile, playerRound.getSign());

    const endRound = checkGameState(move, indexTile, playerRound.getSign());
    if (endRound) {
      layoutController.deleteEventListenerBoard();
      layoutController.openInfoRoundBox();
    }

    playerRound = playerRound == player1 ? player2 : player1;
    layoutController.updatePlayerData(playerRound);
  };

  const checkGameState = (move, indexTile) => {
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
        playerRound.updateWinningRounds();
        layoutController.colorWinningGame(poss);
        break;
      }
    }

    if (move === 9) finalRound = true;

    return finalRound;
  };

  return { setPlayers, playRound };
})();
