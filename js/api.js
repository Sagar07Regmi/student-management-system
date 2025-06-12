// Functions for making API calls to your backend

// --- MOCK DATABASE for Courses (for frontend testing) ---
let mockCoursesDb = [
    { courseID: "CS101", courseCode: "CS101", courseName: "Introduction to Programming", description: "Learn the fundamentals of programming using Python.", teacherUserID: "mock-teacher-1" },
    { courseID: "MATH202", courseCode: "MATH202", courseName: "Advanced Calculus", description: "Explore advanced topics in calculus and differential equations.", teacherUserID: "mock-teacher-2" },
    { courseID: "HIST150", courseCode: "HIST150", courseName: "World History: 1500-Present", description: "A survey of major global events and developments.", teacherUserID: "mock-teacher-1" }
];

let mockUsersDb = [ // NEW MOCK DB
    { userID: "mock-sub-superadminUser", username: "superadminUser", email: "principal@example.com", role: "SuperAdmin"},
    { userID: "mock-sub-teacherUser", username: "teacherUser", email: "teacher1@example.com", role: "Teacher"},
    { userID: "mock-sub-anotherTeacher", username: "anotherTeacher", email: "teacher2@example.com", role: "Teacher"},
    { userID: "mock-sub-studentUser", username: "studentUser", email: "student@example.com", role: "Student"},
    { userID: "mock-sub-sagar", username: "sagar", email: "sagar.student@example.com", role: "Student"},
    { userID: "mock-sub-parentUser", username: "parentUser", email: "parent1@example.com", role: "Parent"},
];

/**
 * Makes an authenticated API request.
 * @param {string} endpoint - The API endpoint path (e.g., '/students', '/students/S1001').
 * @param {string} method - HTTP method (GET, POST, PUT, DELETE).
 * @param {object} [body] - The request body for POST/PUT requests.
 * @returns {Promise<object>} - The JSON response from the API.
 * @throws {Error} - If the API call fails or returns an error status.
 */
async function makeApiRequest(endpoint, method = 'GET', body = null) {
    const baseUrl = window.appConfig.api.invokeUrl;
    
    const currentUser = await window.auth.getCurrentUser(); 
    const token = currentUser ? currentUser.token : null;

    if (!baseUrl) {
        console.error("API Invoke URL is not configured in config.js");
        throw new Error("API endpoint not configured.");
    }

    const headers = {
        'Content-Type': 'application/json',
    };

    if (token) {
        headers['Authorization'] = `Bearer ${token}`; 
    }

    const requestOptions = {
        method: method,
        headers: headers,
    };

    if (body && (method === 'POST' || method === 'PUT' || method === 'PATCH')) {
        requestOptions.body = JSON.stringify(body);
    }

    const url = `${baseUrl}${endpoint}`; 
    console.log(`Making API request: ${method} ${url}`, "Body:", body, "Headers:", headers);

    try {
        const response = await fetch(url, requestOptions);
        
        let responseData;
        try {
            responseData = await response.json();
        } catch (e) {
            responseData = { error: `Non-JSON response or parsing error. Status: ${response.status}`, details: await response.text() };
        }

        if (!response.ok) {
            console.error('API Error Response:', response.status, responseData);
            const errorMessage = responseData.error || responseData.message || `HTTP error! Status: ${response.status}`;
            const errorToThrow = new Error(errorMessage);
            errorToThrow.details = responseData.details || responseData;
            errorToThrow.status = response.status;
            throw errorToThrow;
        }
        console.log('API Success Response:', responseData);
        return responseData;
    } catch (error) {
        console.error('Fetch error in makeApiRequest:', error.message, error.details ? error.details : '');
        if (error.status) { 
             throw error;
        }
        throw new Error(`Network error or an unexpected issue occurred: ${error.message}`); 
    }
}

// --- Specific API functions for Students (Existing) ---

async function apiAddStudent(studentData) {
    return makeApiRequest('/students', 'POST', studentData);
}

async function apiGetAllStudents() {
    const data = await makeApiRequest('/students', 'GET');
    return data.students || []; 
}

async function apiGetStudentById(studentId) {
    return makeApiRequest(`/students/${studentId}`, 'GET');
}

async function apiUpdateStudent(studentId, studentData) {
    return makeApiRequest(`/students/${studentId}`, 'PUT', studentData);
}

async function apiDeleteStudent(studentId) {
    return makeApiRequest(`/students/${studentId}`, 'DELETE');
}


// --- Specific API functions for Courses (NEW) ---

async function apiGetAllCourses() {
    console.log("MOCK: Getting all courses from mock DB.");
    // ** TODO: Replace with: return makeApiRequest('/courses', 'GET'); **
    // For now, return mock data
    return new Promise(resolve => {
        setTimeout(() => {
            resolve({ courses: mockCoursesDb });
        }, 500); // Simulate network delay
    });
}

async function apiAddCourse(courseData) {
    console.log("MOCK: Adding course to mock DB:", courseData);
    // ** TODO: Replace with: return makeApiRequest('/courses', 'POST', courseData); **
    // For now, add to mock data
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            if (!courseData.courseCode || !courseData.courseName) {
                reject({ message: "Course Code and Name are required." });
                return;
            }
            // Simulate generating a unique ID if it doesn't exist
            const newCourse = { 
                ...courseData, 
                courseID: courseData.courseCode // Use courseCode as ID for mock
            };
            mockCoursesDb.push(newCourse);
            resolve({ message: "Course added successfully!", course: newCourse });
        }, 500);
    });
}

// Placeholder for future update function
async function apiUpdateCourse(courseId, courseData) {
    console.log(`MOCK: Updating course ${courseId} in mock DB with:`, courseData);
    // ** TODO: Replace with: return makeApiRequest(`/courses/${courseId}`, 'PUT', courseData); **
    return new Promise(resolve => {
        setTimeout(() => {
            const index = mockCoursesDb.findIndex(c => c.courseID === courseId);
            if (index !== -1) {
                mockCoursesDb[index] = { ...mockCoursesDb[index], ...courseData };
                resolve({ message: "Course updated successfully!", course: mockCoursesDb[index] });
            } else {
                reject({ message: "Course not found." });
            }
        }, 500);
    });
}


// Expose API functions globally under window.api
window.api = {
    // Student functions
    addStudent: apiAddStudent,
    getAllStudents: apiGetAllStudents,
    getStudentById: apiGetStudentById,
    updateStudent: apiUpdateStudent,
    deleteStudent: apiDeleteStudent,
    
    // Course functions
    getAllCourses: apiGetAllCourses,
    addCourse: apiAddCourse,
    updateCourse: apiUpdateCourse,

    // User Management functions (NEW)
    getUsersByRole: apiGetUsersByRole,
    inviteUser: apiInviteUser
};
