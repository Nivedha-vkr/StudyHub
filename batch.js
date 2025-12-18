const batchList = document.getElementById("batchList");

// Initialize SortableJS
new Sortable(batchList, {
  animation: 200,
  ghostClass: "sortable-ghost",
  delay: 300,
  delayOnTouchOnly: true,
});

// ------------------- Add new batch -------------------
function addBatch() {
  let newBatch = prompt("Enter new batch (e.g., 2025 - 2029):");
  if (newBatch && newBatch.trim() !== "") {
    fetch("/batch", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: "batch_name=" + encodeURIComponent(newBatch),
    }).then((res) => location.reload());
  }
}

// ------------------- Delete batch -------------------
document.querySelectorAll(".delete-btn").forEach((btn) => {
  btn.addEventListener("click", () => {
    let id = btn.dataset.id;
    if (confirm("Delete this batch?")) {
      fetch(`/delete_batch/${id}`, { method: "POST" }).then((res) => {
        if (res.ok) location.reload();
        else alert("Failed to delete batch");
      });
    }
  });
});

// ------------------- Edit batch (pencil click) -------------------
document.querySelectorAll(".edit-btn").forEach((btn) => {
  btn.addEventListener("click", () => {
    let id = btn.dataset.id;
    let el = document.querySelector(`.batch-text[data-id="${id}"]`);
    let currentText = el.innerText;

    let input = document.createElement("input");
    input.type = "text";
    input.value = currentText;
    input.className = "edit-input";

    el.replaceWith(input);
    input.focus();

    input.addEventListener("blur", () => saveEdit(input, el, id));
    input.addEventListener("keydown", (e) => {
      if (e.key === "Enter") saveEdit(input, el, id);
    });
  });
});

function saveEdit(input, el, id) {
  let newValue = input.value.trim() || "Unnamed Batch";

  fetch(`/edit_batch/${id}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name: newValue }),
  }).then((res) => {
    if (res.ok) location.reload();
    else alert("Failed to update batch");
  });
}