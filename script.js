// === DOM Elements ===
// Auth Elements
const authContainer = document.getElementById('auth-container');
const dashboardContainer = document.getElementById('dashboard-container');
const tabLogin = document.getElementById('tab-login');
const tabSignup = document.getElementById('tab-signup');
const loginForm = document.getElementById('login-form');
const signupForm = document.getElementById('signup-form');
const loginError = document.getElementById('login-error');
const signupError = document.getElementById('signup-error');
const strengthBar = document.getElementById('strength-bar');
const strengthText = document.getElementById('strength-text');
const signupPassword = document.getElementById('signup-password');

// Dashboard Elements
const userNameDisplay = document.getElementById('user-name-display');
const userAvatar = document.getElementById('user-avatar');
const greetingDisplay = document.getElementById('greeting');
const logoutBtn = document.getElementById('logout-btn');
const themeToggle = document.getElementById('theme-toggle');

// Task Elements
const tasksContainer = document.getElementById('tasks-container');
const addTaskBtn = document.getElementById('add-task-btn');
const taskModal = document.getElementById('task-modal');
const closeModal = document.getElementById('close-modal');
const cancelTaskBtn = document.getElementById('cancel-task');
const taskForm = document.getElementById('task-form');
const modalTitle = document.getElementById('modal-title');
const taskIdInput = document.getElementById('task-id');
const searchInput = document.getElementById('search-input');
const priorityFilter = document.getElementById('priority-filter');
const sortSelect = document.getElementById('sort-select');
const filterBtns = document.querySelectorAll('.nav-btn');

// === State Management ===
let currentUser = null;
let tasks = [];
let currentFilter = 'all';

// === Initialization ===
function init() {
    loadTheme();
    checkAuth();
    
    // Set minimum date for task deadline to today
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('task-deadline').min = today;
}

// === Theme Management ===
function loadTheme() {
    const savedTheme = localStorage.getItem('theme') || 'light';
    document.documentElement.setAttribute('data-theme', savedTheme);
    updateThemeIcon(savedTheme);
}

themeToggle.addEventListener('click', () => {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    const newTheme = currentTheme === 'light' ? 'dark' : 'light';
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
    updateThemeIcon(newTheme);
});

function updateThemeIcon(theme) {
    themeToggle.innerHTML = theme === 'light' ? '<i class="fa-solid fa-moon"></i>' : '<i class="fa-solid fa-sun"></i>';
}

// === Authentication ===
function checkAuth() {
    const sessionUser = localStorage.getItem('currentUser');
    if (sessionUser) {
        currentUser = JSON.parse(sessionUser);
        showDashboard();
    } else {
        showAuth();
    }
}

// Auth Tabs
tabLogin.addEventListener('click', () => {
    tabLogin.classList.add('active');
    tabSignup.classList.remove('active');
    loginForm.classList.remove('hidden');
    signupForm.classList.add('hidden');
    loginError.textContent = '';
});

tabSignup.addEventListener('click', () => {
    tabSignup.classList.add('active');
    tabLogin.classList.remove('active');
    signupForm.classList.remove('hidden');
    loginForm.classList.add('hidden');
    signupError.textContent = '';
});

// Password Strength
signupPassword.addEventListener('input', (e) => {
    const val = e.target.value;
    let strength = 0;
    
    if (val.length >= 8) strength += 25;
    if (val.match(/[A-Z]/)) strength += 25;
    if (val.match(/[0-9]/)) strength += 25;
    if (val.match(/[^A-Za-z0-9]/)) strength += 25;

    strengthBar.style.width = strength + '%';
    
    if (strength <= 25) {
        strengthBar.style.backgroundColor = 'var(--danger)';
        strengthText.textContent = 'Weak (Use 8+ chars, upper, num, symbol)';
        strengthText.style.color = 'var(--danger)';
    } else if (strength <= 50) {
        strengthBar.style.backgroundColor = 'var(--warning)';
        strengthText.textContent = 'Fair';
        strengthText.style.color = 'var(--warning)';
    } else if (strength <= 75) {
        strengthBar.style.backgroundColor = 'var(--primary-color)';
        strengthText.textContent = 'Good';
        strengthText.style.color = 'var(--primary-color)';
    } else {
        strengthBar.style.backgroundColor = 'var(--success)';
        strengthText.textContent = 'Strong';
        strengthText.style.color = 'var(--success)';
    }
});

