// app.js - FINAL WORKING VERSION
const API_URL = "http://localhost:5000/api";

// DOM Elements
const form = document.getElementById("myForm");
const imgInput = document.querySelector(".img");
const fileInput = document.getElementById("imgInput");
const userName = document.getElementById("name");
const age = document.getElementById("age");
const city = document.getElementById("city");
const email = document.getElementById("email");
const phone = document.getElementById("phone");
const post = document.getElementById("post");
const sDate = document.getElementById("sDate");
const submitBtn = document.querySelector(".submit");
const userInfo = document.getElementById("data");
const modal = document.getElementById("userForm");
const modalTitle = document.querySelector("#userForm .modal-title");
const newUserBtn = document.querySelector(".newUser");

let isEdit = false;
let editId = null;

// ==================== INITIALIZATION ====================

// Load users when page loads
document.addEventListener("DOMContentLoaded", () => {
  console.log("✅ Page loaded, fetching users...");
  fetchUsers();

  // Setup submit button click (since it's now type="button")
  submitBtn.addEventListener("click", handleFormSubmit);
});

// New User button
newUserBtn.addEventListener("click", () => {
  resetForm();
  submitBtn.innerText = "Submit";
  modalTitle.innerText = "Fill the Form";
  isEdit = false;
  editId = null;
});

// ==================== CORE FUNCTIONS ====================

// Fetch all users from API
async function fetchUsers() {
  try {
    console.log("📡 Fetching from:", `${API_URL}/users`);
    const response = await fetch(`${API_URL}/users`);

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const users = await response.json();
    console.log("✅ Users received:", users.length, "users");
    renderUsers(users);
  } catch (error) {
    console.error("❌ Error fetching users:", error);
    userInfo.innerHTML = `
            <tr>
                <td colspan="10" class="text-center text-danger">
                    Failed to load users. Make sure backend is running at ${API_URL}
                </td>
            </tr>
        `;
  }
}

// Render users to table
function renderUsers(users) {
  userInfo.innerHTML = "";

  if (users.length === 0) {
    userInfo.innerHTML = `
      <tr>
        <td colspan="10" class="text-center text-muted">
          No users found. Add your first user!
        </td>
      </tr>
    `;
    return;
  }

  users.forEach((user, index) => {
    const row = `
        <tr class="employeeDetails">
            <td>${index + 1}</td>
            <td><img src="${
              user.picture || "./image/Profile Icon.webp"
            }" alt="Profile" width="50" height="50" style="border-radius: 5px; object-fit: cover;"></td>
            <td>${user.employeeName || "N/A"}</td>
            <td>${user.employeeAge || "N/A"}</td>
            <td>${user.employeeCity || "N/A"}</td>
            <td>${user.employeeEmail || "N/A"}</td>
            <td>${user.employeePhone || "N/A"}</td>
            <td>${user.employeePost || "N/A"}</td>
            <td>${user.startDate || "N/A"}</td>
            <td>
                <button class="btn btn-success btn-sm" onclick="viewUser(${
                  user.id
                })" data-bs-toggle="modal" data-bs-target="#readData">
                    <i class="bi bi-eye"></i>
                </button>
                <button class="btn btn-primary btn-sm" onclick="editUser(${
                  user.id
                })" data-bs-toggle="modal" data-bs-target="#userForm">
                    <i class="bi bi-pencil-square"></i>
                </button>
                <button class="btn btn-danger btn-sm" onclick="deleteUser(${
                  user.id
                })">
                    <i class="bi bi-trash"></i>
                </button>
            </td>
        </tr>`;
    userInfo.innerHTML += row;
  });
}

// ==================== FORM HANDLING ====================

