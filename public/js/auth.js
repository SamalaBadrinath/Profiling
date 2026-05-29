
if (window.location.pathname.includes('admin-login')) {
  if (localStorage.getItem('token')) window.location.replace('admin-dashboard.html');
  window.addEventListener('pageshow', (e) => {
    if (e.persisted && localStorage.getItem('token')) window.location.replace('admin-dashboard.html');
  });
}

document.addEventListener('DOMContentLoaded', () => {
  const candidateLoginForm = document.querySelector('.island-login-container form');
  const adminLoginForm = document.querySelector('.island-admin-container form');
  const registerForm = document.querySelector('.island-register-form');

  if (candidateLoginForm) {
    candidateLoginForm.addEventListener('submit', handleCandidateLogin);
  }
  if (adminLoginForm) {
    adminLoginForm.addEventListener('submit', handleAdminLogin);
  }
  if (registerForm) {
    registerForm.addEventListener('submit', handleRegistration);
  }
});

async function handleCandidateLogin(event) {
  event.preventDefault();
  const identifier = document.getElementById('identifier').value;
  const password = document.getElementById('password').value;

  try {
    const response = await fetch('/auth/login/candidate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ email: identifier, password })
    });

    const text = await response.text(); let data; try { data = JSON.parse(text); } catch(e) { alert('SERVER ERROR REVEALED:\n\n' + text.substring(0, 250)); return; }
    if (response.ok) {
      localStorage.setItem('token', data.token);
      window.location.href = 'dashboard.html';
    } else {
      alert(data.error || 'Login failed');
    }
  } catch (error) {
    console.error('Error during candidate login:', error);
    alert('An error occurred. Please try again.');
  }
}

async function handleAdminLogin(event) {
  event.preventDefault();
  const password = document.getElementById('password').value;

  try {
    const response = await fetch('/auth/login/admin', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ email: 'admin@profiling.com', password })
    });

    const text = await response.text(); let data; try { data = JSON.parse(text); } catch(e) { alert('SERVER ERROR REVEALED:\n\n' + text.substring(0, 250)); return; }
    if (response.ok) {
      localStorage.setItem('token', data.token);
      window.location.href = 'admin-dashboard.html';
    } else {
      alert(data.error || 'Login failed');
    }
  } catch (error) {
    console.error('Error during admin login:', error);
    alert('An error occurred. Please try again.');
  }
}

async function handleRegistration(event) {
  event.preventDefault();
  const name = document.getElementById('name').value;
  const email = document.getElementById('email').value;
  const phone = document.getElementById('phone').value;
  const resumeFile = document.getElementById('resume').files[0];
  const category = document.getElementById('category').value;
  const password = document.getElementById('password').value;
  const confirmPassword = document.getElementById('confirm_password').value;

  if (password !== confirmPassword) {
    alert('Passwords do not match');
    return;
  }

  const formData = new FormData();
  formData.append('name', name);
  formData.append('email', email);
  formData.append('phone', phone);
  formData.append('resume', resumeFile);
  formData.append('category', category);
  formData.append('password', password);

  try {
    const response = await fetch('/candidate/register', {
      method: 'POST',
      body: formData
    });

    const text = await response.text(); let data; try { data = JSON.parse(text); } catch(e) { alert('SERVER ERROR REVEALED:\n\n' + text.substring(0, 250)); return; }
    if (response.ok) {
      alert('Registration successful!');
      window.location.href = 'index.html';
    } else {
      alert(data.error || 'Registration failed');
    }
  } catch (error) {
    console.error('Error during registration:', error);
    alert('An error occurred. Please try again.');
  }
}
