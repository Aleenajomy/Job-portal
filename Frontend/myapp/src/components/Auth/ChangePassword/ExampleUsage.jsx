import { useState } from 'react';
import ChangePasswordModal from './ChangePasswordModal';

// Example usage component
export default function ExampleUsage() {
  const [showModal, setShowModal] = useState(false);

  const handleChangePassword = async (formData) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/accounts/change-password/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          current_password: formData.currentPassword,
          new_password: formData.newPassword,
          confirm_password: formData.confirmPassword
        })
      });
      
      if (response.ok) {
        alert('Password changed successfully!');
        return Promise.resolve();
      } else {
        const errorData = await response.json();
        let errorMessage = 'Password change failed. Please try again.';
        if (errorData.message && typeof errorData.message === 'string') {
          errorMessage = errorData.message;
        } else if (errorData.detail) {
          errorMessage = errorData.detail;
        }
        throw new Error(errorMessage);
      }
    } catch (error) {
      throw new Error(error.message || 'Password change failed. Please try again.');
    }
  };

  return (
    <div>
      <button onClick={() => setShowModal(true)}>
        Change Password
      </button>
      
      <ChangePasswordModal 
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        onSubmit={handleChangePassword}
      />
    </div>
  );
}