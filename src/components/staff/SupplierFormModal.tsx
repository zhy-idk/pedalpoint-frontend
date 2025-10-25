import React, { useState, useEffect } from 'react';
import { X, Save, AlertCircle } from 'lucide-react';
import { useSuppliers, type Supplier } from '../../hooks/useSuppliers';

interface SupplierFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (supplier: Supplier) => void;
  editingSupplier?: Supplier | null;
}

export const SupplierFormModal: React.FC<SupplierFormModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  editingSupplier = null,
}) => {
  const { createSupplier, updateSupplier } = useSuppliers();
  const [formData, setFormData] = useState({
    name: '',
    contact: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Populate form when editing
  useEffect(() => {
    if (editingSupplier && isOpen) {
      setFormData({
        name: editingSupplier.name,
        contact: editingSupplier.contact || '',
      });
    } else if (!editingSupplier && isOpen) {
      setFormData({
        name: '',
        contact: '',
      });
    }
  }, [editingSupplier, isOpen]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
    // Clear error when user starts typing
    if (error) setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      setError('Supplier name is required');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      let result: Supplier | null = null;
      
      if (editingSupplier) {
        // Update existing supplier
        result = await updateSupplier(editingSupplier.id, {
          name: formData.name.trim(),
          contact: formData.contact.trim() || undefined,
        });
      } else {
        // Create new supplier
        result = await createSupplier({
          name: formData.name.trim(),
          contact: formData.contact.trim() || undefined,
        });
      }

      if (result) {
        // Reset form
        setFormData({ name: '', contact: '' });
        onSuccess?.(result);
        onClose();
      }
    } catch (err) {
      console.error(`Error ${editingSupplier ? 'updating' : 'creating'} supplier:`, err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      setFormData({ name: '', contact: '' });
      setError(null);
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-base-100 rounded-lg shadow-xl w-full max-w-md mx-4">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-base-300">
          <h2 className="text-xl font-semibold">
            {editingSupplier ? 'Edit Supplier' : 'Add New Supplier'}
          </h2>
          <button
            onClick={handleClose}
            disabled={isSubmitting}
            className="btn btn-ghost btn-sm btn-circle"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6">
          {/* Error Display */}
          {error && (
            <div className="alert alert-error mb-4">
              <AlertCircle className="h-4 w-4" />
              <span className="text-sm">{error}</span>
            </div>
          )}

          {/* Supplier Name */}
          <div className="form-control mb-4">
            <label className="label">
              <span className="label-text font-medium">
                Supplier Name <span className="text-error">*</span>
              </span>
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              placeholder="Enter supplier name"
              className="input input-bordered w-full"
              disabled={isSubmitting}
              required
            />
          </div>

          {/* Contact Information */}
          <div className="form-control mb-6">
            <label className="label">
              <span className="label-text font-medium">Contact Information</span>
            </label>
            <textarea
              name="contact"
              value={formData.contact}
              onChange={handleInputChange}
              placeholder="Phone number, email, or other contact details"
              className="textarea textarea-bordered w-full h-20 resize-none"
              disabled={isSubmitting}
            />
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 justify-end">
            <button
              type="button"
              onClick={handleClose}
              disabled={isSubmitting}
              className="btn btn-outline"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !formData.name.trim()}
              className="btn btn-primary gap-2"
            >
              {isSubmitting ? (
                <>
                  <span className="loading loading-spinner loading-sm"></span>
                  {editingSupplier ? 'Updating...' : 'Creating...'}
                </>
              ) : (
                <>
                  <Save className="h-4 w-4" />
                  {editingSupplier ? 'Update Supplier' : 'Create Supplier'}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
