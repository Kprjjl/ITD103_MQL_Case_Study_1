import {
  Card,
  CardHeader,
  CardBody,
  Typography,
  Avatar,
  Chip,
  Tooltip,
  Badge,
} from "@material-tailwind/react";
import { useEffect, useState } from "react";
import axios from "axios";

export function Tenants() {
  const [tenants, setTenants] = useState([]);

  useEffect(() => {
    const fetchTenants = async () => {
      try {
        const response = await axios.get("http://localhost:3001/users", {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });
        setTenants(response.data);
      } catch (error) {
        console.error("Error fetching tenants:", error);
      }
    };

    fetchTenants();
  }, []);

  return (
    <div className="mt-12 mb-8 flex flex-col gap-12">
      <Card>
        <CardHeader variant="gradient" color="gray" className="mb-8 p-6">
          <Typography variant="h6" color="white">
            Tenants
          </Typography>
        </CardHeader>
        <CardBody className="overflow-x-scroll px-0 pt-0 pb-2">
          <table className="w-full min-w-[640px] table-auto">
            <thead>
              <tr>
                {["tenant", "occupied room", "room payment status", "contact number", ""].map((el) => (
                  <th
                    key={el}
                    className="border-b border-blue-gray-50 py-3 px-5 text-left"
                  >
                    <Typography
                      variant="small"
                      className="text-[11px] font-bold uppercase text-blue-gray-400"
                    >
                      {el}
                    </Typography>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {tenants.map(
                ({ _id, profile_img, firstname, lastname, username, email, status, occupied_room, contact_no }, key) => {
                  const name = `${firstname} ${lastname}`;
                  const room_name = occupied_room ? occupied_room.name : 'No room';
                  const payment_status = occupied_room ? occupied_room.lease.payment_status : '-----------';
                  const PAYMENT_STATUS_COLORS = {
                    'Paid': 'green',
                    'Unpaid': 'yellow',
                    'Overdue': 'red',
                    'Cancelled': 'gray',
                    'Refunded': 'blue'
                  };
                  const className = `py-3 px-5 ${
                    key === tenants.length - 1
                      ? ""
                      : "border-b border-blue-gray-50"
                  }`;

                  return (
                    <tr key={_id}>
                      <td className={className}>
                        <div className="flex items-center gap-4">
                          <Badge placement="bottom-end" color={status === "online" ? "green" : "blue-gray"}>
                            <Tooltip key={name} content={name}>
                              <div>
                                {profile_img && (
                                    <Avatar src={profile_img} alt={name} size="sm" variant="rounded" />
                                )}
                                {!profile_img && (
                                  <i class="fa-solid fa-user"></i>
                                )}
                              </div>
                            </Tooltip>
                          </Badge>
                          <div>
                            <Typography
                              as="a"
                              href="#"
                              variant="small"
                              color="blue-gray"
                              className="font-semibold"
                              alt={name}
                            >
                              {username}
                            </Typography>
                            <Typography className="text-xs font-normal text-blue-gray-500">
                              {email}
                            </Typography>
                          </div>
                        </div>
                      </td>
                      <td className={className}>
                        <div className="flex items-center gap-2">
                          <Typography className="text-xs font-semibold text-blue-gray-600">
                            {room_name}
                          </Typography>
                        </div>
                      </td>
                      <td className={className}>
                        {occupied_room && (
                          <Chip
                            variant="gradient"
                            color={PAYMENT_STATUS_COLORS[payment_status]}
                            value={payment_status.toUpperCase()}
                            className="py-0.5 px-2 text-[11px] font-medium w-fit"
                          />
                        )}
                      </td>
                      <td className={className}>
                        <Typography className="text-xs font-semibold text-blue-gray-600">
                          {contact_no}
                        </Typography>
                      </td>
                      <td className={className}>
                        <Typography
                          as="a"
                          href="#"
                          className="text-xs font-semibold text-blue-gray-600"
                        >
                          Edit
                        </Typography>
                      </td>
                    </tr>
                  );
                }
              )}
            </tbody>
          </table>
        </CardBody>
      </Card>
    </div>
  );
}

export default Tenants;
