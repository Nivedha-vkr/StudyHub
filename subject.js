// Attach click event for all edit buttons
document.querySelectorAll(".edit-btn").forEach((btn) => {
  btn.addEventListener("click", function () {
    let id = this.dataset.id;
    let oldName = this.dataset.name;

    let newName = prompt("Enter new name for subject:", oldName);
    if (newName && newName.trim() !== "") {
      fetch(`/edit_subject/${id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newName }),
      }).then((res) => {
        if (res.ok) {
          location.reload();
        } else {
          alert("Failed to update subject!");
        }
      });
    }
  });
});