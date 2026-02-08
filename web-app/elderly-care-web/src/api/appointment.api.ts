import axiosClient from "./axiosClient";

export interface CreateAppointmentPayload {
  doctorName: string;
  location: string;
  appointmentDate: string;
  notes?: string;
}

export const appointmentApi = {
  getAll: () =>
    axiosClient.get("/api/appointments"),

  create: (payload: CreateAppointmentPayload) =>
    axiosClient.post("/api/appointments", payload),

  update: (id: string, payload: Partial<CreateAppointmentPayload>) =>
    axiosClient.put(`/api/appointments/${id}`, payload),

  delete: (id: string) =>
    axiosClient.delete(`/api/appointments/${id}`),
};
