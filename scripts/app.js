import API from "./api.js";

let isVisible = true; // global variable to track visibility

// Form validation functions
function validateForm() {
  const title = $("#txtTitle").val().trim();
  const desc = $("#txtDescription").val().trim();
  const date = $("#selStartDate").val();
  const budget = $("#numBudget").val();

  // Clear previous error messages
  clearErrorMessages();

  let isValid = true;
  const errors = [];

  // Title validation
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

  // Description validation
  if (!desc) {
    showError("txtDescription", "Description is required");
    errors.push("Description is required");
    isValid = false;
  } else if (desc.length < 10) {
    showError("txtDescription", "Description must be at least 10 characters long");
    errors.push("Description must be at least 10 characters long");
    isValid = false;
  } else if (desc.length > 200) {
    showError("txtDescription", "Description cannot exceed 200 characters");
    errors.push("Description cannot exceed 200 characters");
    isValid = false;
  }

  // Date validation
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

  // Budget validation
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
  
  // Remove existing error message
  field.next(".error-message").remove();
  
  // Add new error message
  field.after(`<div class="error-message text-danger small mt-1">${message}</div>`);
}

function clearErrorMessages() {
  $(".form-control").removeClass("is-invalid");
  $(".error-message").remove();
}

function toggleVisibility() {
  if (isVisible) {
    $("#form").fadeOut(300); // hide the form section with animation
    $("#btnDetails").html('<i class="fas fa-eye"></i> SHOW FORM');
    isVisible = false;
  } else {
    $("#form").fadeIn(300); // show the form section with animation
    $("#btnDetails").html('<i class="fas fa-eye-slash"></i> HIDE FORM');
    isVisible = true;
  }
}

function saveTask() {
  // Validate form first
  const validation = validateForm();
  
  if (!validation.isValid) {
    // Show validation summary
    showValidationSummary(validation.errors);
    return;
  }

  // Get the value of the inputs
  const title = $("#txtTitle").val().trim();
  const desc = $("#txtDescription").val().trim();
  const color = $("#selColor").val();
  const date = $("#selStartDate").val();
  const status = $("#selStatus").val();
  const budget = parseFloat($("#numBudget").val());
  const isImportant = "Yes";

  // Create a new task object
  let taskToSave = new Task(
    isImportant,
    title,
    desc,
    color,
    date,
    status,
    budget
  );

  // Add the task to the list
  displayTask(taskToSave);

  // Try to save to API
  saveTaskToAPI(taskToSave);

  // Show success message
  showSuccessMessage("Task created successfully!");

  // Clear the form after adding
  clearForm();

  // Log for testing
  console.log("Task saved:", { title, desc, color, date, status, budget });
}

async function saveTaskToAPI(task) {
  try {
    const result = await API.createTask(task);
    console.log("Task saved to API:", result);
  } catch (error) {
    console.warn("Failed to save task to API:", error.message);
    showWarningMessage("Task saved locally, but failed to sync with server.");
  }
}

function showValidationSummary(errors) {
  // Remove existing summary
  $(".validation-summary").remove();
  
  let summaryHtml = '<div class="validation-summary alert alert-danger alert-dismissible fade show mt-3" role="alert">';
  summaryHtml += '<strong>Please fix the following errors:</strong><ul class="mb-0 mt-2">';
  errors.forEach(error => {
    summaryHtml += `<li>${error}</li>`;
  });
  summaryHtml += '</ul>';
  summaryHtml += '<button type="button" class="btn-close" data-bs-dismiss="alert"></button>';
  summaryHtml += '</div>';
  
  $("#form").prepend(summaryHtml);
  
  // Auto-hide after 5 seconds
  setTimeout(() => {
    $(".validation-summary").fadeOut();
  }, 5000);
}

