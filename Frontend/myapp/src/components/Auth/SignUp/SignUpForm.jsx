import { LuEyeClosed } from "react-icons/lu";

export default function SignUpForm({ form, errors, showPassword, setShowPassword, handleChange, handleSubmit }) {
  return (
    <form className="form" onSubmit={handleSubmit} noValidate>
      <div className="name-row">
        <label className="label">
          <span className="label-text">First Name</span>
          <input
            name="firstName"
            value={form.firstName}
            onChange={handleChange}
            className={`input ${errors.firstName ? "input-error" : ""}`}
            placeholder="Enter your first name"
            autoComplete="given-name"
          />
          {errors.firstName && <div className="error">{errors.firstName}</div>}
        </label>

        <label className="label">
          <span className="label-text">Last Name (Optional)</span>
          <input
            name="lastName"
            value={form.lastName}
            onChange={handleChange}
            className="input"
            placeholder="Enter your last name"
            autoComplete="family-name"
          />
        </label>
      </div>

      <label className="label">
        <span className="label-text">Email</span>
        <input
          name="email"
          value={form.email}
          onChange={handleChange}
          className={`input ${errors.email ? "input-error" : ""}`}
          placeholder="name@example.com"
          type="email"
          autoComplete="email"
        />
        {errors.email && <div className="error">{errors.email}</div>}
      </label>

      <div className="name-row">
        <label className="label">
          <span className="label-text">Password</span>
          <div className="input-with-btn">
            <input
              name="password"
              value={form.password}
              onChange={handleChange}
              className={`input ${errors.password ? "input-error" : ""}`}
              type={showPassword ? "text" : "password"}
              autoComplete="new-password"
              placeholder="•••••••"
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
          {errors.password && <div className="error">{errors.password}</div>}
        </label>

        <label className="label">
          <span className="label-text">Confirm Password</span>
          <div className="input-with-btn">
            <input
              name="confirm"
              value={form.confirm}
              onChange={handleChange}
              className={`input ${errors.confirm ? "input-error" : ""}`}
              type={showPassword ? "text" : "password"}
              autoComplete="new-password"
              placeholder="•••••••"
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
          {errors.confirm && <div className="error">{errors.confirm}</div>}
        </label>
      </div>

      <label className="label">
        <span className="label-text">Job Role</span>
        <select
          name="job_role"
          value={form.job_role}
          onChange={handleChange}
          className={`input ${errors.job_role ? "input-error" : ""}`}
        >
          <option value="">Select a role</option>
          <option value="Employee">Employee</option>
          <option value="Employer">Employer</option>
          <option value="Company">Company</option>
        </select>
        {errors.job_role && <div className="error">{errors.job_role}</div>}
      </label>

      <label className="agree">
        <input type="checkbox" name="agree" checked={form.agree} onChange={handleChange} />
        <span>
          I agree to the <a href="#" className="link">Terms & Conditions</a> and{" "}
          <a href="#" className="link">Privacy Policy</a>
        </span>
      </label>
      {errors.agree && <div className="error">{errors.agree}</div>}

      <button type="submit" className="primary-btn">
        Sign Up
      </button>
    </form>
  );
}