import axiosClient from "./axiosClient";
import { appointmentMockService } from "./appointment.mock";

export interface CreateAppointmentPayload {
  doctorName: string;
  location: string;
  appointmentDate: string;
  notes?: string;
  appointmentType?: string;
  specialty?: string;
  duration?: number;
  isTelehealth?: boolean;
  transportationNotes?: string;
  preparationInstructions?: string;
}

export const appointmentApi = {
  getAll: () =>
    import.meta.env.DEV ? appointmentMockService.getAll() : axiosClient.get("/api/appointments"),

  create: (payload: CreateAppointmentPayload) =>
    import.meta.env.DEV ? appointmentMockService.create(payload) : axiosClient.post("/api/appointments", payload),

  update: (id: string, payload: Partial<CreateAppointmentPayload>) =>
    import.meta.env.DEV ? appointmentMockService.update(id, payload) : axiosClient.put(`/api/appointments/${id}`, payload),

  delete: (id: string) =>
    import.meta.env.DEV ? appointmentMockService.delete(id) : axiosClient.delete(`/api/appointments/${id}`),
};
