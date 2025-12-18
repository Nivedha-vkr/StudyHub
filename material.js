function openModal() {
      document.getElementById("noteModal").style.display = "flex";
    }
    function closeModal() {
      document.getElementById("noteModal").style.display = "none";
    }
    function editMaterial(id, oldName) {
      let newName = prompt("Edit Material Name:", oldName);
      if (newName && newName.trim() !== "") {
        fetch(`/edit_material/${id}`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ title: newName })
        }).then(res => {
          if (res.ok) location.reload();
          else alert("Update failed");
        });
      }
    }