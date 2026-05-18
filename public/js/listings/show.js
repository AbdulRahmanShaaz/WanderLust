const deleteForm = document.querySelector('[data-delete-form]');
const deleteModal = document.querySelector('[data-delete-modal]');
const cancelDeleteButton = document.querySelector('[data-cancel-delete]');
const confirmDeleteButton = document.querySelector('[data-confirm-delete]');

if (deleteForm && deleteModal && cancelDeleteButton && confirmDeleteButton) {
  const closeModal = () => {
    deleteModal.hidden = true;
  };

  deleteForm.addEventListener('submit', (event) => {
    event.preventDefault();
    deleteModal.hidden = false;
    confirmDeleteButton.focus();
  });

  cancelDeleteButton.addEventListener('click', closeModal);

  deleteModal.addEventListener('click', (event) => {
    if (event.target === deleteModal) {
      closeModal();
    }
  });

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && !deleteModal.hidden) {
      closeModal();
    }
  });

  confirmDeleteButton.addEventListener('click', () => {
    deleteForm.submit();
  });
}
