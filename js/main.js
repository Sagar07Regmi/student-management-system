// Main application logic, routing, and initialization

// --- DEFINE THE FUNCTIONS FIRST ---
function navigateToDashboard(role) {
    if (role === 'SuperAdmin') {
        window.location.hash = '#admin-dashboard';
    } else if (role === 'Teacher') {
        window.location.hash = '#teacher-dashboard';
    } else if (role === 'Student') {
        window.location.hash = '#student-dashboard';
    } else if (role === 'Parent') {
        window.location.hash = '#parent-dashboard';
    } else {
        window.location.hash = '#login'; // Fallback
    }
}

async function handleSignOut() {
    console.log("Handling sign out from main.js");
    try {
        await window.auth.signOut(); // Use function from auth.js
        window.ui.updateHeader(null); // Update header to logged-out state
        window.location.hash = '#login'; // Redirect to login page
        setTimeout(() => {
             const loginMessageTarget = document.getElementById('auth-message-login') || window.ui.mainContentElement.querySelector('.auth-message');
             if (loginMessageTarget) { 
                window.ui.showUserMessage("You have been successfully logged out.", "success", loginMessageTarget);
             } else {
                // Fallback if specific message area not found
                window.ui.showUserMessage("You have been successfully logged out.", "success", window.ui.mainContentElement);
             }
        }, 100); 
    } catch (error) {
        console.error("Sign out error:", error);
        window.ui.showUserMessage("Error signing out. Please try again.", "error", window.ui.mainContentElement);
    }
}

