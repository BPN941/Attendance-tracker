const BACKEND_URL = "https://attendance-tracker-2yxg.onrender.com";

const form = document.getElementById("subject-form");
const subjectNameInput = document.getElementById("subject-name");
const subjectsList = document.getElementById("subjects-ul");

form.addEventListener("submit", (e) => {
  e.preventDefault();
  const name = subjectNameInput.value;
  fetch(`${BACKEND_URL}/api/subjects`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name }),
  })
    .then((res) => {
      if (!res.ok) throw new Error("Failed to add subject");
      subjectNameInput.value = "";
      fetchSubjects();
      populateSubjectsForAttendance();
    })
    .catch((err) => console.error("Error adding subject:", err));
});

document.addEventListener("DOMContentLoaded", () => {
  fetchSubjects();
  populateSubjectsForAttendance();
});

function fetchSubjects() {
  fetch(`${BACKEND_URL}/api/subjects`)
    .then((res) => {
      if (!res.ok) throw new Error("Failed to fetch subjects");
      return res.json();
    })
    .then((subjects) => {
      console.log("Fetched subjects from API:", subjects); // Debugging log
      subjectsList.innerHTML = "";
      subjects.forEach((sub) => {
        if (!sub._id) {
          console.error("Invalid subject:", sub);
          return; // Skip invalid subjects
        }
        const li = document.createElement("li");
        li.textContent = `${sub.name} - `;
        const span = document.createElement("span");
        span.id = `percentage-${sub._id}`; // Use `_id` from MongoDB
        li.appendChild(span);

        const summaryDiv = document.createElement("div");
        summaryDiv.id = `summary-${sub._id}`; // Use `_id` from MongoDB
        li.appendChild(summaryDiv);

        subjectsList.appendChild(li);

        // Fetch attendance percentage
        fetch(`${BACKEND_URL}/api/attendance-percentage/${sub._id}`) // Use `_id`
          .then((res) => {
            if (!res.ok)
              throw new Error("Failed to fetch attendance percentage");
            return res.json();
          })
          .then((data) => {
            console.log(`Attendance percentage for ${sub.name}:`, data); // Debugging log
            span.textContent = `Attendance: ${data.attendance_percentage}%`;
          })
          .catch((err) =>
            console.error("Error fetching attendance percentage:", err)
          );

        // Fetch attendance summary
        fetch(`${BACKEND_URL}/api/attendance-summary/${sub._id}`) // Use `_id`
          .then((res) => {
            if (!res.ok) throw new Error("Failed to fetch attendance summary");
            return res.json();
          })
          .then((data) => {
            console.log(`Attendance summary for ${sub.name}:`, data); // Debugging log
            summaryDiv.textContent = `Total Days: ${data.total_days}, Present: ${data.present_days}, Absent: ${data.absent_days}`;
          })
          .catch((err) =>
            console.error("Error fetching attendance summary:", err)
          );
      });
    })
    .catch((err) => console.error("Error fetching subjects:", err));
}

const attendanceForm = document.getElementById("attendance-form");
const subjectSelect = document.getElementById("attendance-subject");
const dateInput = document.getElementById("attendance-date");
const statusSelect = document.getElementById("attendance-status");

attendanceForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const subject_id = subjectSelect.value;
  const date = dateInput.value;
  const status = statusSelect.value;

  fetch(`${BACKEND_URL}/api/attendance`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ subject_id, date, status }),
  })
    .then((res) => {
      if (!res.ok) throw new Error("Failed to mark attendance");
      fetchSubjects();
      dateInput.value = "";
    })
    .catch((err) => console.error("Error marking attendance:", err));
});

function populateSubjectsForAttendance() {
  fetch(`${BACKEND_URL}/api/subjects`)
    .then((res) => {
      if (!res.ok) throw new Error("Failed to fetch subjects");
      return res.json();
    })
    .then((subjects) => {
      subjectSelect.innerHTML = '<option value="">Select a subject</option>';
      subjects.forEach((sub) => {
        const option = document.createElement("option");
        option.value = sub._id;
        option.textContent = sub.name;
        subjectSelect.appendChild(option);
      });
    })
    .catch((err) => console.error("Error populating subjects:", err));
}
