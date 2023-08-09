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

  const getName = () => name;
  const getSign = () => sign;
  const getTries = () => tries;
  const updateTries = () => tries++;

  return { getSign, getTries, updateTries, getName };
};

const layoutController = (function () {
  const gameInitializerButton = document.querySelector(
      ".game-initializer .start-button",
    ),
    signSelector = document.querySelector(".game-initializer .sign-selector"),
    mainLayout = document.querySelector("main"),
    turnInfo = mainLayout.querySelector(".turn-info"),
    tiles = mainLayout.querySelectorAll(".tile");

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

    animateButton(e.target);

    setTimeout(() => {
      e.target.parentElement.classList.add("disabled");
      mainLayout.classList.remove("disabled");
    }, 500);
  });

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
    const notSignClass = player.getSign() === "o" ? "sign--x" : "sign--o"

    turnInfo
      .querySelector(".turn-info-sign")
      .setAttribute("class", `turn-info-sign ${signClass}`);
    turnInfo.querySelector("p").textContent = player.getName();

    tiles.forEach(tile => {
      if (!tile.classList.contains("sign")){
        if (tile.classList.contains(notSignClass)) tile.classList.remove(notSignClass);
        tile.classList.add(signClass);
      }
    });
  };

  return {};
})();

const gameManager = (function () {
  let player1, player2, playerRound;
  let round = 0;

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

  const playRound = () => {};

  return { setPlayers };
})();