async function router() {
    const path = window.location.hash.slice(1) || 'login'; 
    console.log("Routing to:", path);

    if (!window.ui || !window.ui.mainContentElement) {
        console.error("UI module or main content element not ready.");
        return;
    }
    
    const currentUser = await window.auth.getCurrentUser(); 
    window.ui.updateHeader(currentUser); 

    let pageLoaded = false; 

    switch (path) {
        case 'login':
        case 'signup':
        case 'confirm-signup':
        case 'forgot-password':
             if (currentUser) {
                navigateToDashboard(currentUser.role);
                pageLoaded = true;
                return; 
            }
            let callback;
            switch(path) {
                case 'login': callback = window.auth.attachLoginListeners; break;
                case 'signup': callback = window.auth.attachSignUpListeners; break;
                case 'confirm-signup': callback = window.auth.attachConfirmSignUpListeners; break;
                case 'forgot-password': callback = window.auth.attachForgotPasswordListeners; break;
            }
            window.ui.loadPageContent(`pages/${path}.html`, window.ui.mainContentElement, callback);
            pageLoaded = true;
            break;

        case 'admin-dashboard': 
            if (currentUser && currentUser.role === 'SuperAdmin') { 
                const adminDashboardCallback = () => {
                    if (typeof attachAdminDashboardListeners === 'function') { 
                        attachAdminDashboardListeners();
                    }
                };
                window.ui.loadPageContent('pages/admin-dashboard.html', window.ui.mainContentElement, adminDashboardCallback);
                pageLoaded = true;
            } else {
                if (!currentUser) { window.location.hash = '#login'; }
                else { window.ui.showUserMessage("Access Denied. Please log in as a Super Admin.", "error", window.ui.mainContentElement); }
                pageLoaded = true; 
            }
            break;
        
        case 'admin-courses':
            if (currentUser && currentUser.role === 'SuperAdmin') { 
                window.ui.loadPageContent('pages/admin-manage-courses.html', window.ui.mainContentElement, () => {
                    console.log("SuperAdmin 'Manage Courses' page loaded, initializing...");
                    if (typeof initializeAdminCourseManagement === 'function') {
                        initializeAdminCourseManagement();
                    }
                });
                pageLoaded = true;
            } else {
                if (!currentUser) { window.location.hash = '#login'; }
                else { window.ui.showUserMessage("Access Denied. Please log in as a Super Admin to manage courses.", "error", window.ui.mainContentElement); }
                pageLoaded = true;
            }
            break;
        case 'admin-users':
            if (currentUser && currentUser.role === 'SuperAdmin') {
                window.ui.loadPageContent('pages/admin-manage-users.html', window.ui.mainContentElement, () => {
                    console.log("SuperAdmin 'Manage Users' page loaded, initializing...");
                    if (typeof initializeAdminUserManagement === 'function') {
                        initializeAdminUserManagement();
                    }
                });
                pageLoaded = true;
            } else {
                if (!currentUser) { window.location.hash = '#login'; }
                else { window.ui.showUserMessage("Access Denied. Please log in as a Super Admin to manage users.", "error", window.ui.mainContentElement); }
                pageLoaded = true;
            }
            break;

        case 'teacher-dashboard': 
            if (currentUser && currentUser.role === 'Teacher') {
                window.ui.loadPageContent('pages/teacher-dashboard.html', window.ui.mainContentElement);
                pageLoaded = true;
            } else {
                if (!currentUser) { window.location.hash = '#login'; }
                else { window.ui.showUserMessage("Access Denied. Please log in as a Teacher.", "error", window.ui.mainContentElement); }
                pageLoaded = true;
            }
            break;

        case 'teacher-my-courses':
            if (currentUser && currentUser.role === 'Teacher') {
                window.ui.loadPageContent('pages/teacher-manage-my-courses.html', window.ui.mainContentElement);
                pageLoaded = true;
            } else {
                if (!currentUser) { window.location.hash = '#login'; }
                else { window.ui.showUserMessage("Access Denied. Please log in as a Teacher.", "error", window.ui.mainContentElement); }
                pageLoaded = true;
            }
            break;
        
        case 'teacher-grades':
             if (currentUser && currentUser.role === 'Teacher') {
                window.ui.loadPageContent('pages/teacher-grades-attendance.html', window.ui.mainContentElement);
                pageLoaded = true;
            } else {
                if (!currentUser) { window.location.hash = '#login'; }
                else { window.ui.showUserMessage("Access Denied. Please log in as a Teacher.", "error", window.ui.mainContentElement); }
                pageLoaded = true;
            }
            break;
            
        case 'student-dashboard':
            if (currentUser && currentUser.role === 'Student') {
                window.ui.loadPageContent('pages/student-dashboard.html', window.ui.mainContentElement);
                pageLoaded = true;
            } else {
                if (!currentUser) { window.location.hash = '#login'; }
                else { window.ui.showUserMessage("Access Denied. Please log in as a Student.", "error", window.ui.mainContentElement); }
                pageLoaded = true;
            }
            break;
        
        case 'my-courses': 
            if (currentUser && currentUser.role === 'Student') {
                window.ui.loadPageContent('pages/student-my-courses.html', window.ui.mainContentElement);
                pageLoaded = true;
            } else {
                if (!currentUser) { window.location.hash = '#login'; }
                else { window.ui.showUserMessage("Access Denied. Please log in as a Student to view your courses.", "error", window.ui.mainContentElement); }
                pageLoaded = true;
            }
            break;

        case 'parent-dashboard':
            if (currentUser && currentUser.role === 'Parent') {
                window.ui.loadPageContent('pages/parent-dashboard.html', window.ui.mainContentElement);
                pageLoaded = true;
            } else {
                if (!currentUser) { window.location.hash = '#login'; }
                else { window.ui.showUserMessage("Access Denied. Please log in as a Parent.", "error", window.ui.mainContentElement); }
                pageLoaded = true;
            }
            break;
    }

    if (!pageLoaded) {
        console.log('404 - Page not found for route:', path);
        const dashboardLink = currentUser ? `#${currentUser.role.toLowerCase().replace('superadmin', 'admin')}-dashboard` : '#login';
        const goBackText = currentUser ? 'Go to Your Dashboard' : 'Go to Login';
        window.ui.mainContentElement.innerHTML = `<div class="text-center py-10"><h2 class="text-2xl font-bold text-red-600">404 - Page Not Found</h2><p>The page for route '<code>#${path}</code>' does not exist.</p><a href="${dashboardLink}" class="text-sky-600 hover:underline">${goBackText}</a></div>`;
    }
}

