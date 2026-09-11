import { apiClient } from './apiClient'
export type WorkshopDashboard={todayAppointments:number;todayWalkIns:number;vehiclesInService:number;waitingForApproval:number;readyForPickup:number;highPriorityCases:number;completedCases:number}
export type CustomerDashboard={vehicles:number;activeServices:number;unreadNotifications:number}
export type Notification={notificationId:string;title:string;message:string;read:boolean;createdAt:string}
export const dashboardService={workshop:()=>apiClient.get<WorkshopDashboard>('/dashboard/workshop'),customer:()=>apiClient.get<CustomerDashboard>('/dashboard/customer'),notifications:()=>apiClient.get<Notification[]>('/notifications'),read:(id:string)=>apiClient.patch(`/notifications/${id}/read`),readAll:()=>apiClient.patch('/notifications/read-all')}
