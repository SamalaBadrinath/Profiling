document.addEventListener('DOMContentLoaded', () => {
  const token = localStorage.getItem('token');
  if (!token) {
    window.location.href = 'admin-login.html';
    return;
  }

  loadCandidates(token);
});

async function loadCandidates(token) {
  try {
    const response = await fetch('/admin/candidates', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (!response.ok) {
      if (response.status === 401 || response.status === 403) {
        logout();
        return;
      }
      throw new Error('Failed to fetch candidate list');
    }

    const candidates = await response.json();
    const tbody = document.querySelector('.island-candidates-table tbody');
    if (tbody) {
      tbody.innerHTML = '';
      
      candidates.forEach((candidate, index) => {
        const tr = document.createElement('tr');
        
        // S.No
        const tdNo = document.createElement('td');
        tdNo.textContent = index + 1;
        tr.appendChild(tdNo);

        // Name
        const tdName = document.createElement('td');
        tdName.textContent = candidate.name || '';
        tr.appendChild(tdName);

        // Email
        const tdEmail = document.createElement('td');
        tdEmail.textContent = candidate.email || '';
        tr.appendChild(tdEmail);

        // Phone Number
        const tdPhone = document.createElement('td');
        tdPhone.textContent = candidate.phone || 'N/A';
        tr.appendChild(tdPhone);

        // Resume Link
        const tdResume = document.createElement('td');
        const aResume = document.createElement('a');
        aResume.className = 'island-resume-link';
        aResume.textContent = 'View File';
        if (candidate.resume_url) {
          aResume.href = candidate.resume_url;
          aResume.target = '_blank';
        } else {
          aResume.removeAttribute('href');
          aResume.textContent = 'No File';
          aResume.style.opacity = '0.5';
          aResume.style.cursor = 'default';
        }
        tdResume.appendChild(aResume);
        tr.appendChild(tdResume);

        // Category
        const tdCategory = document.createElement('td');
        tdCategory.textContent = candidate.category || 'N/A';
        tr.appendChild(tdCategory);

        tbody.appendChild(tr);
      });
    }
  } catch (error) {
    console.error('Error loading candidates:', error);
    alert('Error fetching candidate records.');
  }
}

function logout() {
  localStorage.removeItem('token');
  window.location.href = 'admin-login.html';
}