// --- Functions for Admin Dashboard (Student Management) ---
function attachAdminDashboardListeners() {
    const addStudentForm = document.getElementById('addStudentForm');
    if (addStudentForm) {
        addStudentForm.addEventListener('submit', async (event) => {
            event.preventDefault();
            const studentData = {
                StudentID: document.getElementById('addFormStudentID').value,
                Name: document.getElementById('addFormStudentName').value,
                Email: document.getElementById('addFormStudentEmail').value,
                DateOfBirth: document.getElementById('addFormStudentDOB').value,
            };
            window.ui.showUserMessage("Adding student...", "info", "#addMessage");
            try {
                const result = await window.api.addStudent(studentData);
                window.ui.showUserMessage(result.message || "Student added successfully!", "success", "#addMessage");
                addStudentForm.reset();
                if (typeof loadAllStudentsForAdminTable === 'function') loadAllStudentsForAdminTable();
            } catch (error) {
                window.ui.showUserMessage(error.message || "Failed to add student.", "error", "#addMessage");
            }
        });
    }

    const getStudentByIdForm = document.getElementById('getStudentByIdForm');
    if (getStudentByIdForm) {
        getStudentByIdForm.addEventListener('submit', async (event) => {
            event.preventDefault();
            const studentId = document.getElementById('searchStudentID').value;
            window.ui.showUserMessage("Fetching student...", "info", "#getStudentResultDiv");
            try {
                const student = await window.api.getStudentById(studentId);
                const resultDiv = document.getElementById('getStudentResultDiv');
                if (resultDiv){
                    resultDiv.innerHTML = `
                        <p><strong>ID:</strong> ${student.studentID || student.StudentID || 'N/A'}</p>
                        <p><strong>Name:</strong> ${student.Name || 'N/A'}</p>
                        <p><strong>Email:</strong> ${student.Email || 'N/A'}</p>
                        <p><strong>Date of Birth:</strong> ${student.DateOfBirth || 'N/A'}</p>
                    `;
                    resultDiv.className = 'student-details message-box info'; 
                }
            } catch (error) {
                 window.ui.showUserMessage(error.message || "Failed to fetch student.", "error", "#getStudentResultDiv");
            }
        });
    }
    
    const listStudentsBtn = document.getElementById('listStudentsBtn');
    if (listStudentsBtn) {
        listStudentsBtn.addEventListener('click', loadAllStudentsForAdminTable);
    }
    if (typeof loadAllStudentsForAdminTable === 'function') { 
        loadAllStudentsForAdminTable();
    }
}

async function loadAllStudentsForAdminTable() {
    const tableBody = document.getElementById('studentListTableBody');
    const messageTarget = "#listMessage"; 
    if (!tableBody) {
        console.warn("studentListTableBody not found for admin table.");
        return;
    }

    window.ui.showUserMessage("Loading students...", "info", messageTarget);
    tableBody.innerHTML = '<tr><td colspan="5" class="text-center p-4">Loading...</td></tr>';

    try {
        const students = await window.api.getAllStudents(); 
        const listMessageEl = document.getElementById('listMessage'); 

        if (students && students.length > 0) {
            tableBody.innerHTML = ''; 
            students.forEach(student => {
                const row = tableBody.insertRow();
                row.innerHTML = `
                    <td class="p-3">${student.studentID || student.StudentID || 'N/A'}</td>
                    <td class="p-3">${student.Name || 'N/A'}</td>
                    <td class="p-3">${student.Email || 'N/A'}</td>
                    <td class="p-3">${student.DateOfBirth || 'N/A'}</td>
                    <td class="p-3">
                        <button class="btn btn-primary btn-sm edit-student-btn" data-id="${student.studentID || student.StudentID}">Edit</button>
                        <button class="btn btn-danger btn-sm delete-student-btn" data-id="${student.studentID || student.StudentID}">Delete</button>
                    </td>
                `;
            });
            if(listMessageEl) listMessageEl.style.display = 'none'; 
        } else {
            tableBody.innerHTML = '<tr><td colspan="5" class="text-center p-4">No students found.</td></tr>';
            window.ui.showUserMessage("No students found in the system.", "info", messageTarget);
        }
    } catch (error) {
        tableBody.innerHTML = `<tr><td colspan="5" class="text-center p-4 text-red-600">Error loading students: ${error.message}</td></tr>`;
        window.ui.showUserMessage(error.message || "Failed to load students.", "error", messageTarget);
    }
}


