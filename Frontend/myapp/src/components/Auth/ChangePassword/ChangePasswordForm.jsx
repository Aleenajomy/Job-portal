import { LuEyeClosed } from "react-icons/lu";

export default function ChangePasswordForm({ form, errors, showPassword, setShowPassword, handleChange, handleSubmit }) {
  return (
    <form className="form" onSubmit={handleSubmit} noValidate>
      <label className="label">
        <span className="label-text">Current Password</span>
        <div className="input-with-btn">
          <input
            name="currentPassword"
            value={form.currentPassword}
            onChange={handleChange}
            className={`input ${errors.currentPassword ? "input-error" : ""}`}
            type={showPassword ? "text" : "password"}
            placeholder="Enter current password"
            autoComplete="current-password"
          />
          <button
            type="button"
            className="show-btn"
            onClick={() => setShowPassword((s) => !s)}
            aria-label="Toggle password"
          >
            {showPassword ? '👁' : <LuEyeClosed />}
          </button>
        </div>
        {errors.currentPassword && <div className="error">{errors.currentPassword}</div>}
      </label>

      <label className="label">
        <span className="label-text">New Password</span>
        <div className="input-with-btn">
          <input
            name="newPassword"
            value={form.newPassword}
            onChange={handleChange}
            className={`input ${errors.newPassword ? "input-error" : ""}`}
            type={showPassword ? "text" : "password"}
            placeholder="Enter new password"
            autoComplete="new-password"
          />
          <button
            type="button"
            className="show-btn"
            onClick={() => setShowPassword((s) => !s)}
            aria-label="Toggle password"
          >
            {showPassword ? '👁' : <LuEyeClosed />}
          </button>
        </div>
        {errors.newPassword && <div className="error">{errors.newPassword}</div>}
      </label>

      <label className="label">
        <span className="label-text">Confirm New Password</span>
        <div className="input-with-btn">
          <input
            name="confirmPassword"
            value={form.confirmPassword}
            onChange={handleChange}
            className={`input ${errors.confirmPassword ? "input-error" : ""}`}
            type={showPassword ? "text" : "password"}
            placeholder="Confirm new password"
            autoComplete="new-password"
          />
          <button
            type="button"
            className="show-btn"
            onClick={() => setShowPassword((s) => !s)}
            aria-label="Toggle password"
          >
            {showPassword ? '👁' : <LuEyeClosed />}
          </button>
        </div>
        {errors.confirmPassword && <div className="error">{errors.confirmPassword}</div>}
      </label>

      <button type="submit" className="primary-btn">
        Change Password
      </button>
    </form>
  );
}