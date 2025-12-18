const degreeSelect = document.getElementById('degree');  
  const yearSelect = document.getElementById('year');  
  const semesterSelect = document.getElementById('semester');  
  
  // UG & PG year counts  
  const yearOptions = { ug: 3, pg: 2 };  
  
  // Semester mapping  
  const semesterMapping = {  
    ug: {  
      1: [1, 2],  
      2: [3, 4],  
      3: [5, 6]  
    },  
    pg: {  
      1: [1, 2],  
      2: [3, 4]  
    }  
  };  
  
  // Degree change  
  degreeSelect.addEventListener('change', function() {  
    const selectedDegree = this.value;  
    yearSelect.innerHTML = '<option value="">-- Select Year --</option>';  
    semesterSelect.innerHTML = '<option value="">-- Select Semester --</option>';  
    semesterSelect.disabled = true;  
  
    if (selectedDegree) {  
      const totalYears = yearOptions[selectedDegree];  
      for (let i = 1; i <= totalYears; i++) {  
        const option = document.createElement('option');  
        option.value = `${i}`;  
        option.textContent = `${i} Year`;  
        yearSelect.appendChild(option);  
      }  
      yearSelect.disabled = false;  
    } else {  
      yearSelect.disabled = true;  
      semesterSelect.disabled = true;  
    }  
  });  
  
  // Year change  
  yearSelect.addEventListener('change', function() {  
    semesterSelect.innerHTML = '<option value="">-- Select Semester --</option>';  
    const degree = degreeSelect.value;  
    const year = this.value;  
  
    if (degree && year && semesterMapping[degree][year]) {  
      semesterMapping[degree][year].forEach(sem => {  
        const option = document.createElement('option');  
        option.value = sem;  
        option.textContent = `${sem} Semester`;  
        semesterSelect.appendChild(option);  
      });  
      semesterSelect.disabled = false;  
    } else {  
      semesterSelect.disabled = true;  
    }  
  });  
  
  // Submit form  
  function submitForm() {  
    const degree = degreeSelect.value;  
    const year = yearSelect.value;  
    const semester = semesterSelect.value;  
  
    if (!degree || !year || !semester) {  
      alert('Please select degree, year, and semester!');  
      return;  
    }  
  
    alert(`You selected: ${degree.toUpperCase()} - ${year} Year - Semester ${semester}`);  
  
    // If Flask integration needed:  
    // window.location.href = `/materials/${degree}/${year}/${semester}`;  
  }