// --- Functions for Admin Course Management Page ---
function initializeAdminCourseManagement() {
    console.log("Initializing Admin (SuperAdmin) Course Management page...");
    
    // Get DOM elements from admin-manage-courses.html
    const courseForm = document.getElementById('adminCourseForm');
    const coursesTableBody = document.getElementById('adminCoursesTableBody');
    const refreshCoursesBtn = document.getElementById('refreshCoursesListBtn');
    const clearFormBtn = document.getElementById('clearCourseFormButton');
    const formTitle = document.getElementById('courseFormTitle');
    const courseIdInput = document.getElementById('courseFormCourseId');
    const courseCodeInput = document.getElementById('courseCode');
    
    // Event listener for the form submission (Add/Update Course)
    if (courseForm) {
        courseForm.addEventListener('submit', async (event) => {
            event.preventDefault();
            const courseData = {
                courseCode: document.getElementById('courseCode').value,
                courseName: document.getElementById('courseName').value,
                description: document.getElementById('courseDescription').value,
                teacherUserID: document.getElementById('courseTeacher').value
            };
            const messageTarget = '#adminCourseFormMessage';
            window.ui.showUserMessage("Saving course...", "info", messageTarget);

            try {
                // For now, we only handle adding a new course with the mock API
                const result = await window.api.addCourse(courseData);
                window.ui.showUserMessage(result.message || "Course saved successfully!", "success", messageTarget);
                courseForm.reset(); // Clear form on success
                loadAllCoursesForAdminTable(); // Refresh the table
            } catch(error) {
                window.ui.showUserMessage(error.message || "Failed to save course.", "error", messageTarget);
            }
        });
    }

    // Event listener for the "Refresh List" button
    if (refreshCoursesBtn) {
        refreshCoursesBtn.addEventListener('click', loadAllCoursesForAdminTable);
    }
    
    // Event listener for the "Clear Form" button
    if(clearFormBtn) {
        clearFormBtn.addEventListener('click', () => {
            courseForm.reset();
            formTitle.textContent = "Add New Course";
            courseIdInput.value = '';
            if (courseCodeInput) courseCodeInput.disabled = false;
        });
    }

    // Initial load of the courses table
    loadAllCoursesForAdminTable();
}

