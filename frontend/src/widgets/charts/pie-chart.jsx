import {
  Card,
  CardBody,
  CardHeader,
  Typography,
} from "@material-tailwind/react";
import Chart from "react-apexcharts";
import React, { Component } from "react";

export class PieChart extends Component {
  constructor(props) {
    super(props);

    this.state = {
      width: this.props.width,
      height: this.props.height,
      series: this.props.data,
      options: {
        chart: {
          toolbar: {
            show: false,
          },
        },
        dataLabels: {
          enabled: true,
        },
        colors: this.props.colors,
        legend: {
          show: this.props.showLegend,
        },
        labels: this.props.labels,
      },
    };
  }

  render() {
    return (
      <Card className={this.props.cardClassName}>
        <CardHeader floated={false} shadow={false} color="transparent"
          className="flex flex-col gap-4 rounded-none md:flex-row md:items-center justify-center"
        >
          <Typography variant="h5" color="blue-gray">
            {this.props.title}
          </Typography>
        </CardHeader>
        <CardBody className="mt-4 grid place-items-center px-2">
          <div>
          <Chart
            type="pie"
            width={this.state.width}
            height={this.state.height}
            series={this.state.series}
            options={this.state.options}
          />
          </div>
        </CardBody>
      </Card>
    );
  }
}

PieChart.displayName = "/src/widgets/charts/pie-chart.jsx";

export default PieChart;
