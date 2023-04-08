"use strict";

const themeToggle = document.querySelector(".theme-toggle");
const toDoListEl = document.querySelector(".todo__list--todo");
const doingListEl = document.querySelector(".todo__list--doing");
const doneListEl = document.querySelector(".todo__list--done");
const newItemFormEl = document.querySelector(".todo__new--form");
const inputEl = document.querySelector(".todo__new--input");
const toDoTexts = document.getElementsByClassName("todo__item-heading");
const clearBtnEl = document.getElementById("clearStorage");

let toDoArray = [];

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
  // console.log(parentNode.children);
  // setTimeout(() => {
  //   [parentNode.children].forEach((child) => {
  //     console.log(child.classList);
  //     // child.classList.remove("delete");
  //   }, 1000);
  // });
};

function placeCaretAtEnd(el) {
  el.focus();
  if (
    typeof window.getSelection != "undefined" &&
    typeof document.createRange != "undefined"
  ) {
    let range = document.createRange();
    range.selectNodeContents(el);
    range.collapse(false);
    let sel = window.getSelection();
    sel.removeAllRanges();
    sel.addRange(range);
  } else if (typeof document.body.createTextRange != "undefined") {
    let textRange = document.body.createTextRange();
    textRange.moveToElementText(el);
    textRange.collapse(false);
    textRange.select();
  }
}

const putFocusOnNode = function (node) {
  node.addEventListener("click", (e) => {
    if (e.target.tagName === "BUTTON") return;
    const inputField =
      e.target.tagName === "DIV" ? e.target : e.target.children[0].children[0];
    inputField.focus();
    placeCaretAtEnd(inputField);
  });
};

const enableChangeTodoTextOnSubmit = function (node, todoObj) {
  node.addEventListener("keypress", (e) => {
    const newValue = document.activeElement.textContent;
    if (e.key === "Enter" && !e.shiftKey) {
      todoObj.text = newValue;
      document.activeElement.blur();
      localStorage.setItem("toDoItemsRef", JSON.stringify(toDoArray));
    }
  });
};

const enableDeleteBtn = function (node, item) {
  node.children[1].children[0].addEventListener("click", (e) => {
    item.deleted = true;
    node.classList.add("delete");
    node.addEventListener("finish", (e) => {
      node.remove(node);
    });
  });
};

const enableDrag = function (node) {
  node.addEventListener("dragstart", (e) => {
    e.dataTransfer.clearData();
    e.dataTransfer.setData("text/plain", e.target.id);
    e.dataTransfer.effectAllowed = "move";

    setTimeout(() => {
      // e.target.classList.add("deletes");
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
    //   setTimeout(() => {
    //     newNode.classList.remove("delete");
    //   }, 200);
    // });
    localStorage.setItem("toDoItemsRef", JSON.stringify(toDoArray));
  });
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
  if (!inputEl.value) return;
  createNewItem(inputEl.value);
  inputEl.value = "";
  inputEl.focus();
});

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

clearBtnEl.addEventListener("click", () => {
  localStorage.removeItem("toDoItemsRef");
  toDoArray.forEach((item) =>
    document.getElementById(item.id).classList.add("delete")
  );
  setTimeout(() => {
    toDoArray = [];
    renderLists();
  }, 250);
});