// Handle form submission (button click)
async function handleFormSubmit(e) {
  e.preventDefault();

  // Prepare user data
  const userData = {
    picture: imgInput.src.includes("http")
      ? imgInput.src
      : "https://via.placeholder.com/200",
    employeeName: userName.value.trim(),
    employeeAge: age.value.trim(),
    employeeCity: city.value.trim(),
    employeeEmail: email.value.trim(),
    employeePhone: phone.value.trim(),
    employeePost: post.value.trim(),
    startDate: sDate.value,
  };

  console.log("📤 Sending user data:", userData);

  try {
    let url = `${API_URL}/users`;
    let method = "POST";

    if (isEdit && editId) {
      url = `${API_URL}/users/${editId}`;
      method = "PUT";
      console.log(`🔄 Updating user ID: ${editId}`);
    }

    const response = await fetch(url, {
      method: method,
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(userData),
    });

    console.log("📥 Response status:", response.status);

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Server returned ${response.status}: ${errorText}`);
    }

    const result = await response.json();
    console.log("✅ Success! Response:", result);

    // Show success message
    alert(
      isEdit
        ? `User ${result.employeeName} updated successfully!`
        : `User ${result.employeeName} created successfully!`
    );

    // Refresh user list
    await fetchUsers();

    // Reset form and close modal
    resetForm();
    const modalInstance = bootstrap.Modal.getInstance(modal);
    if (modalInstance) modalInstance.hide();
  } catch (error) {
    console.error("❌ Error saving user:", error);
    alert(`Failed to save user: ${error.message}`);
  }
}

/// Reset form - FIXED VERSION
function resetForm() {
  // MANUALLY reset each field instead of using form.reset()
  userName.value = "";
  age.value = "";
  city.value = "";
  email.value = "";
  phone.value = "";
  post.value = "";
  sDate.value = "";

  imgInput.src = "./image/Profile Icon.webp";
  fileInput.value = "";
  isEdit = false;
  editId = null;
  submitBtn.textContent = "Submit";
  modalTitle.textContent = "Fill the Form";
}

// ==================== CRUD OPERATIONS ====================

// Delete user
window.deleteUser = async function (id) {
  if (!confirm("Are you sure you want to delete this user?")) return;

  try {
    console.log(`🗑️ Deleting user ID: ${id}`);
    const response = await fetch(`${API_URL}/users/${id}`, {
      method: "DELETE",
    });

    if (response.status === 204) {
      console.log("✅ User deleted");
      alert("User deleted successfully!");
      await fetchUsers();
    } else {
      throw new Error(`Delete failed: ${response.status}`);
    }
  } catch (error) {
    console.error("❌ Delete error:", error);
    alert(`Failed to delete: ${error.message}`);
  }
};

// Edit user
window.editUser = async function (id) {
  try {
    console.log(`✏️ Loading user ID: ${id} for editing`);
    const response = await fetch(`${API_URL}/users/${id}`);

    if (!response.ok)
      throw new Error(`Failed to load user: ${response.status}`);

    const user = await response.json();
    console.log("✅ User data loaded:", user);

    // Fill form
    imgInput.src = user.picture || "./image/Profile Icon.webp";
    userName.value = user.employeeName || "";
    age.value = user.employeeAge || "";
    city.value = user.employeeCity || "";
    email.value = user.employeeEmail || "";
    phone.value = user.employeePhone || "";
    post.value = user.employeePost || "";
    sDate.value = user.startDate || "";

    // Set edit mode
    isEdit = true;
    editId = user.id;
    submitBtn.textContent = "Update";
    modalTitle.textContent = "Update User";
  } catch (error) {
    console.error("❌ Error loading user:", error);
    alert(`Cannot edit user: ${error.message}`);
  }
};

// View user
window.viewUser = async function (id) {
  try {
    const response = await fetch(`${API_URL}/users/${id}`);
    if (!response.ok) throw new Error("Failed to load user");

    const user = await response.json();

    document.querySelector(".showImg").src =
      user.picture || "./image/Profile Icon.webp";
    document.querySelector("#showName").value = user.employeeName || "N/A";
    document.querySelector("#showAge").value = user.employeeAge || "N/A";
    document.querySelector("#showCity").value = user.employeeCity || "N/A";
    document.querySelector("#showEmail").value = user.employeeEmail || "N/A";
    document.querySelector("#showPhone").value = user.employeePhone || "N/A";
    document.querySelector("#showPost").value = user.employeePost || "N/A";
    document.querySelector("#showsDate").value = user.startDate || "N/A";
  } catch (error) {
    console.error("Error viewing user:", error);
    document.querySelector(".showImg").src = "./image/Profile Icon.webp";
    document.querySelector("#showName").value = "Error loading user";
  }
};

// ==================== IMAGE UPLOAD ====================

// Handle image selection - FIXED VERSION
fileInput.onchange = async function (event) {
  // Prevent page refresh
  if (event) event.preventDefault();

  if (!fileInput.files || !fileInput.files[0]) return;

  const file = fileInput.files[0];

  // Validate file size (1MB)
  if (file.size > 1000000) {
    alert("File too large! Maximum size is 1MB.");
    fileInput.value = "";
    return;
  }

  // Show preview immediately
  const reader = new FileReader();
  reader.onload = function (e) {
    imgInput.src = e.target.result;
  };
  reader.readAsDataURL(file);

  // Upload to backend
  try {
    console.log("📤 Uploading image:", file.name);
    const formData = new FormData();
    formData.append("image", file);

    const response = await fetch(`${API_URL}/upload`, {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Upload failed");
    }

    const result = await response.json();
    console.log("✅ Image uploaded:", result);

    // Update image source with server URL
    imgInput.src = result.imageUrl;
  } catch (error) {
    console.error("❌ Upload error:", error);
    // Keep local preview - don't show alert
  }
};

// ==================== TEST CONNECTION ====================

// Test backend connection on load
async function testConnection() {
  try {
    const response = await fetch(`${API_URL}/users`);
    if (response.ok) {
      console.log("✅ Backend connection successful!");
    }
  } catch (error) {
    console.warn("⚠️ Backend not reachable:", error.message);
  }
}

// Run test
testConnection();