function showSuccessMessage(message) {
  $(".alert").remove(); // Remove existing alerts
  
  const alertHtml = `
    <div class="alert alert-success alert-dismissible fade show mt-3" role="alert">
      <strong>Success!</strong> ${message}
      <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    </div>
  `;
  
  $("#form").prepend(alertHtml);
  
  // Auto-hide after 3 seconds
  setTimeout(() => {
    $(".alert-success").fadeOut();
  }, 3000);
}

function showWarningMessage(message) {
  const alertHtml = `
    <div class="alert alert-warning alert-dismissible fade show mt-3" role="alert">
      <strong>Warning!</strong> ${message}
      <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    </div>
  `;
  
  $("#form .task-subheader").after(alertHtml);
  
  // Auto-hide after 4 seconds
  setTimeout(() => {
    $(".alert-warning").fadeOut();
  }, 4000);
}

function clearForm() {
  $("#txtTitle").val("");
  $("#txtDescription").val("");
  $("#selColor").val("#000000");
  $("#selStartDate").val("");
  $("#selStatus").val("New");
  $("#numBudget").val("");
  clearErrorMessages();
}

function displayTask(task) {
  // Format the date for better display
  const formattedDate = task.startDate ? 
    new Date(task.startDate).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }) : 'No date set';

  // Format budget as currency
  const formattedBudget = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD'
  }).format(task.budget);

  let syntax = `
    <div class="task" style="border-left: 6px solid ${task.color}">
      <div class="info">
        <h5>${task.title}</h5>
        <p>${task.description}</p>
      </div>
      <label class="status status-${task.status.toLowerCase().replace(' ', '-')}">${task.status}</label>
      <div class="date-budget">
        <label class="task-date"><i class="fas fa-calendar"></i> ${formattedDate}</label>
        <label class="task-budget"><i class="fas fa-dollar-sign"></i> ${formattedBudget}</label>
      </div>
      <div class="task-actions mt-2">
        <button class="btn btn-sm btn-outline-primary edit-task" onclick="editTask(this)">
          <i class="fas fa-edit"></i> Edit
        </button>
        <button class="btn btn-sm btn-outline-danger delete-task" onclick="deleteTask(this)">
          <i class="fas fa-trash"></i> Delete
        </button>
      </div>
    </div>
  `;

  $(".pending-tasks").prepend(syntax); // Use prepend to show newest tasks first

  // Add animation to new task
  $(".pending-tasks .task:first-child").hide().slideDown(300);
  
  // Update statistics
  updateTaskStats();
}

// Edit task functionality
function editTask(button) {
  const taskElement = $(button).closest('.task');
  const title = taskElement.find('h5').text();
  const description = taskElement.find('p').text();
  const color = taskElement.css('border-left-color');
  
  // Populate form with task data
  $("#txtTitle").val(title);
  $("#txtDescription").val(description);
  // Convert RGB color to hex if needed
  $("#selColor").val(rgbToHex(color));
  
  // Show form if hidden
  if (!isVisible) {
    toggleVisibility();
  }
  
  // Remove the task from display (it will be re-added when saved)
  taskElement.slideUp(300, function() {
    $(this).remove();
  });
  
  showSuccessMessage("Task loaded for editing. Make your changes and click 'ADD TASK' to save.");
}

// Delete task functionality
function deleteTask(button) {
  if (confirm("Are you sure you want to delete this task?")) {
    const taskElement = $(button).closest('.task');
    taskElement.slideUp(300, function() {
      $(this).remove();
      updateTaskStats(); // Update stats after deletion
      showSuccessMessage("Task deleted successfully!");
    });
  }
}

// Utility function to convert RGB to Hex
function rgbToHex(rgb) {
  if (rgb.startsWith('#')) return rgb;
  
  const result = rgb.match(/\d+/g);
  if (result && result.length >= 3) {
    return "#" + ((1 << 24) + (parseInt(result[0]) << 16) + (parseInt(result[1]) << 8) + parseInt(result[2])).toString(16).slice(1);
  }
  return "#000000";
}

