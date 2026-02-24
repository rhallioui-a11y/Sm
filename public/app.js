const api = '/api/students';
const tbody = document.querySelector('#studentsTable tbody');
const form = document.getElementById('studentForm');
const resetBtn = document.getElementById('resetBtn');
const searchInput = document.getElementById('search');
const darkModeToggle = document.getElementById('darkModeToggle');
const toastContainer = document.getElementById('toastContainer');

// Dark Mode Setup
function initDarkMode() {
  const isDark = localStorage.getItem('darkMode') === 'true';
  if (isDark) {
    document.documentElement.classList.add('dark');
  }
}

darkModeToggle.addEventListener('click', () => {
  const isDark = document.documentElement.classList.toggle('dark');
  localStorage.setItem('darkMode', isDark);
});

// Toast Notifications
function showToast(message, type = 'success', duration = 3000) {
  const toast = document.createElement('div');
  toast.className = `toast ${type} scale-in`;
  
  const icons = {
    success: '✓',
    error: '✕',
    info: 'ℹ'
  };
  
  toast.innerHTML = `
    <span>${icons[type]}</span>
    <span>${message}</span>
  `;
  
  toastContainer.appendChild(toast);
  
  setTimeout(() => {
    toast.classList.add('fade-out');
    setTimeout(() => toast.remove(), 300);
  }, duration);
}

// Statistics Update
function updateStats(students) {
  const total = students.length;
  const withEmail = students.filter(s => s.email).length;
  const avgAge = students.filter(s => s.age).length > 0 
    ? Math.round(students.filter(s => s.age).reduce((sum, s) => sum + (s.age || 0), 0) / students.filter(s => s.age).length)
    : 0;

  document.getElementById('totalStudents').textContent = total;
  document.getElementById('withEmail').textContent = withEmail;
  document.getElementById('avgAge').textContent = avgAge > 0 ? avgAge : '-';
}

// Loading Spinner
function showLoading(show = true) {
  const spinner = document.getElementById('loadingSpinner');
  const table = document.getElementById('studentsTable');
  if (show) {
    spinner.classList.remove('hidden');
    table.style.opacity = '0.5';
  } else {
    spinner.classList.add('hidden');
    table.style.opacity = '1';
  }
}

// Fetch Students
async function fetchStudents() {
  try {
    showLoading(true);
    const res = await fetch(api);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const students = await res.json();
    showLoading(false);
    return students;
  } catch (err) {
    console.error('Fetch students error:', err);
    showLoading(false);
    showToast('Error loading students', 'error');
    return [];
  }
}

