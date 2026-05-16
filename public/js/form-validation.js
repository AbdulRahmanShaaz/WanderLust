const forms = document.querySelectorAll('.validated-form');

const getInvalidText = (field) => {
  if (field.validity.valueMissing) return 'This field is required.';
  if (field.validity.tooShort) {
    return `Please enter at least ${field.minLength} characters.`;
  }
  if (field.validity.rangeUnderflow) {
    return `Value must be at least ${field.min}.`;
  }
  if (field.validity.typeMismatch) return 'Please enter a valid URL.';
  return 'Please check this field.';
};

const updateFieldState = (field, showEmptySuccess = false) => {
  const message = field.closest('label')?.querySelector('.validation-message');
  if (!message) return field.checkValidity();

  const hasValue = field.value.trim() !== '';
  const isOptionalAndEmpty = !field.required && !hasValue;

  field.classList.remove('is-valid', 'is-invalid');
  message.classList.remove('is-success', 'is-error');

  if (isOptionalAndEmpty && !showEmptySuccess) {
    message.textContent = '';
    return true;
  }

  if (field.checkValidity()) {
    field.classList.add('is-valid');
    message.classList.add('is-success');
    message.textContent = field.dataset.validText || 'Looks good.';
    return true;
  }

  field.classList.add('is-invalid');
  message.classList.add('is-error');
  message.textContent = getInvalidText(field);
  return false;
};

forms.forEach((form) => {
  const fields = form.querySelectorAll('input, textarea');

  fields.forEach((field) => {
    field.addEventListener('input', () => updateFieldState(field));
    field.addEventListener('blur', () => updateFieldState(field));
  });

  form.addEventListener('submit', (event) => {
    const fieldStates = [...fields].map((field) => updateFieldState(field, true));
    const isValid = fieldStates.every(Boolean);

    if (!isValid) {
      event.preventDefault();
      form.querySelector('.is-invalid')?.focus();
    }
  });
});
