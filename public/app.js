const api = '/api/students';
const tbody = document.querySelector('#studentsTable tbody');
const form = document.getElementById('studentForm');
const resetBtn = document.getElementById('resetBtn');
const searchInput = document.getElementById('search');

async function fetchStudents() {
  try {
    const res = await fetch(api);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return res.json();
  } catch (err) {
    console.error('Fetch students error:', err);
    alert('Error loading students. Check console.');
    return [];
  }
}

function render(students) {
  tbody.innerHTML = '';
  if (!students || students.length === 0) {
    tbody.innerHTML = '<tr><td colspan="5" style="text-align:center">No students found</td></tr>';
    return;
  }
  students.forEach(s => {
    const tr = document.createElement('tr');
    tr.innerHTML = `<td>${s.id}</td><td>${s.name}</td><td>${s.email||''}</td><td>${s.age||''}</td>
      <td>
        <button data-id="${s.id}" class="edit">Edit</button>
        <button data-id="${s.id}" class="del">Delete</button>
      </td>`;
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
    const payload = {
      name: document.getElementById('name').value,
      email: document.getElementById('email').value,
      age: parseInt(document.getElementById('age').value) || null
    };
    
    let res;
    if (id) {
      res = await fetch(`${api}/${id}`, { method: 'PUT', headers: {'Content-Type':'application/json'}, body: JSON.stringify(payload) });
    } else {
      res = await fetch(api, { method: 'POST', headers: {'Content-Type':'application/json'}, body: JSON.stringify(payload) });
    }
    
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    
    form.reset();
    document.getElementById('studentId').value = '';
    refresh();
  } catch (err) {
    console.error('Save student error:', err);
    alert('Error saving student');
  }
});

resetBtn.addEventListener('click', () => { form.reset(); document.getElementById('studentId').value = ''; });

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
    } else if (e.target.classList.contains('del')) {
      const id = e.target.dataset.id;
      if (confirm('Delete student #' + id + '?')) {
        const res = await fetch(`${api}/${id}`, { method: 'DELETE' });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        refresh();
      }
    }
  } catch (err) {
    console.error('Action error:', err);
    alert('Error performing action');
  }
});

searchInput.addEventListener('input', refresh);

refresh();

