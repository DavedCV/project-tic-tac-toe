const layoutController = (function () {
  const gameInitializerButton = document.querySelector(
      ".game-initializer .start-button",
    ),
    signSelector = document.querySelector(".game-initializer .sign-selector");

  let firstPlayerSign, secondPlayerSign;

  signSelector.addEventListener("click", (e) => {
    if (e.target.id === "sign-x") {
      firstPlayerSign = "x";
      secondPlayerSign = "o";
    }else {
      firstPlayerSign = "o";
      secondPlayerSign = "x";
    }
  });

  gameInitializerButton.addEventListener("click", (e) => {

    if (firstPlayerSign === undefined) return;

    animateButton(e.target);

    setTimeout(() => {
      e.target.parentElement.classList.add("disabled");
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

  return {};
})();
