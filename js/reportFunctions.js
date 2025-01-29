// MARK: createDonutChart
function createDonutChart(processedData) {
  // Create the donut chart
  const ctx = document.getElementById('myChart').getContext('2d');
  new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels: ['Compliant', 'Non-compliant'],
      datasets: [{
        data: [processedData.summary.compliant, processedData.summary.nonCompliant],
        backgroundColor: [
          'rgba(75, 192, 192, 0.8)',  // Green for compliant
          'rgba(255, 99, 132, 0.8)',   // Red for non-compliant
        ],
        borderColor: [
          'rgba(75, 192, 192, 1)',
          'rgba(255, 99, 132, 1)',
        ],
        borderWidth: 1
      }]
    },
    options: {
      responsive: true,
      plugins: {
        legend: {
          position: 'right',
          align: 'center',
          labels: {
            padding: 20
          }
        },
        title: {
          display: true,
          text: 'Compliance Overview',
          position: 'top'
        }
      },
      layout: {
        padding: {
          right: 50
        }
      },
      cutout: '70%'
    }
  });
}

// MARK: formatDate
const formatDate = (item) => {
  const date = new Date(item.timeStamp);
  return date.toLocaleString('fi-FI', {
    year: 'numeric',
    month: 'numeric',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  }).replace(/klo /, '');
};

const parseMyDate = (dateString) => {
  // Split date and time parts
  const [datePart, timePart] = dateString.split(' ');

  // Split date components
  const [day, month, year] = datePart.split('.');

  // Split time components
  const [hours, minutes, seconds] = timePart.split('.');

  // Create new date (months are 0-based in JS Date)
  return new Date(year, month - 1, day, hours, minutes, seconds);
};


// MARK: initSortableTables
function initSortableTables() {
  // Get all tables with sortable-table class
  const sortableTables = document.querySelectorAll('.sortable-table');

  sortableTables.forEach(table => {
    const headers = table.children[0].querySelectorAll('th.sortable');

    headers.forEach(header => {
      header.addEventListener('click', () => {
        const column = header.dataset.sort;
        const tbody = table.querySelector('tbody');
        const rows = Array.from(tbody.rows);

        // Check if table has detail rows
        const hasDetailRows = tbody.querySelector('tr.details') !== null;

        const rowGroups = [];
        if (hasDetailRows) {
          // Group main rows with their detail rows
          for (let i = 0; i < rows.length; i += 2) {
            if (i + 1 < rows.length) {
              rowGroups.push([rows[i], rows[i + 1]]);
            } else {
              rowGroups.push([rows[i]]);
            }
          }
        } else {
          for (let i = 0; i < rows.length; i += 1) {
            rowGroups.push([rows[i]]);
          }
        }

        // Get current sort direction
        const currentDir = header.getAttribute('data-direction');
        let newDir;
        if (!currentDir) {
          newDir = 'asc';
        } else if (currentDir === 'asc') {
          newDir = 'desc';
        } else {
          newDir = null;
        }

        // Remove direction arrows from all headers
        headers.forEach(h => {
          h.removeAttribute('data-direction');
          h.classList.remove('sort-asc', 'sort-desc');
        });

        // Add direction arrow to clicked header if sorting
        if (newDir) {
          header.setAttribute('data-direction', newDir);
          header.classList.add(newDir === 'asc' ? 'sort-asc' : 'sort-desc');
        }

        // Store original order on first sort
        if (!table.originalOrder) {
          table.originalOrder = [...rowGroups];
        }

        // Sort the row groups if direction specified, otherwise restore original order
        if (newDir) {
          rowGroups.sort((a, b) => {
            const columnIndex = Array.from(headers).indexOf(header) + 1;
            const aCell = a[0].querySelector(`td:nth-child(${columnIndex})`);
            const bCell = b[0].querySelector(`td:nth-child(${columnIndex})`);

            // Check if this column should be sorted numerically
            const numericColumns = ['cookies', 'instances', 'hits', 'frames'];
            const sortKey = header.getAttribute('data-sort');
            if (numericColumns.includes(sortKey)) {

              // Extract numbers from text content, defaulting to 0 if not found
              const aNum = parseInt((aCell?.textContent.match(/\d+/) || [0])[0]);
              const bNum = parseInt((bCell?.textContent.match(/\d+/) || [0])[0]);

              return newDir === 'asc' ? aNum - bNum : bNum - aNum;
            }
            if (sortKey === 'certificate') {
              const aExpiryDays = parseInt(aCell.getAttribute('data-expiry-days'));
              const bExpiryDays = parseInt(bCell.getAttribute('data-expiry-days'));
              return newDir === 'asc' ? aExpiryDays - bExpiryDays : bExpiryDays - aExpiryDays;
            }
            if (sortKey === 'compliant-count') {
              // Extract both numbers from "X / Y" format
              const aMatch = aCell?.textContent.match(/(\d+)\s*\/\s*(\d+)/);
              const bMatch = bCell?.textContent.match(/(\d+)\s*\/\s*(\d+)/);
              const aFirst = aMatch ? parseInt(aMatch[1]) : 0;
              const bFirst = bMatch ? parseInt(bMatch[1]) : 0;
              const aSecond = aMatch ? parseInt(aMatch[2]) : 0;
              const bSecond = bMatch ? parseInt(bMatch[2]) : 0;
              // Sort by first number, then by second number if first are equal
              if (aFirst !== bFirst) {
                return newDir === 'asc' ? aFirst - bFirst : bFirst - aFirst;
              }
              return newDir === 'asc' ? aSecond - bSecond : bSecond - aSecond;
            }
            if (sortKey === 'timeStampFormatted') {
              const aDateTime = parseMyDate(aCell.textContent);
              const bDateTime = parseMyDate(bCell.textContent);
              return newDir === 'asc' ? aDateTime - bDateTime : bDateTime - aDateTime;
            }

            // Handle cases where cells may not exist
            const aValue = aCell ? aCell.textContent.trim() : '';
            const bValue = bCell ? bCell.textContent.trim() : '';

            if (newDir === 'asc') {
              return aValue.localeCompare(bValue);
            } else {
              return bValue.localeCompare(aValue);
            }
          });
        } else {
          // Restore original order by copying values
          rowGroups.length = 0;
          table.originalOrder.forEach(group => rowGroups.push(group));
        }

        // Clear and re-append rows
        tbody.innerHTML = '';
        rowGroups.forEach(group => {
          group.forEach(row => {
            tbody.appendChild(row);
          });
        });
      });
    });
  });
}

function checkCertificateExpiry(validTo) {
  const now = Date.now();
  const expiryDate = new Date(validTo * 1000); // Convert to milliseconds
  const daysUntilExpiry = Math.floor((expiryDate - now) / (1000 * 60 * 60 * 24));

  return {
    daysUntilExpiry,
    isExpiring: daysUntilExpiry <= 30, // Warning for certificates expiring within 30 days
    isExpired: daysUntilExpiry <= 0
  };
}
