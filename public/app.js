const api = '/api/students';
const tbody = document.querySelector('#studentsTable tbody');
const form = document.getElementById('studentForm');
const resetBtn = document.getElementById('resetBtn');
const searchInput = document.getElementById('search');

// Create notification element
function showNotification(message, type = 'success') {
  const notification = document.createElement('div');
  const bgColor = type === 'success' ? 'bg-green-500' : 'bg-red-500';
  const icon = type === 'success' ? '✓' : '✕';
  
  notification.className = `fixed top-4 right-4 ${bgColor} text-white px-6 py-3 rounded-lg shadow-lg z-50 animate-pulse`;
  notification.textContent = `${icon} ${message}`;
  document.body.appendChild(notification);
  
  setTimeout(() => notification.remove(), 3000);
}

async function fetchStudents() {
  try {
    console.log('Fetching students...');
    const res = await fetch(api);
    if (!res.ok) {
      const errorData = await res.json();
      throw new Error(errorData.error || `HTTP ${res.status}`);
    }
    const data = await res.json();
    console.log('Fetched students:', data);
    return data;
  } catch (err) {
    console.error('Fetch students error:', err);
    showNotification('Error loading students', 'error');
    return [];
  }
}

function render(students) {
  tbody.innerHTML = '';
  if (!students || students.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="5" class="px-6 py-12 text-center text-slate-500">
          <svg class="w-12 h-12 mx-auto mb-2 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 8.646 4 4 0 010-8.646M9 6H5a2 2 0 00-2 2v12a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-4m-6 8a3 3 0 11-6 0 3 3 0 016 0z"></path>
          </svg>
          No students found
        </td>
      </tr>
    `;
    return;
  }
  
  students.forEach(s => {
    const tr = document.createElement('tr');
    tr.className = 'hover:bg-blue-50 transition-colors';
    tr.innerHTML = `
      <td class="px-6 py-4 text-sm font-medium text-slate-900">${s.id}</td>
      <td class="px-6 py-4 text-sm font-medium text-slate-900">${s.name}</td>
      <td class="px-6 py-4 text-sm text-slate-600">${s.email || '-'}</td>
      <td class="px-6 py-4 text-sm text-slate-600">${s.age || '-'}</td>
      <td class="px-6 py-4 text-sm space-x-2 flex">
        <button data-id="${s.id}" class="edit bg-blue-500 hover:bg-blue-600 text-white px-3 py-1.5 rounded-md text-xs font-semibold transition-all hover:-translate-y-0.5 shadow">Edit</button>
        <button data-id="${s.id}" class="del bg-red-500 hover:bg-red-600 text-white px-3 py-1.5 rounded-md text-xs font-semibold transition-all hover:-translate-y-0.5 shadow">Delete</button>
      </td>
    `;
    tbody.appendChild(tr);
  });
}

async function refresh() {
  const students = await fetchStudents();
  const q = searchInput.value.trim().toLowerCase();
  render(students.filter(s => s.name.toLowerCase().includes(q)));
}

form.addEventListener('submit', async (e) => {
  e.preventDefault();
  try {
    const id = document.getElementById('studentId').value;
    const name = document.getElementById('name').value.trim();
    const email = document.getElementById('email').value.trim();
    const age = document.getElementById('age').value.trim();
    
    if (!name) {
      showNotification('Name is required', 'error');
      return;
    }
    
    const payload = {
      name,
      email: email || null,
      age: age ? parseInt(age) : null
    };
    
    console.log('Submitting:', { id, payload });
    
    let res;
    if (id) {
      console.log('Updating student ID:', id);
      res = await fetch(`${api}/${id}`, { 
        method: 'PUT', 
        headers: {'Content-Type':'application/json'}, 
        body: JSON.stringify(payload) 
      });
    } else {
      console.log('Creating new student');
      res = await fetch(api, { 
        method: 'POST', 
        headers: {'Content-Type':'application/json'}, 
        body: JSON.stringify(payload) 
      });
    }
    
    const responseData = await res.json();
    console.log('Response:', responseData);
    
    if (!res.ok) {
      throw new Error(responseData.error || `HTTP ${res.status}`);
    }
    
    showNotification(id ? 'Student updated successfully!' : 'Student added successfully!', 'success');
    
    form.reset();
    document.getElementById('studentId').value = '';
    await refresh();
    
    // Success feedback
    const submitBtn = form.querySelector('button[type="submit"]');
    const originalText = submitBtn.textContent;
    submitBtn.textContent = '✓ Saved!';
    submitBtn.classList.add('bg-green-500', 'from-green-500', 'to-green-600');
    setTimeout(() => {
      submitBtn.textContent = originalText;
      submitBtn.classList.remove('bg-green-500', 'from-green-500', 'to-green-600');
    }, 2000);
  } catch (err) {
    console.error('Save student error:', err);
    showNotification(`Error: ${err.message}`, 'error');
  }
});

resetBtn.addEventListener('click', () => { 
  form.reset(); 
  document.getElementById('studentId').value = ''; 
});

tbody.addEventListener('click', async (e) => {
  try {
    if (e.target.classList.contains('edit')) {
      const id = e.target.dataset.id;
      console.log('Fetching student ID:', id);
      const res = await fetch(`${api}/${id}`);
      const s = await res.json();
      
      if (!res.ok) {
        throw new Error(s.error || `HTTP ${res.status}`);
      }
      
      console.log('Loaded student:', s);
      document.getElementById('studentId').value = s.id;
      document.getElementById('name').value = s.name;
      document.getElementById('email').value = s.email || '';
      document.getElementById('age').value = s.age || '';
      
      // Scroll to form on mobile
      if (window.innerWidth < 1024) {
        document.querySelector('form').scrollIntoView({ behavior: 'smooth' });
      }
      
      showNotification('Student loaded for editing', 'success');
    } else if (e.target.classList.contains('del')) {
      const id = e.target.dataset.id;
      if (confirm('Delete student #' + id + '?')) {
        console.log('Deleting student ID:', id);
        const res = await fetch(`${api}/${id}`, { method: 'DELETE' });
        const data = await res.json();
        
        if (!res.ok) {
          throw new Error(data.error || `HTTP ${res.status}`);
        }
        
        console.log('Student deleted');
        showNotification('Student deleted successfully!', 'success');
        await refresh();
      }
    }
  } catch (err) {
    console.error('Action error:', err);
    showNotification(`Error: ${err.message}`, 'error');
  }
});

searchInput.addEventListener('input', refresh);

// Initial load
console.log('App initialized');