// Real-time validation
function setupRealtimeValidation() {
  $("#txtTitle").on('input', function() {
    const value = $(this).val().trim();
    if (value.length >= 3 && value.length <= 50) {
      $(this).removeClass('is-invalid').addClass('is-valid');
      $(this).next('.error-message').remove();
    }
  });

  $("#txtDescription").on('input', function() {
    const value = $(this).val().trim();
    if (value.length >= 10 && value.length <= 200) {
      $(this).removeClass('is-invalid').addClass('is-valid');
      $(this).next('.error-message').remove();
    }
  });

  $("#selStartDate").on('change', function() {
    const value = $(this).val();
    if (value && new Date(value) >= new Date().setHours(0,0,0,0)) {
      $(this).removeClass('is-invalid').addClass('is-valid');
      $(this).next('.error-message').remove();
    }
  });

  $("#numBudget").on('input', function() {
    const value = parseFloat($(this).val());
    if (value > 0 && value <= 1000000) {
      $(this).removeClass('is-invalid').addClass('is-valid');
      $(this).next('.error-message').remove();
    }
  });
}

async function init() {
  console.log("Initializing Task Manager...");
  
  try {
    // Load tasks from API
    const tasks = await API.getTask();
    tasks.forEach(displayTask);
    console.log("Tasks loaded from API:", tasks.length);
    showSuccessMessage(`Loaded ${tasks.length} tasks from server!`);
  } catch (err) {
    console.warn("Failed to load tasks from API:", err.message);
    showWarningMessage("Failed to load tasks from server. You can still create tasks locally.");
  }
  
  // Set up event handlers
  $("#btnAdd").click(saveTask);
  $("#btnDetails").click(toggleVisibility);
  
  // Setup real-time validation
  setupRealtimeValidation();
  
  // Set default date to tomorrow and color
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  $("#selStartDate").val(tomorrow.toISOString().slice(0, 16));
  $("#selColor").val("#667eea");
  
  // Initialize stats
  updateTaskStats();
  
  console.log("Task Manager initialized successfully!");
}

// Task statistics functionality
function updateTaskStats() {
  const tasks = $(".task");
  const totalTasks = tasks.length;
  
  let newTasks = 0;
  let inProgressTasks = 0;
  let completedTasks = 0;
  
  tasks.each(function() {
    const status = $(this).find('.status').text().trim().toLowerCase();
    if (status.includes('new')) newTasks++;
    else if (status.includes('progress')) inProgressTasks++;
    else if (status.includes('complete')) completedTasks++;
  });
  
  // Update stats display
  $("#totalTasks").text(totalTasks);
  $("#newTasks").text(newTasks);
  $("#inProgressTasks").text(inProgressTasks);
  $("#completedTasks").text(completedTasks);
  
  // Update task counter
  $("#taskCount").text(totalTasks);
  
  // Show/hide empty state
  if (totalTasks === 0) {
    $("#emptyState").show();
  } else {
    $("#emptyState").hide();
  }
}

// Enhanced clear form function
function clearForm() {
  $("#txtTitle").val("");
  $("#txtDescription").val("");
  $("#selColor").val("#667eea");
  $("#selStartDate").val("");
  $("#selStatus").val("New");
  $("#numBudget").val("");
  clearErrorMessages();
  
  // Set tomorrow as default date
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  $("#selStartDate").val(tomorrow.toISOString().slice(0, 16));
}

// Make functions globally available for onclick handlers
window.editTask = editTask;
window.deleteTask = deleteTask;
window.clearForm = clearForm;

// Test function for debugging
function testRequest() {
  $.ajax({
    type: "GET",
    url: "https://jsonplaceholder.typicode.com/posts/1",
    dataType: "json",
    success: function (response) {
      console.log("Request Successful");
      console.log(response);
    },
    error: function (error) {
      console.log("Request failed");
      console.error(error); // Fixed typo: console.logerror -> console.error
    },
  });
}

window.onload = init; // Initialize when page loads