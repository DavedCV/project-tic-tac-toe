function deactivateHumanButton(button){
    button.classList.remove("selected");
    const input = button.nextElementSibling;
    input.classList.remove("active");
    input.value = "";
}

function deactivateComputerButton(button){
    button.classList.remove("selected");
    const input = button.previousElementSibling;
    input.value = "";
}


const selectHumanPlayer = document.querySelectorAll(
  ".selectionForm button:nth-child(2)"
);
const selectComputerPlayer = document.querySelectorAll(
  ".selectionForm button:nth-child(4)"
);

selectHumanPlayer.forEach((buttonHuman) =>
  buttonHuman.addEventListener("click", (event) => {
    const indexButton = Array.from(selectHumanPlayer).indexOf(event.target);
    deactivateComputerButton(selectComputerPlayer[indexButton]);

    event.target.classList.add("selected");
    const input = event.target.nextElementSibling;
    input.classList.add("active");
  })
);

selectComputerPlayer.forEach((buttonComputer) =>
  buttonComputer.addEventListener("click", (event) => {
    const indexButton = Array.from(selectComputerPlayer).indexOf(event.target);
    deactivateHumanButton(selectHumanPlayer[indexButton]);

    event.target.classList.add("selected");
    const input = event.target.previousElementSibling;
    input.value = "computer";
  })
);
