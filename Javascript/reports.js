import "./active-link.js" // set active links to current route
import { supabase } from './supabase.js';
import "./getUser.js"

import Chart from 'chart.js/auto'
import { showErrorMessage, showSuccessMessage } from "./utils.js";
import { hideLargeLoader, showLargeLoader } from './loader.js';

const formElement = document.forms["report-filter"];

formElement.addEventListener("submit", filterFormSubmitHandler);

async function filterFormSubmitHandler(event) {
    event.preventDefault();
    showLargeLoader();

    const { timeRange, selectYear, dataMode } = event.target.elements;

    await reportGeneration(timeRange.value, selectYear.value, dataMode.value);

    hideLargeLoader();
}

// fetch the data from the database based on the year and data mode
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
const quarters = [
    "January - March", "April - June", "July - september", "October - december"
]

// empty array to store the data for the year
function daysInMonthArray(year, month) {
    const days = new Date(year, month, 0).getDate();
    return Array.from({ length: days }, (_, i) => i + 1);
}

function weeksInQuarterArray(year, quarter) {
    const quarterFirstMonthDays = new Date(year, (quarter - 1) * 3 + 1, 0).getDate();
    const quarterSecondMonthDays = new Date(year, (quarter - 1) * 3 + 2, 0).getDate();
    const quarterThirdMonthDays = new Date(year, (quarter - 1) * 3 + 3, 0).getDate()

    const totalDays = quarterFirstMonthDays + quarterSecondMonthDays + quarterThirdMonthDays;

    return Array.from({ length: Math.ceil(totalDays / 7) }, (_, i) => i + 1);
}

// from the filtered data, prepare data for the year
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

// from the filtered data, prepare data for the month
function prepareDataForMonth(filteredData, selectYear, dataMode, currentMonth) {
    const dataByMode = {};

    filteredData.forEach(expense => {
        let xAxis;

        if (dataMode === "amount") {
            const date = new Date(expense.date);
            xAxis = date.toLocaleString('default', { day: "numeric" })
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
        xAxisArray = daysInMonthArray(selectYear, currentMonth);
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

function prepareDataForQuarter(filteredData, selectYear, dataMode, currentQuarter) {
    const dataByMode = {};

    filteredData.forEach(expense => {
        let xAxis;

        if (dataMode === "amount") {
            const date = new Date(expense.date);
            const monthNumber = date.toLocaleString("default", { month: "numeric" });
            let prevDaysInQuarter = 0;
            for (let i = 0; i < ((monthNumber - 1) % 3); i++) {
                prevDaysInQuarter += new Date(selectYear, (currentQuarter - 1) * 3 + i + 1, 0).getDate();
            }
            prevDaysInQuarter += date.getDate();
            xAxis = Math.ceil(prevDaysInQuarter / 7);
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
    })

    // add remaining months with 0 amount
    let xAxisArray;
    if (dataMode === "amount") {
        // xAxisArray = daysInMonthArray(selectYear.value, currentMonth);
        xAxisArray = weeksInQuarterArray(selectYear, currentQuarter)
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

// add a chart element to the reports section
function addChartElement(timeRange, sequenceNumber) {
    const reportContainerElement = document.createElement("div");
    reportContainerElement.classList.add("report-container");

    const canvasElement = document.createElement('canvas');
    canvasElement.classList.add("report-container-canvas")
    const ctx = canvasElement.getContext('2d');

    const titleElement = document.createElement("h2")
    if (!timeRange) {
        titleElement.textContent = selectYear.value
    }
    else if (timeRange === "month" && sequenceNumber) {
        titleElement.textContent = months[sequenceNumber - 1] + " " + selectYear.value;
    }
    else if (timeRange === "quarter") {
        // titleElement.textContent = "Quarter " + month + " " + selectYear.value;
        titleElement.textContent = quarters[sequenceNumber - 1] + " " + selectYear.value;
    }
    titleElement.classList.add("report-container-h2");

    reportContainerElement.appendChild(titleElement);
    reportContainerElement.appendChild(canvasElement);
    const reportsElement = document.getElementById('reports');
    reportsElement.appendChild(reportContainerElement);

    return ctx;
}

// generate a full report based on the time range, year and data mode
async function reportGeneration(timeRange, selectYear, dataMode) {
    const filteredData = await fetchReportData(selectYear, dataMode);

    if (!timeRange || !selectYear || !dataMode) {
        showErrorMessage("Filter input is null or undefined. Please try again.")
        return;
    }

    if (timeRange === "year") {
        const chartData = [];
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

        createChart(chartData, dataMode);
    }
    else if (timeRange === "quarter") {
        quarters.forEach((quarter, index) => {
            const chartData = [];

            const quarterFilteredData = filteredData.filter(expense => {
                const date = new Date(expense.date);
                return Math.ceil((date.getMonth() + 1) / 3) == index + 1;
            })
            const dataByWeek = prepareDataForQuarter(quarterFilteredData, selectYear, dataMode, index + 1);

            let xAxisArray;
            if (dataMode === "amount") {
                xAxisArray = weeksInQuarterArray(selectYear, index + 1);
            }
            else if (dataMode === "tag") {
                xAxisArray = expenseTags;
            }
            else {
                xAxisArray = paymentModes;
            }

            for (const xAxis of xAxisArray) {
                chartData.push({
                    x: xAxis, y: dataByWeek[xAxis]
                })
            }

            createChart(chartData, dataMode, timeRange, index + 1);
        })
    }
    else { // monthly
        months.forEach((month, index) => {
            const chartData = [];
            const monthFilteredData = filteredData.filter(expense => {
                const date = new Date(expense.date);
                return date.getMonth() === index;  // getMonth() returns 0-11
            })
            const dataByMode = prepareDataForMonth(monthFilteredData, selectYear, dataMode, index + 1);

            let xAxisArray;
            if (dataMode === "amount") {
                xAxisArray = daysInMonthArray(selectYear, index + 1);
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

            createChart(chartData, dataMode, timeRange, index + 1);
        })
    }
}

// creates a chart using chartdata and dataMode
function createChart(chartData, dataMode, timeRange = null, sequenceNumber = null) { // sequenceNumber is used for quarter or month number
    const ctx = addChartElement(timeRange, sequenceNumber);

    let label = "Expenses by ";
    if (dataMode === "amount") {
        if (timeRange === "month") {
            label += "day"
        }
        if (timeRange === "quarter") {
            label += "week"
        }
        else {
            label += "month"
        }
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