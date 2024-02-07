import "./active-link.js" // set active links to current route
import { supabase } from './supabase.js';

// import Chart from 'chart.js/auto';
// import { getRelativePosition } from 'chart.js/helpers';
import Chart from 'chart.js/auto'
import { showErrorMessage, showSuccessMessage } from "./utils.js";

const formElement = document.forms["report-filter"];

formElement.addEventListener("submit", filterFormSubmitHandler);

async function filterFormSubmitHandler(event) {
    event.preventDefault();

    const { timeRange, selectYear, dataMode } = event.target.elements;

    const data = await fetchReportData(selectYear.value, dataMode.value);
    const dataByMonth = prepareDataByMonth(data);

    const chartData = [
        { month: "January", amount: dataByMonth["January"] },
        { month: "February", amount: dataByMonth["February"] },
        { month: "March", amount: dataByMonth["March"] },
        { month: "April", amount: dataByMonth["April"] },
        { month: "May", amount: dataByMonth["May"] },
        { month: "June", amount: dataByMonth["June"] },
        { month: "July", amount: dataByMonth["July"] },
        { month: "August", amount: dataByMonth["August"] },
        { month: "September", amount: dataByMonth["September"] },
        { month: "October", amount: dataByMonth["October"] },
        { month: "November", amount: dataByMonth["November"] },
        { month: "December", amount: dataByMonth["December"] }
    ]

    const reportContainerElement = document.createElement("div");
    reportContainerElement.classList.add("report-container");

    const canvasElement = document.createElement('canvas');
    canvasElement.classList.add("report-container-canvas")
    const ctx = canvasElement.getContext('2d');

    new Chart(ctx, {
        type: 'bar',
        data: {
            labels: chartData.map(row => row.month),
            datasets: [
                {
                    label: 'Expenses by month',
                    data: chartData.map(row => row.amount)
                }
            ]
        },
    });

    const titleElement = document.createElement("h2")
    titleElement.textContent = selectYear.value;
    titleElement.classList.add("report-container-h2");

    reportContainerElement.appendChild(titleElement);
    reportContainerElement.appendChild(canvasElement);
    const reportsElement = document.getElementById('reports');
    reportsElement.appendChild(reportContainerElement);
}

async function fetchReportData(year, dataMode) {
    // Construct UTC dates
    const startDate = `${year}-01-01`;
    const endDate = `${year}-12-31`;

    // Fetch data within the specified date range
    const { data, error } = await supabase
        .from('expenses')
        .select('date, amount')
        .gte('date', startDate)
        .lt('date', endDate);

    if (error) {
        console.error('Error fetching data:', error);
        showErrorMessage('Error fetching data: ' + error.message);
        return;
    }

    return data;
}

const prepareDataByMonth = (data) => {
    const dataByMonth = {};

    data.forEach(expense => {
        const date = new Date(expense.date);
        const month = date.toLocaleString('default', { month: "long" }); // January, February, etc.

        if (dataByMonth[month]) {
            dataByMonth[month] += expense.amount;
        } else {
            dataByMonth[month] = expense.amount;
        }
    });

    // add remaining months with 0 amount
    const months = [
        'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'
    ];

    months.forEach(month => {
        if (!dataByMonth[month]) {
            dataByMonth[month] = 0;
        }
    });

    return dataByMonth;
}