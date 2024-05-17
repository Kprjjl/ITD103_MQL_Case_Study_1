import {
  HomeIcon,
  UserCircleIcon,
  TableCellsIcon,
  InformationCircleIcon,
  WrenchScrewdriverIcon,
  KeyIcon,
  UserGroupIcon,
  DocumentMagnifyingGlassIcon,
  ServerStackIcon,
  RectangleStackIcon,
  WalletIcon,
} from "@heroicons/react/24/solid";
import { Home, Profile, Tables, Notifications, Rooms, Tenants, Registrations, Payments } from "@/pages/dashboard";
import { SignIn, SignUp } from "@/pages/auth";

const icon = {
  className: "w-5 h-5 text-inherit",
};

export const routes = [
  {
    layout: "dashboard",
    pages: [
      {
        icon: <HomeIcon {...icon} />,
        name: "dashboard",
        path: "/home",
        element: <Home />,
      },
      {
        icon: <UserCircleIcon {...icon} />,
        name: "profile",
        path: "/profile",
        element: <Profile />,
      },
      // {
      //   icon: <WrenchScrewdriverIcon {...icon} />,
      //   name: "maintenance",
      //   path: "/maintenance",
      //   // element: <Maintenance />,
      // },
    ],
  },
  {
    title: "management",
    layout: "dashboard",
    pages: [
      {
        icon: <KeyIcon {...icon} />,
        name: "Rooms",
        path: "/rooms",
        element: <Rooms />,
      },
      {
        icon: <UserGroupIcon {...icon} />,
        name: "Tenants",
        path: "/tenants",
        element: <Tenants />,
      },
      {
        icon: <WalletIcon {...icon} />,
        name: "Payments",
        path: "/payments",
        element: <Payments />,
      },
      {
        icon: <DocumentMagnifyingGlassIcon {...icon} />,
        name: "Registrations",
        path: "/registrations",
        element: <Registrations />,
      },
      {
        icon: <TableCellsIcon {...icon} />,
        name: "tables",
        path: "/tables",
        element: <Tables />,
      },
    ],
  },
  {
    title: "auth pages",
    layout: "auth",
    pages: [
      {
        icon: <ServerStackIcon {...icon} />,
        name: "sign in",
        path: "/sign-in",
        element: <SignIn />,
      },
      {
        icon: <RectangleStackIcon {...icon} />,
        name: "sign up",
        path: "/sign-up",
        element: <SignUp />,
      },
    ],
    hidden: true,
  },
];

export default routes;
