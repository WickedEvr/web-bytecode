import { useState, useEffect } from 'react';
import { apiRequest } from '../../../lib/api';
import { useToastStore } from '../../../stores/toastStore';
import { Users, Trash2, Building2 } from 'lucide-react';
import { ConfirmModal } from '../../ui/ConfirmModal';

interface Contact {
  customer_id: string;
  first_name: string;
  last_name: string;
  display_name: string;
  primary_email: string;
  position_title: string;
  created_at: string;
}

interface OrganizationContactsModalProps {
  isOpen: boolean;
  onClose: () => void;
  organization: any;
}

export default function OrganizationContactsModal({ isOpen, onClose, organization }: OrganizationContactsModalProps) {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [contactToRemove, setContactToRemove] = useState<Contact | null>(null);
  const addToast = useToastStore((state) => state.addToast);

  useEffect(() => {
    if (isOpen && organization) {
      fetchContacts();
    } else {
      setContacts([]);
    }
  }, [isOpen, organization]);

  const fetchContacts = async () => {
    try {
      setIsLoading(true);
      const data = await apiRequest<Contact[]>(`/admin/organizations/${organization.id}/customers`);
      setContacts(data);
    } catch (err) {
      addToast('Error al cargar contactos de la empresa', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRemove = async () => {
    if (!contactToRemove || !organization) return;
    try {
      await apiRequest(`/admin/organizations/${organization.id}/customers/${contactToRemove.customer_id}`, {
        method: 'DELETE'
      });
      addToast('Contacto desvinculado exitosamente', 'success');
      setContactToRemove(null);
      fetchContacts();
    } catch (err) {
      addToast('Error al desvincular contacto', 'error');
    }
  };

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 bg-black bg-opacity-50 z-40 flex justify-center items-center p-4">
        <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col">
          
          <div className="flex justify-between items-center p-6 border-b border-gray-200">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                <Users className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-gray-900">Contactos Vinculados</h2>
                <p className="text-sm text-gray-500">Empresa: {organization?.trade_name || organization?.legal_name}</p>
              </div>
            </div>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
              <span className="sr-only">Cerrar</span>
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div className="p-6 overflow-y-auto flex-1">
            {isLoading ? (
              <div className="flex justify-center items-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              </div>
            ) : contacts.length === 0 ? (
              <div className="text-center py-12 text-gray-500 flex flex-col items-center">
                <Building2 className="w-12 h-12 mb-3 text-gray-300" />
                <p>No hay contactos vinculados a esta empresa.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {contacts.map((contact) => (
                  <div key={contact.customer_id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-100">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {contact.display_name || `${contact.first_name} ${contact.last_name}`}
                      </p>
                      <p className="text-sm text-gray-500 truncate flex items-center gap-2 mt-1">
                        <span className="font-medium text-gray-700">{contact.position_title || 'Sin cargo'}</span>
                        <span className="text-gray-300">•</span>
                        <span>{contact.primary_email}</span>
                      </p>
                    </div>
                    <div className="ml-4 flex-shrink-0">
                      <button
                        onClick={() => setContactToRemove(contact)}
                        className="text-red-600 hover:text-red-900 bg-red-50 hover:bg-red-100 p-2 rounded-md transition-colors"
                        title="Desvincular contacto"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>
      </div>

      <ConfirmModal
        isOpen={!!contactToRemove}
        onCancel={() => setContactToRemove(null)}
        onConfirm={handleRemove}
        title="Desvincular Contacto"
        message={`¿Estás seguro que deseas desvincular a "${contactToRemove?.display_name || contactToRemove?.first_name}" de esta empresa?`}
        confirmText="Desvincular"
        type="danger"
      />
    </>
  );
}
