export default function ForgotPasswordForm({ form, errors, handleChange, handleSubmit }) {
  return (
    <form className="form" onSubmit={handleSubmit} noValidate>
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

      <button type="submit" className="primary-btn">
        Send Email OTP
      </button>
    </form>
  );
}