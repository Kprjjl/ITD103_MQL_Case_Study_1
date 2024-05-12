import {
  Card,
  CardHeader,
  CardBody,
  Typography,
  Chip,
  IconButton,
} from "@material-tailwind/react";
import { EllipsisVerticalIcon } from "@heroicons/react/24/outline";
import { authorsTableData, projectsTableData } from "@/data";
import axios from "axios";
import { useEffect, useState } from "react";

export function Registrations() {
  const [registrations, setRegistrations] = useState([]);

  useEffect(() => {
    const fetchRegistrations = async () => {
      try {
        const response = await axios.get("http://localhost:3001/registrations", {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });
        setRegistrations(response.data);
      } catch (error) {
        console.error("Error fetching registrations:", error);
      }
    };

    fetchRegistrations();
  }, []);

  const approveRegistration = async (id) => {
    try {
      await axios.put(`http://localhost:3001/approve-registration/${id}`, {}, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      setRegistrations(prevRegistrations => prevRegistrations.map(registration => {
        if (registration._id === id) {
          return { ...registration, status: 'approved' };
        }
        return registration;
      }));
    } catch (error) {
      console.error("Error approving registration:", error);
    }
  };

  const disapproveRegistration = async (id) => {
    try {
      await axios.put(`http://localhost:3001/disapprove-registration/${id}`, {}, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      setRegistrations(prevRegistrations => prevRegistrations.map(registration => {
        if (registration._id === id) {
          return { ...registration, status: 'disapproved' };
        }
        return registration;
    }));
    }
    catch (error) {
      console.error("Error disapproving registration:", error);
    }
  };

  return (
    <div className="mt-12 mb-8 flex flex-col gap-12">
      <Card>
        <CardHeader variant="gradient" color="gray" className="mb-8 p-6">
          <Typography variant="h6" color="white">
            Registrations
          </Typography>
        </CardHeader>
        <CardBody className="overflow-x-scroll px-0 pt-0 pb-2">
          <table className="w-full min-w-[640px] table-auto">
            <thead>
              <tr>
                {["Name", "Email", "Username", "Status", "Approve/Disapprove"].map((el) => (
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
              {registrations.map(
                ({ _id, firstname, lastname, email, username, status }, key) => {
                  const className = `py-3 px-5 ${
                    key === registrations.length - 1
                      ? ""
                      : "border-b border-blue-gray-50"
                  }`;

                  return (
                    <tr key={_id}>
                      <td className={className}>
                        <Typography className="text-xs font-semibold text-blue-gray-600">
                          {lastname + ", " + firstname}
                        </Typography>
                      </td>
                      <td className={className}>
                        <Typography className="text-xs font-normal text-blue-gray-500">
                          {email}
                        </Typography>
                      </td>
                      <td className={className}>
                        <Typography className="text-xs font-normal text-blue-gray-500">
                          {username}
                        </Typography>
                      </td>
                      <td className={className}>
                        <Chip
                          variant="gradient"
                          color={status === 'approved' ? "green" : (status === 'disapproved' ? "red" : "blue-gray")}
                          value={status.toUpperCase()}
                          className="py-0.5 px-2 text-[11px] font-medium w-fit"
                        />
                      </td>
                      <td className={className}>
                        {
                          status === 'pending' ? (
                            <>
                              <IconButton variant="text" size="sm" color="green" onClick={() => approveRegistration(_id)}>
                                <i class="fa-solid fa-check"></i>
                              </IconButton>
                              <IconButton variant="text" size="sm" color="red" onClick={() => disapproveRegistration(_id)}>
                                <i class="fa-solid fa-xmark"></i>
                              </IconButton>
                            </>
                          ) : <>--</>
                        }
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

export default Registrations;