// Signup
signupForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const name = document.getElementById('signup-name').value.trim();
    const email = document.getElementById('signup-email').value.trim();
    const password = signupPassword.value;

    if (password.length < 6) {
        signupError.textContent = 'Password must be at least 6 characters.';
        return;
    }

    const users = JSON.parse(localStorage.getItem('users') || '[]');
    
    if (users.find(u => u.email === email)) {
        signupError.textContent = 'Email already registered.';
        return;
    }

    const newUser = { id: Date.now().toString(), name, email, password };
    users.push(newUser);
    localStorage.setItem('users', JSON.stringify(users));
    
    // Auto login
    login(newUser);
});

// Login
loginForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const email = document.getElementById('login-email').value.trim();
    const password = document.getElementById('login-password').value;

    const users = JSON.parse(localStorage.getItem('users') || '[]');
    const user = users.find(u => u.email === email && u.password === password);

    if (user) {
        login(user);
    } else {
        loginError.textContent = 'Invalid email or password.';
    }
});

function login(user) {
    currentUser = { id: user.id, name: user.name, email: user.email };
    localStorage.setItem('currentUser', JSON.stringify(currentUser));
    showDashboard();
    loginForm.reset();
    signupForm.reset();
    strengthBar.style.width = '0%';
    strengthText.textContent = 'Password strength';
}

logoutBtn.addEventListener('click', () => {
    localStorage.removeItem('currentUser');
    currentUser = null;
    showAuth();
});

// === UI Navigation ===
function showAuth() {
    authContainer.classList.remove('hidden');
    dashboardContainer.classList.add('hidden');
}

function showDashboard() {
    authContainer.classList.add('hidden');
    dashboardContainer.classList.remove('hidden');
    
    // Set User Info
    userNameDisplay.textContent = currentUser.name;
    userAvatar.textContent = currentUser.name.charAt(0).toUpperCase();
    
    const hour = new Date().getHours();
    let timeGreeting = 'Good Evening';
    if (hour < 12) timeGreeting = 'Good Morning';
    else if (hour < 18) timeGreeting = 'Good Afternoon';
    
    greetingDisplay.textContent = `${timeGreeting}, ${currentUser.name.split(' ')[0]}!`;

    loadTasks();
}

// === Task Management ===
function loadTasks() {
    const allTasks = JSON.parse(localStorage.getItem('tasks') || '[]');
    // Filter tasks by current user
    tasks = allTasks.filter(t => t.userId === currentUser.id);
    renderTasks();
}

function saveTasks() {
    const allTasks = JSON.parse(localStorage.getItem('tasks') || '[]');
    // Remove current user's old tasks and add updated ones
    const otherTasks = allTasks.filter(t => t.userId !== currentUser.id);
    const updatedTasks = [...otherTasks, ...tasks];
    localStorage.setItem('tasks', JSON.stringify(updatedTasks));
    renderTasks();
}

// Task Form Submit
taskForm.addEventListener('submit', (e) => {
    e.preventDefault();
    
    const id = taskIdInput.value;
    const title = document.getElementById('task-title').value.trim();
    const desc = document.getElementById('task-desc').value.trim();
    const deadline = document.getElementById('task-deadline').value;
    const priority = document.getElementById('task-priority').value;

    if (id) {
        // Edit
        const taskIndex = tasks.findIndex(t => t.id === id);
        if (taskIndex !== -1) {
            tasks[taskIndex] = { ...tasks[taskIndex], title, desc, deadline, priority, updatedAt: new Date().toISOString() };
        }
    } else {
        // Add
        const newTask = {
            id: Date.now().toString(),
            userId: currentUser.id,
            title,
            desc,
            deadline,
            priority,
            completed: false,
            createdAt: new Date().toISOString()
        };
        tasks.push(newTask);
    }

    saveTasks();
    closeTaskModal();
});

// Delete Task
window.deleteTask = function(id) {
    if (confirm('Are you sure you want to delete this task?')) {
        tasks = tasks.filter(t => t.id !== id);
        saveTasks();
    }
};

// Edit Task
window.editTask = function(id) {
    const task = tasks.find(t => t.id === id);
    if (task) {
        modalTitle.textContent = 'Edit Task';
        taskIdInput.value = task.id;
        document.getElementById('task-title').value = task.title;
        document.getElementById('task-desc').value = task.desc;
        document.getElementById('task-deadline').value = task.deadline;
        document.getElementById('task-priority').value = task.priority;
        taskModal.classList.remove('hidden');
    }
};

// Toggle Completion
window.toggleTaskStatus = function(id) {
    const taskIndex = tasks.findIndex(t => t.id === id);
    if (taskIndex !== -1) {
        tasks[taskIndex].completed = !tasks[taskIndex].completed;
        saveTasks();
    }
};

