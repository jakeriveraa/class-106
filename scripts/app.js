import API from "./api.js";

let isVisible = true; // Tracks form visibility

// ========== FORM VALIDATION ==========
function validateForm() {
  const title = $("#txtTitle").val().trim();
  const desc = $("#txtDescription").val().trim();
  const date = $("#selStartDate").val();
  const budget = $("#numBudget").val();

  clearErrorMessages();
  let isValid = true;
  const errors = [];

  if (!title) {
    showError("txtTitle", "Title is required");
    errors.push("Title is required");
    isValid = false;
  } else if (title.length < 3) {
    showError("txtTitle", "Title must be at least 3 characters long");
    errors.push("Title must be at least 3 characters long");
    isValid = false;
  } else if (title.length > 50) {
    showError("txtTitle", "Title cannot exceed 50 characters");
    errors.push("Title cannot exceed 50 characters");
    isValid = false;
  }

  if (!desc) {
    showError("txtDescription", "Description is required");
    errors.push("Description is required");
    isValid = false;
  } else if (desc.length < 10) {
    showError(
      "txtDescription",
      "Description must be at least 10 characters long"
    );
    errors.push("Description must be at least 10 characters long");
    isValid = false;
  } else if (desc.length > 200) {
    showError("txtDescription", "Description cannot exceed 200 characters");
    errors.push("Description cannot exceed 200 characters");
    isValid = false;
  }

  if (!date) {
    showError("selStartDate", "Start date is required");
    errors.push("Start date is required");
    isValid = false;
  } else {
    const selectedDate = new Date(date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (selectedDate < today) {
      showError("selStartDate", "Start date cannot be in the past");
      errors.push("Start date cannot be in the past");
      isValid = false;
    }
  }

  if (!budget) {
    showError("numBudget", "Budget is required");
    errors.push("Budget is required");
    isValid = false;
  } else if (parseFloat(budget) <= 0) {
    showError("numBudget", "Budget must be greater than 0");
    errors.push("Budget must be greater than 0");
    isValid = false;
  } else if (parseFloat(budget) > 1000000) {
    showError("numBudget", "Budget cannot exceed $1,000,000");
    errors.push("Budget cannot exceed $1,000,000");
    isValid = false;
  }

  return { isValid, errors };
}

function showError(fieldId, message) {
  const field = $(`#${fieldId}`);
  field.addClass("is-invalid");
  field.next(".error-message").remove();
  field.after(
    `<div class="error-message text-danger small mt-1">${message}</div>`
  );
}

function clearErrorMessages() {
  $(".form-control").removeClass("is-invalid");
  $(".error-message").remove();
}

// ========== TOGGLE FORM ==========
function toggleVisibility() {
  if (isVisible) {
    $("#form").fadeOut(300);
    $("#btnDetails").html('<i class="fas fa-eye"></i> SHOW FORM');
    isVisible = false;
  } else {
    $("#form").fadeIn(300);
    $("#btnDetails").html('<i class="fas fa-eye-slash"></i> HIDE FORM');
    isVisible = true;
  }
}

// ========== SAVE TASK ==========
async function saveTask() {
  const validation = validateForm();
  if (!validation.isValid) {
    showValidationSummary(validation.errors);
    return;
  }

  const title = $("#txtTitle").val().trim();
  const desc = $("#txtDescription").val().trim();
  const color = $("#selColor").val();
  const date = $("#selStartDate").val();
  const status = $("#selStatus").val();
  const budget = parseFloat($("#numBudget").val());
  const isImportant = "Yes";

  let taskToSave = new Task(
    isImportant,
    title,
    desc,
    color,
    date,
    status,
    budget
  );

  displayTask(taskToSave);
  await saveTaskToAPI(taskToSave);
  showSuccessMessage("Task created successfully!");
  clearForm();
}

async function saveTaskToAPI(task) {
  try {
    await API.createTask(task);
    console.log("Task saved to API and localStorage.");
  } catch (error) {
    console.warn("Failed to save task to API:", error.message);
    showWarningMessage("Task saved locally but failed to sync with server.");
  }
}

// ========== DISPLAY TASKS ==========
function displayTask(task) {
  const formattedDate = task.startDate
    ? new Date(task.startDate).toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    : "No date set";

  const formattedBudget = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(task.budget);

  let syntax = `
    <div class="task" style="border-left: 6px solid ${task.color}">
      <div class="info">
        <h5>${task.title}</h5>
        <p>${task.description}</p>
      </div>
      <label class="status status-${task.status
        .toLowerCase()
        .replace(" ", "-")}">${task.status}</label>
      <div class="date-budget">
        <label class="task-date"><i class="fas fa-calendar"></i> ${formattedDate}</label>
        <label class="task-budget"><i class="fas fa-dollar-sign"></i> ${formattedBudget}</label>
      </div>
      <div class="task-actions mt-2">
        <button class="btn btn-sm btn-outline-danger delete-task" onclick="deleteTask(this)">
          <i class="fas fa-trash"></i> Delete
        </button>
      </div>
    </div>
  `;

  $(".pending-tasks").prepend(syntax);
  $(".pending-tasks .task:first-child").hide().slideDown(300);
  updateTaskStats();
}

// ========== DELETE SINGLE TASK ==========
function deleteTask(button) {
  const taskElement = $(button).closest(".task");
  taskElement.slideUp(300, function () {
    $(this).remove();
    removeTaskFromLocalStorage(taskElement.find("h5").text());
    updateTaskStats();
    showSuccessMessage("Task deleted successfully!");
  });
}

function removeTaskFromLocalStorage(title) {
  let tasks = JSON.parse(localStorage.getItem(API.localKey)) || [];
  tasks = tasks.filter((task) => task.title !== title);
  localStorage.setItem(API.localKey, JSON.stringify(tasks));
}

// ========== DELETE ALL TASKS ==========
async function deleteAllTasks() {
  if (!confirm("Are you sure you want to delete ALL your tasks?")) return;

  const success = await API.deleteAllTasks();
  if (success) {
    $(".pending-tasks").empty();
    $("#emptyState").show();
    updateTaskStats();
    showSuccessMessage("All tasks deleted successfully!");
  } else {
    showWarningMessage("Failed to delete tasks.");
  }
}

// ========== MESSAGES ==========
function showValidationSummary(errors) {
  $(".validation-summary").remove();
  let summaryHtml =
    '<div class="validation-summary alert alert-danger alert-dismissible fade show mt-3" role="alert">';
  summaryHtml +=
    '<strong>Please fix the following errors:</strong><ul class="mb-0 mt-2">';
  errors.forEach((error) => (summaryHtml += `<li>${error}</li>`));
  summaryHtml += "</ul>";
  summaryHtml +=
    '<button type="button" class="btn-close" data-bs-dismiss="alert"></button>';
  summaryHtml += "</div>";
  $("#form").prepend(summaryHtml);
  setTimeout(() => $(".validation-summary").fadeOut(), 5000);
}

function showSuccessMessage(message) {
  $(".alert").remove();
  const alertHtml = `
    <div class="alert alert-success alert-dismissible fade show mt-3" role="alert">
      <strong>Success!</strong> ${message}
      <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    </div>
  `;
  $("#form").prepend(alertHtml);
  setTimeout(() => $(".alert-success").fadeOut(), 3000);
}

function showWarningMessage(message) {
  const alertHtml = `
    <div class="alert alert-warning alert-dismissible fade show mt-3" role="alert">
      <strong>Warning!</strong> ${message}
      <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    </div>
  `;
  $("#form .task-subheader").after(alertHtml);
  setTimeout(() => $(".alert-warning").fadeOut(), 4000);
}

// ========== CLEAR FORM ==========
function clearForm() {
  $("#txtTitle").val("");
  $("#txtDescription").val("");
  $("#selColor").val("#667eea");
  $("#selStartDate").val("");
  $("#selStatus").val("New");
  $("#numBudget").val("");
  clearErrorMessages();

  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  $("#selStartDate").val(tomorrow.toISOString().slice(0, 16));
}

// ========== TASK STATS ==========
function updateTaskStats() {
  const tasks = $(".task");
  const totalTasks = tasks.length;

  let newTasks = 0;
  let inProgressTasks = 0;
  let completedTasks = 0;

  tasks.each(function () {
    const status = $(this).find(".status").text().trim().toLowerCase();
    if (status.includes("new")) newTasks++;
    else if (status.includes("progress")) inProgressTasks++;
    else if (status.includes("complete")) completedTasks++;
  });

  $("#totalTasks").text(totalTasks);
  $("#newTasks").text(newTasks);
  $("#inProgressTasks").text(inProgressTasks);
  $("#completedTasks").text(completedTasks);

  if (totalTasks === 0) $("#emptyState").show();
  else $("#emptyState").hide();
}

// ========== INIT ==========
async function init() {
  console.log("Initializing Task Manager...");

  try {
    const tasks = await API.getTasks();
    tasks.forEach(displayTask);
    console.log("Loaded tasks:", tasks.length);
  } catch (err) {
    console.warn("Failed to load tasks:", err.message);
    showWarningMessage("Failed to load tasks from server.");
  }

  $("#btnAdd").click(saveTask);
  $("#btnDetails").click(toggleVisibility);
  $("#btnDeleteAll").click(deleteAllTasks);

  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  $("#selStartDate").val(tomorrow.toISOString().slice(0, 16));

  updateTaskStats();
}

window.deleteTask = deleteTask;
window.clearForm = clearForm;

window.onload = init;
