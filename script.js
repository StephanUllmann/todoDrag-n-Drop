"use strict";

const themeToggle = document.querySelector(".theme-toggle");
const toDoListEl = document.querySelector(".todo__list--todo");
const doingListEl = document.querySelector(".todo__list--doing");
const doneListEl = document.querySelector(".todo__list--done");
const newItemFormEl = document.querySelector(".todo__new--form");
const inputEl = document.querySelector(".todo__new--input");
const toDoTexts = document.getElementsByClassName("todo__item-heading");

let toDoArray = [];

// const themes = [".dark-theme", ".light-theme"];

const toggleThemes = function () {
  const currTheme = document.body.classList[0];
  const nextTheme = currTheme === "dark-theme" ? "light-theme" : "dark-theme";
  document.body.classList.remove(currTheme);
  document.body.classList.add(nextTheme);
  themeToggle.textContent = currTheme.split("-")[0];
};

themeToggle.addEventListener("click", () => {
  toggleThemes();
});

const renderItem = function (item) {
  if (item.deleted === true) return;

  const parentNode = document.querySelector(`.todo__list--${item.state}`);
  const html = `
    <li class="todo__item" draggable="true" id="${item.id}" data-state="${item.state}">
            <form class="todo__item-heading" spellcheck="false">
              <div
              contenteditable
                class="todo__item-text"
                
              >${item.text}</div>
            </form>
            <div class="todo__menu">
              <button class="todo__menu-btn" id="delete">delete</button>
            </div>
          </li>
    `;
  parentNode.insertAdjacentHTML("beforeend", html);
};

const putFocusOnNode = function (node) {
  node.addEventListener("click", (e) => {
    if (e.target.tagName === "BUTTON") return;
    const inputField =
      e.target.tagName === "DIV" ? e.target : e.target.children[0].children[0];
    // console.log(inputField);
    inputField.focus();
    // console.log(document.activeElement.classList.contains("todo__item-text"));
    // const tempText = inputField.textContent;
    // inputField.textContent = "";
    // inputField.textContent = tempText + " ";
  });
};

const enableChangeTodoTextOnSubmit = function (node, todoObj) {
  node.addEventListener("keypress", (e) => {
    const newValue = document.activeElement.textContent;
    if (e.key === "Enter" && !e.shiftKey) {
      todoObj.text = newValue;
      document.activeElement.blur();
    }
  });
};

const enableDeleteBtn = function (node, item) {
  node.children[1].children[0].addEventListener("click", (e) => {
    item.deleted = true;
    node.remove(node);
  });
};

const enableDrag = function (node) {
  node.addEventListener("dragstart", (e) => {
    e.dataTransfer.clearData();
    e.dataTransfer.setData("text/plain", e.target.id);
    e.dataTransfer.effectAllowed = "move";
    setTimeout(() => {
      e.target.classList.add("hide");
    }, 0);
  });
};

const renderLists = function () {
  [...document.getElementsByClassName("todo__list")].forEach(
    (list) => (list.innerHTML = "")
  );

  toDoArray.forEach((item) => {
    if (item.deleted === true) return;
    renderItem(item);
    const newNode = document.getElementById(`${item.id}`);
    putFocusOnNode(newNode);
    enableChangeTodoTextOnSubmit(newNode, item);
    enableDeleteBtn(newNode, item);
    enableDrag(newNode);
  });
  // console.log(toDoTexts);
  localStorage.setItem("toDoItemsRef", JSON.stringify(toDoArray));
};

const createNewItem = function (text) {
  const todo = {
    text,
    id: Date.now(),
    state: "todo",
    deleted: false,
  };
  toDoArray.push(todo);
  renderLists();
};

newItemFormEl.addEventListener("submit", (e) => {
  e.preventDefault();
  // console.log(inputEl.value);
  if (!inputEl.value) return;
  createNewItem(inputEl.value);
  inputEl.value = "";
  inputEl.focus();
});

// [...toDoTexts].forEach((text) =>
//   text.addEventListener("submit", (e) => {
//     e.preventDefault();
//     console.log(e.target);
//   })
// );

document.addEventListener("DOMContentLoaded", () => {
  const savedList = localStorage.getItem("toDoItemsRef");
  if (savedList) {
    toDoArray = JSON.parse(savedList);
    renderLists();
  }
});

const dragenter = (event) => {
  event.preventDefault();
  event.target.classList.add("drag-active");
};

const dragleave = (event) => {
  event.preventDefault();
  event.target.classList.remove("drag-active");
};

const dragover = (event) => {
  event.preventDefault();
  event.dataTransfer.effectAllowed = "move";
};

const drop = (event) => {
  event.preventDefault();
  // console.log(event);
  event.target.classList.remove("drag-active");
  event.dataTransfer.effectAllowed = "move";

  const todoID = event.dataTransfer.getData("text");
  const transferredElement = toDoArray.find((item) => item.id === +todoID);
  const newState = event.target.id;
  transferredElement.state = newState;
  renderLists();
};

[...document.querySelectorAll(".list__wrapper")].forEach((list) => {
  list.addEventListener("dragenter", (e) => dragenter(e));
  list.addEventListener("dragleave", (e) => dragleave(e));
  list.addEventListener("dragover", (e) => dragover(e));
  list.addEventListener("drop", (e) => drop(e));
});
