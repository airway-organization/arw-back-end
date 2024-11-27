import validate from "validate.js";
import { ApiError } from "../utils/ApiError.js";

class Chart {
  constructor(chartName, chartType, isActive = true) {
    this.chartName = chartName;
    this.chartType = chartType;
    this.isActive = isActive;

    this.constraints = {
      chartName: {
        presence: { message: " cannot be empty" },
        length: {
          minimum: 3,
          message: " must be at least 3 characters long",
        },
        type: "string",
      },
      chartType: {
        presence: { message: " cannot be empty" },
        inclusion: {
          within: ["bar", "pie", "line", "scatter"],
          message: "Invalid chart type",
        },
        type: "string",
      },
      isActive: {
        type: "boolean",
      },
    };
  }

  validate() {
    const validationErrors = validate(this, this.constraints);
    if (validationErrors) {
      const errorMessage = Object.keys(validationErrors)
        .map((key) => validationErrors[key].join(", "))
        .join("; ");
      throw new ApiError(400, errorMessage);
    }
  }
}

export default Chart;
