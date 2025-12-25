// contact.js - Contact form handling and validation
document.addEventListener('DOMContentLoaded', () => {
  const contactForm = document.getElementById('contactForm');

  if (contactForm) {
    // Form submission handler
    contactForm.addEventListener('submit', async (e) => {
      e.preventDefault();

      // Get form data
      const formData = new FormData(contactForm);
      const data = Object.fromEntries(formData.entries());

      // Validate form
      if (!validateForm(data)) {
        return;
      }

      // Show loading state
      const submitBtn = contactForm.querySelector('.btn-submit');
      const originalText = submitBtn.textContent;
      submitBtn.textContent = 'Sending...';
      submitBtn.disabled = true;

      try {
        // Simulate form submission (replace with actual API call)
        await submitContactForm(data);

        // Show success message
        showNotification('Thank you for your message! We\'ll get back to you within 24 hours.', 'success');

        // Reset form
        contactForm.reset();

      } catch (error) {
        console.error('Form submission error:', error);
        showNotification('Sorry, there was an error sending your message. Please try again.', 'error');
      } finally {
        // Reset button
        submitBtn.textContent = originalText;
        submitBtn.disabled = false;
      }
    });

    // Real-time validation
    const inputs = contactForm.querySelectorAll('input, textarea, select');
    inputs.forEach(input => {
      input.addEventListener('blur', () => {
        validateField(input);
      });

      input.addEventListener('input', () => {
        // Clear error state when user starts typing
        clearFieldError(input);
      });
    });
  }
});

// Form validation functions
function validateForm(data) {
  let isValid = true;

  // Required fields validation
  const requiredFields = ['firstName', 'lastName', 'email', 'subject', 'message'];

  requiredFields.forEach(field => {
    const input = document.getElementById(field);
    if (!data[field] || data[field].trim() === '') {
      showFieldError(input, `${getFieldLabel(field)} is required`);
      isValid = false;
    } else {
      clearFieldError(input);
    }
  });

  // Email validation
  if (data.email && !isValidEmail(data.email)) {
    const emailInput = document.getElementById('email');
    showFieldError(emailInput, 'Please enter a valid email address');
    isValid = false;
  }

  // Phone validation (optional)
  if (data.phone && !isValidPhone(data.phone)) {
    const phoneInput = document.getElementById('phone');
    showFieldError(phoneInput, 'Please enter a valid phone number');
    isValid = false;
  }

  return isValid;
}

function validateField(input) {
  const value = input.value.trim();
  const fieldName = input.name;

  // Clear previous errors
  clearFieldError(input);

  // Required field validation
  if (input.hasAttribute('required') && !value) {
    showFieldError(input, `${getFieldLabel(fieldName)} is required`);
    return false;
  }

  // Email validation
  if (fieldName === 'email' && value && !isValidEmail(value)) {
    showFieldError(input, 'Please enter a valid email address');
    return false;
  }

  // Phone validation
  if (fieldName === 'phone' && value && !isValidPhone(value)) {
    showFieldError(input, 'Please enter a valid phone number');
    return false;
  }

  return true;
}

function showFieldError(input, message) {
  // Remove existing error
  clearFieldError(input);

  // Add error class to input
  input.classList.add('error');

  // Create error message element
  const errorElement = document.createElement('div');
  errorElement.className = 'field-error';
  errorElement.textContent = message;

  // Insert after input
  input.parentNode.insertBefore(errorElement, input.nextSibling);
}

function clearFieldError(input) {
  input.classList.remove('error');

  // Remove error message if exists
  const errorElement = input.parentNode.querySelector('.field-error');
  if (errorElement) {
    errorElement.remove();
  }
}

function getFieldLabel(fieldName) {
  const labels = {
    firstName: 'First name',
    lastName: 'Last name',
    email: 'Email address',
    phone: 'Phone number',
    subject: 'Subject',
    message: 'Message'
  };
  return labels[fieldName] || fieldName;
}

function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

function isValidPhone(phone) {
  // Allow various phone number formats
  const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
  const cleanPhone = phone.replace(/[\s\-\(\)\.]/g, '');
  return phoneRegex.test(cleanPhone) && cleanPhone.length >= 7;
}

// Simulate form submission (replace with actual API call)
async function submitContactForm(data) {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 2000));

  // Log form data (in real implementation, send to server)
  console.log('Contact form submitted:', data);

  // Simulate random success/failure for demo
  if (Math.random() > 0.9) {
    throw new Error('Simulated submission error');
  }

  return { success: true };
}

// Notification system
function showNotification(message, type = 'info') {
  // Remove existing notifications
  const existingNotifications = document.querySelectorAll('.notification');
  existingNotifications.forEach(notification => notification.remove());

  // Create notification element
  const notification = document.createElement('div');
  notification.className = `notification notification-${type}`;

  const icon = type === 'success' ? '✓' : type === 'error' ? '✕' : 'ℹ';

  notification.innerHTML = `
    <div class="notification-content">
      <span class="notification-icon">${icon}</span>
      <span class="notification-message">${message}</span>
    </div>
    <button class="notification-close" aria-label="Close notification">×</button>
  `;

  // Add notification styles
  const style = document.createElement('style');
  style.textContent = `
    .notification {
      position: fixed;
      top: 100px;
      right: 20px;
      z-index: 1000;
      min-width: 300px;
      max-width: 500px;
      padding: 0;
      border-radius: 12px;
      box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
      backdrop-filter: blur(10px);
      animation: slideInRight 0.3s ease-out;
    }

    .notification-success {
      background: linear-gradient(135deg, rgba(104, 211, 145, 0.9), rgba(72, 187, 120, 0.9));
      border: 1px solid rgba(104, 211, 145, 0.3);
    }

    .notification-error {
      background: linear-gradient(135deg, rgba(229, 62, 62, 0.9), rgba(197, 48, 48, 0.9));
      border: 1px solid rgba(229, 62, 62, 0.3);
    }

    .notification-content {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 16px 20px;
    }

    .notification-icon {
      font-size: 20px;
      font-weight: bold;
      color: white;
    }

    .notification-message {
      color: white;
      font-size: 14px;
      line-height: 1.4;
      flex: 1;
    }

    .notification-close {
      background: none;
      border: none;
      color: white;
      font-size: 20px;
      cursor: pointer;
      padding: 0;
      margin-left: 12px;
      opacity: 0.8;
      transition: opacity 0.2s ease;
    }

    .notification-close:hover {
      opacity: 1;
    }

    @keyframes slideInRight {
      from {
        transform: translateX(100%);
        opacity: 0;
      }
      to {
        transform: translateX(0);
        opacity: 1;
      }
    }

    .notification.fade-out {
      animation: slideOutRight 0.3s ease-in forwards;
    }

    @keyframes slideOutRight {
      from {
        transform: translateX(0);
        opacity: 1;
      }
      to {
        transform: translateX(100%);
        opacity: 0;
      }
    }
  `;

  document.head.appendChild(style);
  document.body.appendChild(notification);

  // Add close functionality
  const closeBtn = notification.querySelector('.notification-close');
  closeBtn.addEventListener('click', () => {
    notification.classList.add('fade-out');
    setTimeout(() => {
      if (notification.parentNode) {
        notification.remove();
      }
    }, 300);
  });

  // Auto-hide after 5 seconds
  setTimeout(() => {
    if (notification.parentNode) {
      notification.classList.add('fade-out');
      setTimeout(() => {
        if (notification.parentNode) {
          notification.remove();
        }
      }, 300);
    }
  }, 5000);
}
