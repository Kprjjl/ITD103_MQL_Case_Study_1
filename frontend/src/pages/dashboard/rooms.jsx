import {
  Card,
  CardHeader,
  CardBody,
  Typography,
  Avatar,
  Chip,
  Tooltip,
  IconButton,

  Input,
  Button,
} from "@material-tailwind/react";
import { useEffect, useState } from "react";
import axios from "axios";
import DatePicker from "../../widgets/other/DatePicker";
import { DropdownInput } from "../..//widgets/other/DropdownInput";
import { MagnifyingGlassIcon, PlusIcon, DocumentTextIcon } from "@heroicons/react/24/outline";
import { addMonths, addQuarters, addYears, format } from "date-fns";
import { useMaterialTailwindController, setPopupActive } from "@/context";
import { fetchRooms } from "@/data";

export function Rooms() {
  const [controller, dispatch] = useMaterialTailwindController();
  const [rooms, setRooms] = useState([]);
  const [showAddRoomPopup, setShowAddRoomPopup] = useState(false);
  const [selectedRoomID, setSelectedRoomID] = useState(null);
  const [showUpdateLeasePopup, setShowUpdateLeasePopup] = useState(false);
  const [rent_amount, setRentAmount] = useState(null);
  const [payment_frequency, setPaymentFrequency] = useState("monthly");
  const [start_date, setStartDate] = useState(Date.now);
  const [num_terms, setNumTerms] = useState(1);
  const [end_date, setEndDate] = useState(null);
  const payment_freq_enum = ['monthly', 'quarterly', 'semi-annually', 'annually', 'one-time'];
  const [roomSearch, setRoomSearch] = useState("");

  useEffect(() => {
    fetchRooms().then((data) => {
      setRooms(data);
    });
  }, []);

  useEffect(() => {
    setEndDate(calculateEndDate(start_date, num_terms, payment_frequency));
  }, [start_date, num_terms, payment_frequency])

  const updateRoomName = async (id, name) => {
    try {
      const response = await axios.put("http://localhost:3001/rooms/" + id, { name }, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      const updatedRoom = response.data.room;
      setRooms(prevRooms => prevRooms.map(room => room._id === id ? updatedRoom : room));
    }
    catch (error) {
      console.error("Error updating room name:", error);
    }
  };

  const deleteRoom = async (id) => {
    try {
      await axios.delete("http://localhost:3001/rooms/" + id, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      setRooms(prevRooms => prevRooms.filter(room => room._id !== id));
    }
    catch (error) {
      console.error("Error deleting room:", error);
    }
  };

  const handleAddRoomSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const name = formData.get("name");
    try {
      const response = await axios.post("http://localhost:3001/rooms", { name }, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      const newRoom = response.data.room;
      setRooms(prevRooms => [...prevRooms, newRoom]);
      setShowAddRoomPopup(false);
      setPopupActive(dispatch, false);
    }
    catch (error) {
      console.error("Error adding room:", error);
    }
  };

  const handleUpdateLeaseSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.put("http://localhost:3001/rooms/" + selectedRoomID + "/lease", {
        rent_amount,
        payment_frequency,
        start_date,
        end_date,
        num_terms
      }, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      const updatedRoom = response.data.room;
      setRooms(prevRooms => prevRooms.map(room => room._id === selectedRoomID ? updatedRoom : room));
      setShowUpdateLeasePopup(false);
      setPopupActive(dispatch, false);
    }
    catch (error) {
      console.error("Error updating lease:", error);
    }
  }

  function calculateEndDate(startDate, numTerms, paymentFrequency) {
    if (numTerms) {
      let endDate = new Date(startDate);
      switch (paymentFrequency) {
        case 'monthly':
          endDate = addMonths(endDate, numTerms);
          break;
        case 'quarterly':
          endDate = addQuarters(endDate, numTerms);
          break;
        case 'semi-annually':
          endDate = addMonths(endDate, numTerms * 6);
          break;
        case 'annually':
          endDate = addYears(endDate, numTerms);
          break;
        case 'one-time':
          break;
        default:
          throw new Error('Invalid payment frequency');
      }
      return endDate;
    }
    return null;
  }

  return (
    <div className="mt-12 mb-8 flex flex-col gap-12">
      <Card>
        <CardHeader floated={false} shadow={false} className="rounded-none mb-8">
        <div className="mb-8 flex items-center justify-between gap-8">
          <div>
            <Typography variant="h5" color="blue-gray">
              Rooms list
            </Typography>
            <Typography color="gray" className="mt-1 font-normal">
              See room information
            </Typography>
          </div>
          <div className="flex shrink-0 flex-col gap-2 sm:flex-row">
            <Button className="flex items-center gap-3" size="sm" onClick={() => {setShowAddRoomPopup(true); setPopupActive(dispatch, true);}} >
              <PlusIcon strokeWidth={2} className="h-4 w-4" /> Add room
            </Button>
          </div>
        </div>
        <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
          <div className="w-full md:w-72">
            <Input
              label="Search Room"
              icon={<MagnifyingGlassIcon className="h-5 w-5" />}
              onChange={(e) => setRoomSearch(e.target.value)}
            />
          </div>
          <div></div>
        </div>
      </CardHeader>
        <CardBody className="overflow-x-scroll px-0 pt-0 pb-2">
          <table className="w-full min-w-[640px] table-auto">
            <thead>
              <tr>
                {["Room Name", "Tenant/s", "Rent Amount", "Payment Status", ""].map(
                  (el) => (
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
                  )
                )}
              </tr>
            </thead>
            <tbody>
              {rooms.filter(item => (item.name.includes(roomSearch))).map(
                ({ _id, name, details, lease, tenants }, key) => {
                  const payment_status = lease ? lease.payment_status : '-----------';
                  const PAYMENT_STATUS_COLORS = {
                    'paid': 'green',
                    'unpaid': 'blue-gray-800',
                    'overdue': 'red',
                    'partially paid': 'blue-gray'
                  };
                  const className = `py-3 px-5 ${
                    key === rooms.length - 1
                      ? ""
                      : "border-b border-blue-gray-50"
                  }`;

                  return (
                    <tr key={_id}>
                      <td className={className}>
                        <div className="flex items-center gap-4">
                          <Typography
                            variant="small"
                            color="blue-gray"
                            className="font-bold"
                          >
                            {name}
                          </Typography>
                          <IconButton
                            variant="text"
                            size="sm"
                            color="blue-gray"
                            onClick={() => updateRoomName(_id, prompt("Enter new room name"))}
                          >
                            <i class="fa-regular fa-pen-to-square"></i>
                          </IconButton>
                        </div>
                      </td>
                      <td className={className}>
                        {tenants.length === 0 && (
                          <Typography
                            variant="small"
                            className="text-s font-medium text-blue-gray-600"
                          > VACANT </Typography>
                        )}
                        {tenants && tenants.map(({ id, username, profile_img }, key) => (
                          <Tooltip key={id} content={username}>
                            <Avatar
                              src={profile_img || "/img/profile_pics/default-avatar.jpg"}
                              alt={username}
                              size={tenants.length > 1 ? "xs" : "sm"}
                              variant="circular"
                              className={`cursor-pointer border-2 border-white ${
                                key === 0 ? "" : "-ml-2.5"
                              }`}
                            />
                          </Tooltip>
                        ))}
                      </td>
                      <td className={className}>
                        <Typography
                          variant="small"
                          className="text-s font-medium text-blue-gray-600"
                        >
                          {(lease && (
                            <>{"₱" + lease.rent_amount.toLocaleString()}</>
                          )) || "N/A"}
                        </Typography>
                      </td>
                      <td className={className}>
                        {lease && tenants && (
                          <Chip
                            variant="gradient"
                            color={PAYMENT_STATUS_COLORS[payment_status]}
                            value={payment_status.toUpperCase()}
                            className="py-0.5 px-2 text-[11px] font-medium w-fit"
                          />
                        )}
                      </td>
                      <td className={className}>
                        <div className="flex items-center gap-2">
                          <Tooltip content="Edit lease">
                            <IconButton
                              size="sm"
                              color="blue-gray"
                              onClick={() => {
                                setSelectedRoomID(_id);
                                if (lease) {
                                  setRentAmount(lease.rent_amount);
                                  setPaymentFrequency(lease.payment_frequency);
                                  setStartDate(lease.start_date);
                                  setNumTerms(lease.num_terms);
                                  setEndDate(lease.end_date);
                                }
                                setShowUpdateLeasePopup(true);
                                setPopupActive(dispatch, true);
                              }}
                            >
                              <DocumentTextIcon className="h-5 w-5" />
                            </IconButton>
                          </Tooltip>
                          <Tooltip content="Delete room">
                            <IconButton
                              size="sm"
                              color="red"
                              onClick={() => deleteRoom(_id)}
                            >
                              <i class="fa-regular fa-trash-can text-blue-gray-800"></i>
                            </IconButton>
                          </Tooltip>
                        </div>
                      </td>
                    </tr>
                  );
                }
              )}
            </tbody>
          </table>
        </CardBody>
      </Card>

      {showAddRoomPopup && (
        <div className="fixed top-0 left-0 w-full h-full bg-black bg-opacity-50 flex justify-center items-center">
          <Card className="w-96">
            <CardHeader className="bg-gray-100 p-4" variant="gradient" color="gray">
              <Typography variant="h6">Add Room</Typography>
            </CardHeader>
            <CardBody>
              <form onSubmit={handleAddRoomSubmit}>
                <Input label="Room Name" name="name"/>
                <div className="flex justify-end mt-4">
                  <Button onClick={() => {setShowAddRoomPopup(false); setPopupActive(dispatch, false);}} className="mr-2" type="button">Cancel</Button>
                  <Button
                    color="green"
                    type="submit"
                  >
                    Add
                  </Button>
                </div>
              </form>
            </CardBody>
          </Card>
        </div>
      )}

      {showUpdateLeasePopup && (
        <div className="fixed top-0 left-0 w-full h-full bg-black bg-opacity-50 flex justify-center items-center">
          <Card className="w-96">
            <CardHeader className="bg-gray-100 p-4" variant="gradient" color="gray">
              <Typography variant="h6">Update Lease</Typography>
            </CardHeader>
            <CardBody>
              <form onSubmit={handleUpdateLeaseSubmit}>
                <div className="flex flex-col gap-8">
                  <Input label="Rent Amount" onChange={(e) => setRentAmount(e.target.value)} defaultValue={rent_amount} required />
                  <DropdownInput 
                    listItems={payment_freq_enum.map((item) => ({ value: item, label: item }))} 
                    getLabelValue={() => payment_frequency}
                    setValue={setPaymentFrequency} 
                    label="Payment Frequency"
                    required
                  />
                  <DatePicker date={start_date} setDate={setStartDate} label="Select Start Payment Date" required />
                  <Input 
                    label="Number of Terms"
                    defaultValue={num_terms}
                    onChange={(e) => {
                      const value = e.target.value;
                      if(/^\d+$/.test(value)) {
                        setNumTerms(parseInt(value));
                      }
                    }}
                    required
                  />
                  <Input label="End Payment Date" value={end_date ? format(end_date, "PPP") : ""} disabled />
                </div>
                <div className="flex justify-end mt-4">
                  <Button onClick={() => {setShowUpdateLeasePopup(false); setPopupActive(dispatch, false);}} className="mr-2" type="button">Cancel</Button>
                  <Button
                    color="green"
                    type="submit"
                  >
                    Update
                  </Button>
                </div>
              </form>
            </CardBody>
          </Card>
        </div>
      )}
    </div>
  );
}

export default Rooms;
