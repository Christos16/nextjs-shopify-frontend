import { useState, useEffect } from "react";
import { Card, DatePicker, Button, Select, DataTable } from "@shopify/polaris";
import axios from "axios";
import { IDateRange } from "@/interfaces/DateRange.interface";
import { IStaffMember } from "@/interfaces/StaffMember.interface";

const CommissionSimulation = () => {
  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(new Date());
  const [staffMembers, setStaffMembers] = useState([]);
  const [selectedStaffMember, setSelectedStaffMember] = useState("");
  const [commissionData, setCommissionData] = useState<any[]>([]);

  // Fetch staff members from the backend API
  useEffect(() => {
    const fetchStaffMembers = async () => {
      try {
        const response = await axios.get(
          "http://localhost:9000/api/staff-members"
        );
        setStaffMembers(response.data);
      } catch (error) {
        console.error("Error fetching staff members:", error);
      }
    };
    fetchStaffMembers();
  }, []);

  // Function to simulate commissions
  const simulateCommissions = async () => {
    try {
      const response = await axios.post(
        "http://localhost:9000/api/commissions/simulate",
        {
          startDate: startDate.toISOString(),
          endDate: endDate.toISOString(),
          staffMemberId: selectedStaffMember,
        }
      );
      setCommissionData(response.data);
    } catch (error) {
      console.error("Error simulating commissions:", error);
    }
  };

  // Handler for DatePicker change
  const handleDateChange = ({ start, end }: IDateRange) => {
    setStartDate(start);
    setEndDate(end);
  };

  // Convert commissionData object into an array of arrays with exact dates
  const commissionRows = Object.entries(commissionData).map(
    ([day, commission]) => {
      const commissionDate = new Date(startDate);
      commissionDate.setDate(startDate.getDate() + parseInt(day));
      return [commissionDate.toDateString(), commission.sumCommissions];
    }
  );

  return (
    <Card>
      <DatePicker
        month={startDate.getMonth()}
        year={startDate.getFullYear()}
        onChange={handleDateChange}
        onMonthChange={(month, year) => setStartDate(new Date(year, month))}
        selected={{
          start: startDate,
          end: endDate,
        }}
        allowRange={true}
      />
      <Select
        label="Staff Member"
        options={staffMembers.map((staffMember: IStaffMember) => ({
          label: staffMember.name,
          value: staffMember._id,
        }))}
        value={selectedStaffMember}
        onChange={(value) => setSelectedStaffMember(value)}
        disabled={!staffMembers.length} // Disabling the select while data is loading
      />

      <div style={{ marginTop: "10px" }}>
        <Button onClick={simulateCommissions}>Simulate</Button>
      </div>

      {/* Display commission data in a DataTable */}
      <DataTable
        columnContentTypes={["text", "numeric"]}
        headings={["Day", "Commission"]}
        rows={commissionRows}
      />
    </Card>
  );
};

export default CommissionSimulation;
