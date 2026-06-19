import { useMutation } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import api from '../../../core/api/axios';
import { ENDPOINTS } from '../../../core/api/endpoints';

export interface RegisterPharmacyPayload {
  pharmacy_name: string;
  phone: string;
  address: string;
  city: string;
  license_number: string;
  email: string;
  password: string;
}

export function useRegisterPharmacy() {
  const navigate = useNavigate();

  return useMutation({
    mutationFn: (payload: RegisterPharmacyPayload) =>
      api.post(ENDPOINTS.PHARMACY_REGISTER, {
        ...payload,
        latitude: 0,
        longitude: 0,
      }),
    onSuccess: () => {
      navigate('/login', {
        state: { successMessage: 'Registration submitted. Please wait for admin approval.' },
      });
    },
  });
}