async function loadAllCoursesForAdminTable() {
    const tableBody = document.getElementById('adminCoursesTableBody');
    const messageTarget = "#adminCoursesListMessage";
    if (!tableBody) {
        console.warn("adminCoursesTableBody not found.");
        return;
    }

    window.ui.showUserMessage("Loading courses...", "info", messageTarget);
    tableBody.innerHTML = '<tr><td colspan="4" class="text-center p-4">Loading...</td></tr>';

    try {
        const response = await window.api.getAllCourses();
        const courses = response.courses || [];
        const listMessageEl = document.getElementById('adminCoursesListMessage');

        if (courses.length > 0) {
            tableBody.innerHTML = '';
            courses.forEach(course => {
                const row = tableBody.insertRow();
                row.innerHTML = `
                    <td class="p-3 font-mono">${course.courseCode}</td>
                    <td class="p-3 font-medium">${course.courseName}</td>
                    <td class="p-3">${course.teacherUserID || 'Unassigned'}</td>
                    <td class="p-3">
                        <button class="btn btn-primary btn-sm edit-course-btn" data-id="${course.courseID}">Edit</button>
                        <button class="btn btn-danger btn-sm delete-course-btn" data-id="${course.courseID}">Delete</button>
                    </td>
                `;
            });
            if(listMessageEl) listMessageEl.style.display = 'none';
        } else {
            tableBody.innerHTML = '<tr><td colspan="4" class="text-center p-4">No courses found. Add one using the form.</td></tr>';
            window.ui.showUserMessage("No courses found.", "info", messageTarget);
        }
    } catch (error) {
        tableBody.innerHTML = `<tr><td colspan="4" class="text-center p-4 text-red-600">Error loading courses: ${error.message}</td></tr>`;
        window.ui.showUserMessage(error.message || "Failed to load courses.", "error", messageTarget);
    }
}


// --- App Initialization ---
document.addEventListener('DOMContentLoaded', async () => {
    console.log("DOM fully loaded and parsed. Initializing app...");
    try {
        const user = await window.auth.getCurrentUser(); 
        window.ui.updateHeader(user); 
        window.addEventListener('hashchange', router);
        router(); 
    } catch (error) {
        console.error("Error during app initialization:", error);
        window.ui.updateHeader(null); 
        window.location.hash = '#login'; 
        router(); 
    }
});

window.app = {
    navigateToDashboard: navigateToDashboard,
    handleSignOut: handleSignOut,
    getNavForRole: (role) => {
        // Ensure these hash links match your router cases
        if (role === 'SuperAdmin') return `<a href="#admin-dashboard" class="nav-link text-sky-100 hover:text-white mr-2 md:mr-3 font-medium px-2 md:px-3 py-2 rounded-md hover:bg-sky-700 transition-colors">Dashboard</a> <a href="#admin-courses" class="nav-link text-sky-100 hover:text-white mr-2 md:mr-3 font-medium px-2 md:px-3 py-2 rounded-md hover:bg-sky-700 transition-colors">Manage Courses</a> <a href="#admin-users" class="nav-link text-sky-100 hover:text-white mr-2 md:mr-3 font-medium px-2 md:px-3 py-2 rounded-md hover:bg-sky-700 transition-colors">Manage Users</a>`;
        if (role === 'Teacher') return `<a href="#teacher-dashboard" class="nav-link text-sky-100 hover:text-white mr-2 md:mr-3 font-medium px-2 md:px-3 py-2 rounded-md hover:bg-sky-700 transition-colors">Dashboard</a> <a href="#teacher-my-courses" class="nav-link text-sky-100 hover:text-white mr-2 md:mr-3 font-medium px-2 md:px-3 py-2 rounded-md hover:bg-sky-700 transition-colors">My Courses</a> <a href="#teacher-grades" class="nav-link text-sky-100 hover:text-white mr-2 md:mr-3 font-medium px-2 md:px-3 py-2 rounded-md hover:bg-sky-700 transition-colors">Grades/Attendance</a>`;
        if (role === 'Student') return `<a href="#student-dashboard" class="nav-link text-sky-100 hover:text-white mr-2 md:mr-3 font-medium px-2 md:px-3 py-2 rounded-md hover:bg-sky-700 transition-colors">My Dashboard</a> <a href="#my-courses" class="nav-link text-sky-100 hover:text-white mr-2 md:mr-3 font-medium px-2 md:px-3 py-2 rounded-md hover:bg-sky-700 transition-colors">My Courses</a>`;
        if (role === 'Parent') return `<a href="#parent-dashboard" class="nav-link text-sky-100 hover:text-white mr-2 md:mr-3 font-medium px-2 md:px-3 py-2 rounded-md hover:bg-sky-700 transition-colors">Child Info</a>`;
        return '';
    }
};
