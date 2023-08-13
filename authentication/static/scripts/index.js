const logoutBtn = document.getElementById("logout_btn");

logoutBtn.onclick = function () {
  const req = new XMLHttpRequest();
  req.open("DELETE", "/user");
  req.onload = function () {
    location.href = "/signin";
  };
  req.send();
};

const taskListElem = document.getElementById("task_list");

taskListElem.onclick = function (eve) {
  const elem = eve.target;

  const parent = elem.parentElement;
  const pid = parent.getAttribute("id");

  function getSiblings(elem) {
    const parent = elem.parentElement;
    const children = parent.children;
    return {
      info: children[0],
      progress: children[1],
      status: children[2],
      button: children[3],
    };
  }

  switch (elem.getAttribute("aria-elem")) {
    case "task_info":
      {
        const { info, progress, status } = getSiblings(elem);
        const req = new XMLHttpRequest();
        req.open("POST", `/task/${pid}`);
        req.setRequestHeader("Content-Type", "application/json");

        if (progress.value < 100) {
          info.style.setProperty("text-decoration", "line-through");
          progress.value = 100;
          status.textContent = "completed";
        } else {
          info.style.setProperty("text-decoration", "initial");
          progress.value = 0;
          status.textContent = "pending";
        }

        const payload = { progress: progress.value };
        req.send(JSON.stringify(payload));
      }
      break;
    case "task_progress":
      {
        const { info, progress, status } = getSiblings(elem);
        const req = new XMLHttpRequest();
        req.open("POST", `/task/${pid}`);
        req.setRequestHeader("Content-Type", "application/json");
        req.onload = function () {
          if (progress.value == 100) {
            info.style.setProperty("text-decoration", "line-through");
            status.textContent = "completed";
          } else {
            info.style.setProperty("text-decoration", "initial");
            status.textContent = "pending";
          }
        };
        const payload = { progress: progress.value };
        req.send(JSON.stringify(payload));
      }
      break;
    case "task_button":
      {
        const req = new XMLHttpRequest();
        req.open("DELETE", `/task/${pid}`);
        req.onload = function () {
          parent.remove();
        };
        req.send();
      }
      break;
  }
};