// Render Students
function render(students) {
  tbody.innerHTML = '';
  if (!students || students.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="5" class="px-6 py-12 text-center text-slate-500 dark:text-slate-400">
          <svg class="w-12 h-12 mx-auto mb-2 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 8.646 4 4 0 010-8.646M9 6H5a2 2 0 00-2 2v12a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-4m-6 8a3 3 0 11-6 0 3 3 0 016 0z"></path>
          </svg>
          No students found
        </td>
      </tr>
    `;
    return;
  }
  
  students.forEach((s, index) => {
    const tr = document.createElement('tr');
    tr.className = 'hover:bg-blue-50 dark:hover:bg-slate-700 transition-colors scale-in';
    tr.style.animationDelay = `${index * 0.05}s`;
    tr.innerHTML = `
      <td class="px-6 py-4 text-sm font-medium text-slate-900 dark:text-white">${s.id}</td>
      <td class="px-6 py-4 text-sm font-medium text-slate-900 dark:text-white">${s.name}</td>
      <td class="px-6 py-4 text-sm text-slate-600 dark:text-slate-400">${s.email || '-'}</td>
      <td class="px-6 py-4 text-sm text-slate-600 dark:text-slate-400">${s.age || '-'}</td>
      <td class="px-6 py-4 text-sm space-x-2 flex">
        <button data-id="${s.id}" class="edit bg-blue-500 hover:bg-blue-600 text-white px-3 py-1.5 rounded-md text-xs font-semibold transition-all hover:-translate-y-0.5 shadow">Edit</button>
        <button data-id="${s.id}" class="del bg-red-500 hover:bg-red-600 text-white px-3 py-1.5 rounded-md text-xs font-semibold transition-all hover:-translate-y-0.5 shadow">Delete</button>
      </td>
    `;
    tbody.appendChild(tr);
  });
}

// Refresh
async function refresh() {
  const students = await fetchStudents();
  updateStats(students);
  const q = searchInput.value.trim().toLowerCase();
  render(students.filter(s => s.name.toLowerCase().includes(q)));
}

// Form Submit
form.addEventListener('submit', async (e) => {
  e.preventDefault();
  try {
    const id = document.getElementById('studentId').value;
    const name = document.getElementById('name').value.trim();
    
    if (!name) {
      showToast('Please enter a student name', 'error');
      return;
    }

    const payload = {
      name,
      email: document.getElementById('email').value.trim() || null,
      age: parseInt(document.getElementById('age').value) || null
    };
    
    // Show loading state
    const submitBtn = form.querySelector('button[type="submit"]');
    const submitText = document.getElementById('submitText');
    const submitSpinner = document.getElementById('submitSpinner');
    submitBtn.disabled = true;
    submitText.classList.add('hidden');
    submitSpinner.classList.remove('hidden');
    
    let res;
    if (id) {
      res = await fetch(`${api}/${id}`, { 
        method: 'PUT', 
        headers: {'Content-Type':'application/json'}, 
        body: JSON.stringify(payload) 
      });
    } else {
      res = await fetch(api, { 
        method: 'POST', 
        headers: {'Content-Type':'application/json'}, 
        body: JSON.stringify(payload) 
      });
    }
    
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    
    form.reset();
    document.getElementById('studentId').value = '';
    showToast(id ? 'Student updated successfully!' : 'Student added successfully!', 'success');
    refresh();
  } catch (err) {
    console.error('Save student error:', err);
    showToast('Error saving student', 'error');
  } finally {
    const submitBtn = form.querySelector('button[type="submit"]');
    const submitText = document.getElementById('submitText');
    const submitSpinner = document.getElementById('submitSpinner');
    submitBtn.disabled = false;
    submitText.classList.remove('hidden');
    submitSpinner.classList.add('hidden');
  }
});

// Reset Button
resetBtn.addEventListener('click', () => { 
  form.reset(); 
  document.getElementById('studentId').value = '';
  showToast('Form cleared', 'info', 2000);
});

// Table Actions
tbody.addEventListener('click', async (e) => {
  try {
    if (e.target.classList.contains('edit')) {
      const id = e.target.dataset.id;
      const res = await fetch(`${api}/${id}`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const s = await res.json();
      document.getElementById('studentId').value = s.id;
      document.getElementById('name').value = s.name;
      document.getElementById('email').value = s.email || '';
      document.getElementById('age').value = s.age || '';
      
      // Scroll to form on mobile
      if (window.innerWidth < 1024) {
        document.querySelector('form').scrollIntoView({ behavior: 'smooth' });
      }
      
      showToast('Student loaded for editing', 'info', 2000);
    } else if (e.target.classList.contains('del')) {
      const id = e.target.dataset.id;
      if (confirm('Are you sure you want to delete this student?')) {
        e.target.disabled = true;
        e.target.textContent = '...';
        const res = await fetch(`${api}/${id}`, { method: 'DELETE' });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        showToast('Student deleted successfully!', 'success');
        refresh();
      }
    }
  } catch (err) {
    console.error('Action error:', err);
    showToast('Error performing action', 'error');
  }
});

// Search
searchInput.addEventListener('input', refresh);

// Initial Setup
initDarkMode();
refresh();



