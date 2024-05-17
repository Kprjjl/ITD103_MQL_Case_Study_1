import {
  Card,
  CardHeader,
  CardBody,
  Typography,
  Avatar,
  Chip,
  Tooltip,
  Badge,

  Menu,
  MenuHandler,
  MenuList,
  MenuItem,
  Input,
  IconButton
} from "@material-tailwind/react";
import { useEffect, useState } from "react";
import axios from "axios";
import { fetchTenants, fetchRooms } from "@/data";

export function Tenants() {
  const [tenants, setTenants] = useState([]);
  const [roomSearch, setRoomSearch] = useState('');
  const [rooms, setRooms] = useState([]);

  useEffect(() => {
    fetchTenants().then((data) => {
      setTenants(data);
    });

    fetchRooms().then((data) => {
      setRooms(data);
    });
  }, []);

  const handleRoomChoice = (tenantId, roomId) => {
    try{
      axios.put(`http://localhost:3001/users/${tenantId}/room`, {
        roomId: roomId
      }, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      setTenants(tenants.map(tenant => {
        if (tenant._id === tenantId) {
          tenant.occupied_room = roomId;
        }
        return tenant;
      }));
    } catch (error) {
      console.error('Error updating tenant room:', error);
    }
  };

  const deleteTenant = async (tenantId) => {
    try {
      await axios.delete(`http://localhost:3001/users/${tenantId}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      setTenants(tenants.filter(({ _id }) => _id !== tenantId));
    }
    catch (error) {
      console.error('Error deleting tenant:', error);
    }
  };

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
                  const tenant_id = _id;
                  const name = `${firstname} ${lastname}`;
                  const room_name = occupied_room ? occupied_room.name : 'No room';
                  const payment_status = (occupied_room && occupied_room.lease) ? occupied_room.lease.payment_periods[occupied_room.lease.payment_periods.length - 1].payment_status : '-----------';
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
                    <tr key={tenant_id}>
                      <td className={className}>
                        <div className="flex items-center gap-4">
                          <Badge placement="bottom-end" color={status === "online" ? "green" : "blue-gray"} overlap="circular">
                            <Tooltip key={name} content={name}>
                              <Avatar src={profile_img || "/img/profile_pics/default-avatar.jpg"} alt={name} size="sm" variant="rounded" />
                            </Tooltip>
                          </Badge>
                          <div>
                            <Typography
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
                          <Menu dismiss={{itemPress: false}}>
                            <MenuHandler>
                              <Typography className="text-xs font-semibold text-blue-gray-600">
                                {room_name}
                              </Typography>
                            </MenuHandler>
                            <MenuList>
                              {rooms && (
                                <>
                                <Input 
                                  label="Search" 
                                  containerProps={{className: "mb-4"}} 
                                  onChange={(e) => setRoomSearch(e.target.value)}
                                />
                                {rooms
                                  .filter(({ name }) => name.toLowerCase().includes(roomSearch.toLowerCase()))
                                  .map(({ _id, name }) => (
                                    <MenuItem key={_id} onClick={() => handleRoomChoice(tenant_id, _id)}>
                                      {name}
                                    </MenuItem>
                                  ))}
                                </>
                              )}
                            </MenuList>
                          </Menu>
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
                        <Tooltip content="Remove Tentant">
                          <IconButton
                            size="sm"
                            color="red"
                            onClick={() => deleteTenant(tenant_id)}
                          >
                            <i class="fa-regular fa-trash-can text-blue-gray-800"></i>
                          </IconButton>
                        </Tooltip>
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
