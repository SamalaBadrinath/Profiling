document.addEventListener('DOMContentLoaded', () => {
  const token = localStorage.getItem('token');
  if (!token) {
    window.location.href = 'index.html';
    return;
  }

  loadProfile(token);

  const logoutBtn = document.querySelector('.island-logout-btn');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', logout);
  }

  const deleteBtn = document.querySelector('.island-delete-btn');
  if (deleteBtn) {
    deleteBtn.addEventListener('click', deleteAccount);
  }

  const resetForm = document.querySelector('.island-reset-form');
  if (resetForm) {
    resetForm.addEventListener('submit', (e) => resetPassword(e, token));
  }
});

async function loadProfile(token) {
  try {
    const response = await fetch('/candidate/profile', {
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
      throw new Error('Failed to load profile');
    }

    const candidate = await response.json();
    
    document.getElementById('profile-name').textContent = candidate.name || '';
    document.getElementById('profile-email').textContent = candidate.email || '';
    document.getElementById('profile-phone').textContent = candidate.phone || 'N/A';
    
    const resumeLink = document.getElementById('profile-resume-link');
    if (resumeLink) {
      if (candidate.resume_url) {
        resumeLink.href = candidate.resume_url;
        resumeLink.textContent = 'View Resume PDF';
        resumeLink.style.display = 'inline-block';
      } else {
        resumeLink.removeAttribute('href');
        resumeLink.textContent = 'No Resume Uploaded';
      }
    }
  } catch (error) {
    console.error('Error loading profile:', error);
    alert('Error loading profile information.');
  }
}

function logout() {
  localStorage.removeItem('token');
  window.location.href = 'index.html';
}

async function deleteAccount() {
  if (!confirm('Are you absolutely sure you want to permanently delete your account? This action cannot be undone.')) {
    return;
  }

  const token = localStorage.getItem('token');
  try {
    const response = await fetch('/candidate/profile/delete', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (response.ok) {
      alert('Your account has been deleted.');
      logout();
    } else {
      const data = await response.json();
      alert(data.error || 'Failed to delete account.');
    }
  } catch (error) {
    console.error('Error deleting account:', error);
    alert('An error occurred while deleting your account.');
  }
}

async function resetPassword(event, token) {
  event.preventDefault();
  const oldPassword = document.getElementById('old-password').value;
  const newPassword = document.getElementById('new-password').value;

  try {
    const response = await fetch('/candidate/profile/reset-password', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ oldPassword, newPassword })
    });

    const data = await response.json();
    if (response.ok) {
      alert('Password reset successfully!');
      document.querySelector('.island-reset-form').reset();
    } else {
      alert(data.error || 'Password reset failed.');
    }
  } catch (error) {
    console.error('Error resetting password:', error);
    alert('An error occurred during password reset.');
  }
}
