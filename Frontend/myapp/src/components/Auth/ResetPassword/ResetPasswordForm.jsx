import { LuEyeClosed } from "react-icons/lu";

export default function ResetPasswordForm({ form, errors, showPassword, setShowPassword, handleChange, handleSubmit }) {
  return (
    <form className="form" onSubmit={handleSubmit} noValidate>
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
        Reset Password
      </button>
    </form>
  );
}