// === Filtering & Sorting ===
filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        filterBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        currentFilter = btn.dataset.filter;
        renderTasks();
    });
});

searchInput.addEventListener('input', renderTasks);
priorityFilter.addEventListener('change', renderTasks);
sortSelect.addEventListener('change', renderTasks);

function renderTasks() {
    let filteredTasks = [...tasks];

    // 1. Sidebar Status Filter
    if (currentFilter === 'pending') {
        filteredTasks = filteredTasks.filter(t => !t.completed);
    } else if (currentFilter === 'completed') {
        filteredTasks = filteredTasks.filter(t => t.completed);
    }

    // 2. Search Filter
    const query = searchInput.value.toLowerCase().trim();
    if (query) {
        filteredTasks = filteredTasks.filter(t => 
            t.title.toLowerCase().includes(query) || 
            t.desc.toLowerCase().includes(query)
        );
    }

    // 3. Priority Filter
    const priority = priorityFilter.value;
    if (priority !== 'all') {
        filteredTasks = filteredTasks.filter(t => t.priority === priority);
    }

    // 4. Sorting
    const sortVal = sortSelect.value;
    filteredTasks.sort((a, b) => {
        if (sortVal === 'deadline-asc') {
            return new Date(a.deadline) - new Date(b.deadline);
        } else if (sortVal === 'deadline-desc') {
            return new Date(b.deadline) - new Date(a.deadline);
        } else if (sortVal === 'priority-desc') {
            const pMap = { high: 3, medium: 2, low: 1 };
            return pMap[b.priority] - pMap[a.priority];
        }
        return 0;
    });

    // Render HTML
    tasksContainer.innerHTML = '';

    if (filteredTasks.length === 0) {
        tasksContainer.innerHTML = `
            <div class="empty-state">
                <i class="fa-regular fa-folder-open"></i>
                <h3>No tasks found</h3>
                <p>Add a new task to get started or try changing your filters.</p>
            </div>
        `;
        return;
    }

    filteredTasks.forEach(task => {
        const [year, month, day] = task.deadline.split('-');
        const dateObj = new Date(year, month - 1, day);
        const formattedDate = dateObj.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
        
        const isOverdue = !task.completed && new Date(task.deadline).setHours(0,0,0,0) < new Date().setHours(0,0,0,0);
        let dateColorStyle = isOverdue ? 'color: var(--danger); font-weight: 600;' : '';

        const card = document.createElement('div');
        card.className = `task-card priority-${task.priority} ${task.completed ? 'completed' : ''}`;
        
        card.innerHTML = `
            <div class="task-header">
                <div class="checkbox-wrapper">
                    <label>
                        <input type="checkbox" onchange="toggleTaskStatus('${task.id}')" ${task.completed ? 'checked' : ''}>
                        <div class="checkbox-custom">
                            <i class="fa-solid fa-check"></i>
                        </div>
                    </label>
                </div>
                <div class="task-actions">
                    <button class="btn-icon" onclick="editTask('${task.id}')" title="Edit"><i class="fa-regular fa-pen-to-square"></i></button>
                    <button class="btn-icon" onclick="deleteTask('${task.id}')" title="Delete"><i class="fa-regular fa-trash-can"></i></button>
                </div>
            </div>
            <h4 class="task-title">${escapeHTML(task.title)}</h4>
            ${task.desc ? `<p class="task-desc">${escapeHTML(task.desc)}</p>` : ''}
            <div class="task-footer">
                <div class="task-meta" style="${dateColorStyle}">
                    <i class="fa-regular fa-calendar"></i>
                    <span>${formattedDate}</span>
                </div>
                <div class="task-meta" style="text-transform: capitalize;">
                    <i class="fa-solid fa-flag" style="color: var(--${task.priority === 'high' ? 'danger' : task.priority === 'medium' ? 'warning' : 'success'})"></i>
                    <span>${task.priority}</span>
                </div>
            </div>
        `;
        tasksContainer.appendChild(card);
    });
}

function escapeHTML(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
}

// === Modal Interactions ===
addTaskBtn.addEventListener('click', () => {
    modalTitle.textContent = 'Add New Task';
    taskForm.reset();
    taskIdInput.value = '';
    
    // Set default date to today
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('task-deadline').value = today;
    
    taskModal.classList.remove('hidden');
});

function closeTaskModal() {
    taskModal.classList.add('hidden');
}

closeModal.addEventListener('click', closeTaskModal);
cancelTaskBtn.addEventListener('click', closeTaskModal);

taskModal.addEventListener('click', (e) => {
    if (e.target === taskModal) {
        closeTaskModal();
    }
});

// Run Initialization
init();
