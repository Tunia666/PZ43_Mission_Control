"use strict";

const launchButton = document.querySelector("#launch-button");
const resetButton = document.querySelector("#reset-button");
const failCheckbox = document.querySelector("#fail-checkbox");
const secondsText = document.querySelector("#seconds");
const status = document.querySelector("#status");
const result = document.querySelector("#result");
const stages = ["countdown", "systems", "permission"];
let seconds = 5;
let intervalId = null;

function setStage(name, state) {
  document.querySelector(`#stage-${name}`).className = `step-card is-${state}`;
}

function resetStages() {
  stages.forEach(
    (name) =>
      (document.querySelector(`#stage-${name}`).className = "step-card"),
  );
}

function startCountdown(onDone) {
  intervalId = setInterval(() => {
    seconds -= 1;
    secondsText.textContent = seconds;

    if (seconds <= 0) {
      clearInterval(intervalId);
      intervalId = null;
      if (typeof onDone === "function") {
        onDone();
      }
    }
  }, 650);
}

function checkSystems(onDone) {
  setTimeout(() => {
    if (typeof onDone === "function") {
      onDone();
    }
  }, 800);
}

function requestPermission(shouldFail) {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (shouldFail) {
        reject(new Error("Разрешение на запуск не получено."));
      } else {
        resolve("Разрешение получено.");
      }
    }, 900);
  });
}

async function launchMission() {
  if (launchButton.disabled) return;
  launchButton.disabled = true;
  resetButton.disabled = true;
  resetStages();
  seconds = 5;
  secondsText.textContent = seconds;
  result.textContent = "Подготовка...";
  status.className = "status status--working";

  try {
    setStage("countdown", "active");
    status.textContent = "Идёт отсчёт...";
    await new Promise((resolve) => startCountdown(resolve));

    setStage("countdown", "done");
    setStage("systems", "active");
    status.textContent = "Проверка систем...";
    await new Promise((resolve) => checkSystems(resolve));

    setStage("systems", "done");
    setStage("permission", "active");
    status.textContent = "Запрос разрешения...";
    const answer = await requestPermission(failCheckbox.checked);

    setStage("permission", "done");
    result.textContent = "Миссия запущена!";
    status.className = "status status--success";
    status.textContent = answer;
  } catch (error) {
    setStage("permission", "error");
    result.textContent = "Запуск отменён";
    status.className = "status status--error";
    status.textContent = error.message;
  } finally {
    launchButton.disabled = false;
    resetButton.disabled = false;
  }
}

launchButton.addEventListener("click", launchMission);

resetButton.addEventListener("click", () => {
  if (launchButton.disabled) return;
  clearInterval(intervalId);
  intervalId = null;
  seconds = 5;
  secondsText.textContent = seconds;
  resetStages();
  status.className = "status";
  status.textContent = "Миссия готова.";
  result.textContent = "Ожидание запуска";
});
