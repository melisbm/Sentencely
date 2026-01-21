document.addEventListener("DOMContentLoaded", () => {
  window.electronAPI.handleTextUpdate((event, data) => {
    document.getElementById("front").innerHTML = "Front: " + data;
  });
});

document.addEventListener("mouseup", () => {
  const selectedText = window.getSelection().toString();
  document.getElementById("back").innerHTML = "Back: " + selectedText;
  window.getSelection().removeAllRanges();
});
