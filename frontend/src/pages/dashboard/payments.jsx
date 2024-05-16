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
  Badge,
} from "@material-tailwind/react";
import { DocumentTextIcon } from "@heroicons/react/24/outline";
import { useEffect, useState } from "react";
import axios from "axios";
import DatePicker from "../../widgets/other/DatePicker";
import { DropdownInput } from "../..//widgets/other/DropdownInput";
import { format } from "date-fns";
import { MagnifyingGlassIcon, PlusIcon } from "@heroicons/react/24/outline";

export function Payments() {
  const [payments, setPayments] = useState([]);
  const [showAddPaymentPopup, setShowAddPaymentPopup] = useState(false);
  const [selectedPaymentID, setSelectedPaymentID] = useState(null);
  const [showUpdatePaymentPopup, setShowUpdatePaymentPopup] = useState(false);

  const [amount, setAmount] = useState(null);
  const [paid_by, setPaidBy] = useState(null);
  const [room, setRoom] = useState(null);
  const [date, setDate] = useState(Date.now);
  const [rooms, setRooms] = useState([]);
  const [tenants, setTenants] = useState([]);

  useEffect(() => {
    const fetchPayments = async () => {
      try {
        const response = await axios.get("http://localhost:3001/payments", {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });
        setPayments(response.data);
      }
      catch (error) {
        console.error("Error fetching rooms:", error);
      }
    };

    fetchPayments();
    payments.sort((a, b) => new Date(b.date) - new Date(a.date));
  }, []);

  // useEffect logger
  useEffect(() => {
    console.log("paid_by:", paid_by);
    console.log("room:", room);
  }, [paid_by, room]);

  const deletePayment = async (id) => {
    try {
      await axios.delete("http://localhost:3001/payments/" + id, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      setPayments(prevRooms => prevRooms.filter(room => room._id !== id));
    }
    catch (error) {
      console.error("Error deleting payment: ", error);
    }
  };

  const handleAddPaymentSubmit = async (e) => { 
    e.preventDefault();
    try {
      const roomId = room._id;
      const tenantId = paid_by.id;
      const response = await axios.post("http://localhost:3001/payments", 
        { amount, paid_by: tenantId, room: roomId, date },
        { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }
      );
      const newPayment = response.data;
      setPayments(prevPayments => [...prevPayments, newPayment]);
      setShowAddPaymentPopup(false);
    } catch {
      console.error("Error adding payment:", error);
    }
  };

  const handleUpdatePaymentSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.put("http://localhost:3001/payments" + selectedPaymentID, 
        { amount, paid_by, room: room, date }, 
        { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }
      );
      const updatedPayment = response.data;
      setPayments(prevPayments => prevPayments.map(payment => payment._id === selectedPaymentID ? updatedPayment : payment));
      setShowUpdatePaymentPopup(false);
    } catch (error) {
      console.error("Error updating payment:", error);
    }
  };

  const fetchRooms = async () => {
    try {
      const response = await axios.get("http://localhost:3001/rooms", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      response.data = response.data.filter(room => !room.tenant);
      setRooms(response.data);
    }
    catch (error) {
      console.error("Error fetching rooms:", error);
    }
  };

  const setRoomAndGetTenants = async (room) => {
    try{
      const response = await axios.get(`http://localhost:3001/rooms/${room._id}/tenants`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      setTenants(response.data);
      setRoom(room);
    } catch (error) {
      console.error('Error fetching tenants:', error);
    }
  }

  return (
    <div className="mt-12 mb-8 flex flex-col gap-12">
      <Card>
        <CardHeader floated={false} shadow={false} className="rounded-none mb-8">
          <div className="mb-8 flex items-center justify-between gap-8">
            <div>
              <Typography variant="h5" color="blue-gray">
                Payments
              </Typography>
              <Typography color="gray" className="mt-1 font-normal">
                log payment details here
              </Typography>
            </div>
            <div className="flex shrink-0 flex-col gap-2 sm:flex-row">
              <Button className="flex items-center gap-3" size="sm" onClick={() => {setShowAddPaymentPopup(true); fetchRooms()}} >
                <PlusIcon strokeWidth={2} className="h-4 w-4" /> Log New Payment
              </Button>
            </div>
          </div>
          <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
            <div></div>
            <div className="w-full md:w-72">
              <Input
                label="Search"
                icon={<MagnifyingGlassIcon className="h-5 w-5" />}
              />
            </div>
          </div>
        </CardHeader>
        <CardBody className="overflow-x-scroll px-0 pt-0 pb-2">
          <table className="w-full min-w-[640px] table-auto">
            <thead>
              <tr>
                {["Date", "Room Name", "Amount", "Paid By", ""].map(
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
              {payments.map(
                ({ _id, amount, paid_by, room, date }, key) => {
                  const user = paid_by;
                  const name = `${user.firstname} ${user.lastname}`;
                  const className = `py-3 px-5 ${
                    key === payments.length - 1
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
                            className="font-semibold"
                          >
                            {format(date, "MM-dd-yy")}
                          </Typography>
                        </div>
                      </td>
                      <td className={className}>
                        <Typography variant="small" color="blue-gray">
                          {room.name}
                        </Typography>
                      </td>
                      <td className={className}>
                          <i class="fa-solid fa-peso-sign"></i>
                          {amount.toLocaleString()}
                      </td>
                      <td className={className}>
                        <div className="flex items-center gap-4">
                          <Badge placement="bottom-end" color={user.status === "online" ? "green" : "blue-gray"}>
                            <Tooltip key={name} content={name}>
                              <Avatar src={user.profile_img || "/img/profile_pics/default-avatar.jpg"} alt={name} size="sm" variant="rounded" />
                            </Tooltip>
                          </Badge>
                          <div>
                            <Typography
                              variant="small"
                              color="blue-gray"
                              className="font-semibold"
                              alt={name}
                            >
                              {user.username}
                            </Typography>
                            <Typography className="text-xs font-normal text-blue-gray-500">
                              {user.email}
                            </Typography>
                          </div>
                        </div>
                      </td>
                      <td className={className}>
                        <div className="flex items-center gap-2">
                          <Tooltip content="Edit lease">
                            <IconButton
                              size="sm"
                              color="blue-gray"
                              onClick={() => {
                                setSelectedPaymentID(_id);
                                setAmount(amount);
                                setPaidBy(user._id);
                                setRoom(room._id);
                                setDate(date);
                                fetchRooms();
                                setShowUpdatePaymentPopup(true);
                              }}
                            >
                              <DocumentTextIcon className="h-5 w-5" />
                            </IconButton>
                          </Tooltip>
                          <Tooltip content="Delete room">
                            <IconButton
                              size="sm"
                              color="red"
                              onClick={() => deletePayment(_id)}
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

      {showAddPaymentPopup && (
        <div className="fixed top-0 left-0 w-full h-full bg-black bg-opacity-50 flex justify-center items-center">
          <Card className="w-96">
            <CardHeader className="bg-gray-100 p-4" variant="gradient" color="gray">
              <Typography variant="h6">Add Payment</Typography>
            </CardHeader>
            <CardBody>
              <form onSubmit={handleAddPaymentSubmit}>
                <div className="flex flex-col gap-8">
                  <DropdownInput
                    label="Room"
                    getLabelValue={() => (room ? room.name : "")}
                    setValue={setRoomAndGetTenants}
                    listItems={rooms.map(({ ...rest }) => ({value: { ...rest }, label: rest.name}))}
                    search={true}
                  />
                  <DropdownInput
                    label="Paid By"
                    getLabelValue={() => (paid_by ? paid_by.username : "")}
                    setValue={setPaidBy}
                    listItems={tenants.map(({ ...rest }) => ({value: { ...rest }, label: rest.username}))}
                    search={true}
                  />
                  <Input
                    type="number"
                    label="Amount"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                  />
                  <DatePicker
                    label="Date"
                    date={date}
                    setDate={setDate}
                    onChange={(e) => setDate(e.target.value)}
                  />
                </div>
                <div className="flex justify-end mt-4">
                  <Button onClick={() => setShowAddPaymentPopup(false)} className="mr-2" type="button">Cancel</Button>
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

      {showUpdatePaymentPopup && (
        <div className="fixed top-0 left-0 w-full h-full bg-black bg-opacity-50 flex justify-center items-center">
          <Card className="w-96">
            <CardHeader className="bg-gray-100 p-4" variant="gradient" color="gray">
              <Typography variant="h6">Update Payment Details</Typography>
            </CardHeader>
            <CardBody>
              <form onSubmit={handleUpdatePaymentSubmit}>
                <div className="flex flex-col gap-8">
                  <Input
                    type="number"
                    label="Amount"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                  />
                  <Input
                    type="text"
                    label="Paid By"
                    value={paid_by}
                    onChange={(e) => setPaidBy(e.target.value)}
                  />
                  <Input
                    type="text"
                    label="Room"
                    value={room}
                    onChange={(e) => setRoom(e.target.value)}
                  />
                  <DatePicker
                    label="Date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                  />
                </div>
                <div className="flex justify-end mt-4">
                  <Button onClick={() => setShowUpdatePaymentPopup(false)} className="mr-2" type="button">Cancel</Button>
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

export default Payments;
