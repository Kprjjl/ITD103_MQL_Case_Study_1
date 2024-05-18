import React from "react";
import {
  Typography,
  Card,
  CardHeader,
  CardBody,
  IconButton,
  Menu,
  MenuHandler,
  MenuList,
  MenuItem,
  Avatar,
  Tooltip,
  Progress,
} from "@material-tailwind/react";
import { StatisticsCard } from "@/widgets/cards";
import { PieChart } from "@/widgets/charts";
import { useState, useEffect } from "react";
import { getStatisticsCardsData, getRoomPaymentStatusPieChartData, getPaymentsChartData } from "@/controllers/dashboard-controller";
import HighchartsReact from 'highcharts-react-official';
import Highcharts from 'highcharts';
import { useMaterialTailwindController } from "@/context";

export function Home() {
  const [controller, dispatch] = useMaterialTailwindController();
  const { userType } = controller;
  const [statisticsCardsData, setStatisticsCardsData] = useState([]);
  const [roomPaymentStatusPieChartData, setRoomPaymentStatusPieChartData] = useState([]);
  const [paymentChartsData, setPaymentChartsData] = useState([]);

  useEffect(() => {
    getStatisticsCardsData().then((data) => {
      setStatisticsCardsData(data);
    });

    getRoomPaymentStatusPieChartData().then((data) => {
      setRoomPaymentStatusPieChartData(data);
    });

    console.log("roomPaymentStatusPieChartData", roomPaymentStatusPieChartData)

    getPaymentsChartData().then((data) => {
      setPaymentChartsData(data);
    });
  }, []);

  return (
    <div className="mt-12">
      <div className="mb-12 grid gap-y-10 gap-x-6 md:grid-cols-2 xl:grid-cols-4">
        {statisticsCardsData.map(({ icon, title, footer, ...rest }) => (
          <StatisticsCard
            key={title}
            {...rest}
            title={title}
            icon={React.createElement(icon, {
              className: "w-6 h-6 text-white",
            })}
            footer={
              <Typography className="font-normal text-blue-gray-600">
                <strong className={footer.color}>{footer.value}</strong>
                &nbsp;{footer.label}
              </Typography>
            }
          />
        ))}
      </div>
      {userType === "admin" && (
        <div className="mb-6 grid grid-cols-1 gap-y-12 gap-x-6 md:grid-cols-2 xl:grid-cols-3">
          {roomPaymentStatusPieChartData.data && (
            <PieChart
              cardClassName="border border-blue-gray-100 shadow-sm"
              data={roomPaymentStatusPieChartData.data}
              width={400}
              height={400}
              colors={roomPaymentStatusPieChartData.colors}
              showLegend={true}
              legendPosition="bottom"
              title="Room Payment Statuses"
              labels={roomPaymentStatusPieChartData.labels}
            />
          )}
          {paymentChartsData.perMonth && (
            <Card className="border border-blue-gray-100 shadow-sm">
              <CardHeader floated={false} shadow={false} color="transparent" className="m-0 p-6">
              </CardHeader>
              <CardBody className="pt-0">
                <HighchartsReact
                  highcharts={Highcharts}
                  options={{
                    chart: {
                      type: 'line'
                    },
                    title: {
                      text: paymentChartsData.perMonth.title
                    },
                    xAxis: {
                      categories: paymentChartsData.perMonth.labels
                    },
                    series: [{
                      name: 'Payments',
                      data: paymentChartsData.perMonth.data,
                      color: "#10B981"
                    }]
                  }}
                />
              </CardBody>
            </Card>
          )}
          {paymentChartsData.perYear && (
            <Card className="border border-blue-gray-100 shadow-sm">
              <CardHeader floated={false} shadow={false} color="transparent" className="m-0 p-6">
              </CardHeader>
              <CardBody className="pt-0">
                <HighchartsReact
                  highcharts={Highcharts}
                  options={{
                    chart: {
                      type: 'line'
                    },
                    title: {
                      text: paymentChartsData.perYear.title
                    },
                    xAxis: {
                      categories: paymentChartsData.perYear.labels
                    },
                    series: [{
                      name: 'Payments',
                      data: paymentChartsData.perYear.data,
                      color: "#10B981"
                    }]
                  }}
                />
              </CardBody>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}

export default Home;
