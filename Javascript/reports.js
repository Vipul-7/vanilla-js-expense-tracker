import "./active-link.js" // set active links to current route
import { supabase } from './supabase.js';

import Chart from 'chart.js/auto'
import { showErrorMessage, showSuccessMessage } from "./utils.js";
import { hideLargeLoader, showLargeLoader } from "./loader.js";

const formElement = document.forms["report-filter"];

formElement.addEventListener("submit", filterFormSubmitHandler);

const daysInMonths = {

}

async function filterFormSubmitHandler(event) {
    event.preventDefault();
    showLargeLoader();

    const { timeRange, selectYear, dataMode } = event.target.elements;

    reportGeneration(timeRange.value, selectYear.value, dataMode.value);

    hideLargeLoader();
}

async function fetchReportData(year, dataMode) {
    // Construct UTC dates
    const startDate = `${year}-01-01`;
    const endDate = `${year}-12-31`;

    // Fetch data within the specified date range
    const { data, error } = await supabase
        .from('expenses')
        .select(`date, ${dataMode}, amount`)
        .gte('date', startDate)
        .lt('date', endDate);

    if (error) {
        console.error('Error fetching data:', error);
        showErrorMessage('Error fetching data: ' + error.message);
        return;
    }

    return data;
}

const expenseTags = ["Entertainment", "Health", "EMI", "Utilities", "Insurance", "Food", "Transportation", "Educational", "Shopping"];
const paymentModes = ["UPI", "Debit card", "Credit card", "Cash", "Net banking"];
const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
];

function prepareDataForYear(filteredData, dataMode) {
    const dataByMode = {};

    filteredData.forEach(expense => {
        let xAxis;

        if (dataMode === "amount") {
            const date = new Date(expense.date);
            xAxis = date.toLocaleString('default', { month: "long" }); // January, February, etc.
        }
        else if (dataMode === "tag") {
            xAxis = expense.tag;
        }
        else {
            xAxis = expense.mode;
        }

        if (dataByMode[xAxis]) {
            dataByMode[xAxis] += expense.amount;
        } else {
            dataByMode[xAxis] = expense.amount;
        }
    });

    // add remaining months with 0 amount
    let xAxisArray;
    if (dataMode === "amount") {
        xAxisArray = months;
    }
    else if (dataMode === "tag") {
        xAxisArray = expenseTags;
    }
    else {
        xAxisArray = paymentModes;
    }

    xAxisArray.forEach(xAxis => {
        if (!dataByMode[xAxis]) {
            dataByMode[xAxis] = 0;
        }
    });

    return dataByMode;
}

function prepareDataForQuarter() {

}

function prepareDataForMonth(filteredData) {
    const dataOneDay = {};

    filteredData.forEach(expense => {
        const date = new Date(expense.date);
        const day = date.toLocaleString('default', { day: "numeric" });

        if (dataOneDay[day]) {
            dataOneDay[day] += expense.amount;
        } else {
            dataOneDay[day] = expense.amount;
        }
    });
}

function addChartElement() {
    const reportContainerElement = document.createElement("div");
    reportContainerElement.classList.add("report-container");

    const canvasElement = document.createElement('canvas');
    canvasElement.classList.add("report-container-canvas")
    const ctx = canvasElement.getContext('2d');

    const titleElement = document.createElement("h2")
    titleElement.textContent = selectYear.value;
    titleElement.classList.add("report-container-h2");

    reportContainerElement.appendChild(titleElement);
    reportContainerElement.appendChild(canvasElement);
    const reportsElement = document.getElementById('reports');
    reportsElement.appendChild(reportContainerElement);

    return ctx;
}

async function reportGeneration(timeRange, selectYear, dataMode) {
    const filteredData = await fetchReportData(selectYear, dataMode);
    console.log(filteredData);

    if (!timeRange) {
        showErrorMessage("Time range is null or undefined")
        return;
    }

    const chartData = [];
    if (timeRange === "year") {
        const dataByMode = prepareDataForYear(filteredData, dataMode);

        let xAxisArray;
        if (dataMode === "amount") {
            xAxisArray = months;
        }
        else if (dataMode === "tag") {
            xAxisArray = expenseTags;
        }
        else {
            xAxisArray = paymentModes;
        }

        for (const xAxis of xAxisArray) {
            chartData.push({
                x: xAxis, y: dataByMode[xAxis]
            })
        }
    }
    else if (timeRange === "quarter") {
        const dataByFiveDays = prepareDataForQuarter(filteredData);

        chartData = [
        ]
    }
    else { // monthly
        const dataOneDay = prepareDataForMonth(filteredData);

        chartData = [

        ]
    }

    createChart(chartData, dataMode);
}

function createChart(chartData,dataMode) {
    const ctx = addChartElement();

    let label = "Expenses by ";
    if (dataMode === "amount") {
        label += "month"
    }
    else if (dataMode === "tag") {
        label += "Expense tag"
    }
    else {
        label += "Payment mode"
    }

    new Chart(ctx, {
        type: 'bar',
        data: {
            labels: chartData.map(row => row.x),
            datasets: [
                {
                    label,
                    data: chartData.map(row => row.y)
                }
            ]
        },
    });
}