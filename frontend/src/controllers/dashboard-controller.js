import {
  BanknotesIcon,
  UserPlusIcon,
  UsersIcon,
  ChartBarIcon,
  KeyIcon,
} from "@heroicons/react/24/solid";
import { 
  fetchRegistrations,
  fetchTenants,
  fetchRooms,
  fetchSalesStatistics,
  fetchRoomPaymentStatusCounts,
  fetchPaymentsPerMonth,
  fetchPaymentsPerYear,
} from "@/data";
import { chartsConfig } from "@/configs";

export const getStatisticsCardsData = async () => {
  const registrations = await fetchRegistrations();
  const tenants = await fetchTenants();
  const rooms = await fetchRooms();
  const salesStatistics = await fetchSalesStatistics();

  const num_online_tenants = tenants.filter(tenant => tenant.status === 'online').length;
  const num_pending_registrations = registrations.filter(registration => registration.status === 'pending').length;
  const occupancy_percentage = rooms.filter(room => (room.tenants && room.tenants.length > 0)).length / rooms.length * 100;
  const salesYearComparisonPercentage = (salesStatistics.thisYear - salesStatistics.lastYear) / salesStatistics.lastYear * 100;

  return [
    {
      color: "gray",
      icon: UsersIcon,
      title: "No. of Tenants",
      value: tenants.length,
      footer: {
        color: num_online_tenants > 0 ? "text-green-500" : "text-blue-gray-500",
        value: num_online_tenants,
        label: "currently online",
      },
    },
    {
      color: "gray",
      icon: UserPlusIcon,
      title: "Registrations",
      value: registrations.length,
      footer: {
        color: num_pending_registrations > 0 ? "text-red-500" : "text-green-500",
        value: num_pending_registrations,
        label: "pending approval",
      },
    },
    {
      color: "gray",
      icon: KeyIcon,
      title: "No. of Rooms",
      value: rooms.length,
      footer: {
        color: occupancy_percentage >= 50 ? "text-green-500" : "text-red-500",
        value: `${occupancy_percentage}%`,
        label: "occupancy rate",
      },
    },
    {
      color: "gray",
      icon: ChartBarIcon,
      title: "Sales",
      value: `₱${salesStatistics.thisYear}`,
      footer: {
        color: salesYearComparisonPercentage > 0 ? "text-green-500" : "text-red-500",
        value: salesStatistics.lastYear != 0 ? `${salesYearComparisonPercentage > 0 ? "+" : ""}${salesYearComparisonPercentage}%` : "",
        label: salesStatistics.lastYear != 0 ? "than than last year" : "earned this year",
      },
    },
  ];
};

export const getRoomPaymentStatusPieChartData = async () => {
  const roomPaymentStatusCounts = await fetchRoomPaymentStatusCounts();

  return {
    labels: ["Paid", "Unpaid", "Partially Paid", "Overdue"],
    data: [
      roomPaymentStatusCounts.paid,
      roomPaymentStatusCounts.unpaid,
      roomPaymentStatusCounts.partiallyPaid,
      roomPaymentStatusCounts.overdue,
    ],
    colors: ["#10B981", "#6B7280", "#F59E0B", "#EF4444"],
  };
};

export const getPaymentsChartData = async () => {
  const paymentsPerMonth = await fetchPaymentsPerMonth();
  const paymentsPerYear = await fetchPaymentsPerYear();

  const monthLabels = [
    'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
  ];
  
  const currentYear = new Date().getFullYear();
  const yearLabels = Array.from({ length: 5 }, (_, index) => currentYear - 4 + index);

  return {
    perMonth: {
      labels: monthLabels,
      data: paymentsPerMonth,
      title: "Payments Per Month",
    },
    perYear: {
      labels: yearLabels,
      data: paymentsPerYear,
      title: "Payments Per Year",
    }
  };
};

