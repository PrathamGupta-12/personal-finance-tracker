# SpendWise

**SpendWise** is a personal finance management web application designed to help users track their income and expenses, manage budgets, monitor upcoming bills, set savings goals, and understand their financial habits through analytics and visual charts.

The application uses **JavaScript and browser Local Storage** to maintain financial data directly in the user's browser.

---

## Features

### Transaction Management

* Add income and expense transactions.
* Edit existing transactions.
* Delete transactions.
* Assign transactions to different categories.
* Add optional notes to transactions.
* Automatically generate unique transaction IDs.
* View recent transactions on the dashboard.
* View all transactions in a dedicated transactions section.

Transactions support categories such as:

* Food & Dining
* Salary
* Entertainment
* Utilities
* Shopping
* Investment
* Other

---

### Search, Filter & Sort

The transaction section provides multiple ways to find and organize transactions.

Users can:

* Search transactions by title.
* Search transactions by category.
* Filter by transaction type.
* Filter by category.
* Sort by:

  * Newest
  * Oldest
  * Highest amount
  * Lowest amount
* Reset all filters with a single action.

The transaction list is dynamically re-rendered whenever a search, filter, or sorting option changes.

---

### Dashboard Financial Summary

The dashboard calculates and displays:

* **Total Balance**
* **Total Income**
* **Total Expenses**
* **Savings Rate**

The application also provides financial status messages such as:

* ▲ Net Savings
* No Reserve Left
* ▼ Deficit Ahead
* ⚠️ Spending Outpaces Income
* Living Paycheck to Paycheck
* ▲ Target: 20%

The balance and savings information automatically updates whenever transactions are added, edited, or deleted.

---

### Budget Management

SpendWise allows users to set spending limits for different categories.

Default budget categories include:

* Food & Dining
* Entertainment
* Utilities
* Shopping
* Investment
* Other

For each category, the application calculates:

* Amount spent
* Budget limit
* Percentage of budget used
* Remaining amount
* Amount exceeding the budget, if applicable

A visual progress bar represents budget usage.

Budget limits are stored in Local Storage so they remain available after refreshing the page.

---

### Bill Management

Users can add upcoming bills with:

* Bill title
* Amount
* Custom emoji/icon
* Due date

The application automatically calculates the number of days remaining until the bill is due.

Bills can display:

* **Due Today**
* **Due in X Days**

Users can mark a bill as **Paid**.

When a bill is marked as paid:

1. The bill is removed from the upcoming bills list.
2. A new expense transaction is automatically created.
3. The bill is automatically categorized using keyword-based category detection.
4. Dashboard, budget, transaction, and analytics information is updated.

---

### Savings Goals

SpendWise includes a savings-goal system.

Users can create a goal with:

* Goal title
* Target amount
* Initial amount
* Custom emoji/icon

The application calculates the percentage completed and displays a progress bar.

Incomplete goals show:

> Saved amount / Target amount

and the remaining amount required to reach the target.

Users can also use **Add Funds** to contribute additional money toward a goal.

The application prevents users from adding more money than the remaining target amount.

Once the target is reached, the goal is displayed as:

**Target Achieved!**

---

### Financial Analytics

The analytics section provides an overview of spending behavior.

It calculates:

* Total income
* Total expenses
* Expense distribution by category
* Percentage of total expenses spent in each category
* Income-to-expense ratio

Each expense category is represented with a percentage and visual progress bar.

---

### Cash Flow Chart

SpendWise includes a dynamic income and expense bar chart.

Users can select a chart period, and the application generates daily financial data for that period.

The chart displays:

* Income
* Expenses
* Daily values
* Date/day labels
* Income and expense legend

The chart automatically updates whenever transaction data changes.

---

### Theme Toggle

The application includes a theme toggle that switches between:

* Light Theme
* Dark Theme

The JavaScript dynamically changes the interface by toggling the `light-theme` class on the document body.

---

## Input Validation

SpendWise contains validation for several types of user input.

### Transactions

The application validates:

* Empty transaction title
* Invalid transaction amount
* Zero or negative transaction amount
* Empty transaction date
* Future transaction dates
* Transactions older than 90 days

### Budgets

The application validates:

* Empty budget limit
* Invalid budget amount
* Zero or negative budget values

### Bills

The application validates:

* Empty bill title
* Empty or invalid bill amount
* Zero or negative bill amount
* Empty due date
* Past due dates
* Due dates more than 90 days in the future

### Savings Goals

The application validates:

* Empty goal title
* Invalid target amount
* Invalid initial amount
* Negative amounts
* Initial amount greater than or equal to the target amount
* Adding funds beyond the remaining target amount

---

## Data Storage

SpendWise uses the browser's **Local Storage** for persistent data storage.

The application stores:

* Transactions
* Bills
* Savings goals
* Budget limits

The data is converted to JSON before being stored and parsed back when the application loads.

The main storage keys used by the application include:

```text
TRANSACTIONSDATA
BILLPASSKEY
GOALSDATA
BUDGETOBJ
```

This allows the application to retain financial information even after the browser page is refreshed.

---

## Automatic Category Detection

SpendWise contains keyword-based category detection for bills.

For example, bill names containing keywords related to:

* Food and dining
* Entertainment
* Utilities
* Shopping
* Investments

can automatically be assigned to an appropriate category when the bill is marked as paid.

Examples of recognized keywords include services such as:

```text
Swiggy
Zomato
Netflix
Spotify
Electricity
Broadband
Amazon
Flipkart
SIP
Mutual Fund
```

If no matching keyword is found, the bill is categorized as **Other**.

---

## Technologies Used

* **HTML5** — Application structure and interface
* **CSS3** — Styling, layout, themes, cards, tables, progress bars and charts
* **JavaScript (ES6+)** — Application logic and dynamic UI
* **Local Storage API** — Persistent browser-side data storage
* **DOM Manipulation** — Dynamic rendering of transactions, budgets, bills, goals and analytics
* **Crypto API** — Generation of unique IDs using `crypto.randomUUID()`

---

## Project Structure

A typical project structure can be:

```text
SpendWise/
│
├── index.html
├── style.css
├── script.js
└── README.md
```

### `index.html`

Contains the structure of the SpendWise application, including dashboards, forms, modals, transaction tables, budget sections, bills, goals and analytics containers.

### `style.css`

Controls the visual appearance of the application, including layouts, cards, buttons, themes, progress bars, tables and charts.

### `script.js`

Contains the application's main functionality, including transaction management, budget calculations, bill handling, savings goals, analytics, chart generation, validation and Local Storage operations.

---

## How to Run

1. Download or clone the project.
2. Make sure the HTML, CSS and JavaScript files are in the correct project structure.
3. Open `index.html` in a modern web browser.
4. Start adding transactions, budgets, bills and savings goals.

No backend server or database is required because the application stores its data in the browser's Local Storage.

---

## Application Workflow

```text
                    ┌─────────────────┐
                    │    SpendWise    │
                    └────────┬────────┘
                             │
          ┌──────────────────┼──────────────────┐
          │                  │                  │
          ▼                  ▼                  ▼
   Transactions          Budgets              Bills
          │                  │                  │
          │                  │                  ▼
          │                  │             Mark as Paid
          │                  │                  │
          │                  │                  ▼
          │                  │            New Expense
          │                  │                  │
          └──────────────┬───┴──────────────────┘
                         │
                         ▼
                  Financial Analytics
                         │
              ┌──────────┴──────────┐
              ▼                     ▼
        Category Analysis       Cash Flow Chart
              │
              ▼
         Financial Insights
```

---

## Project Objectives

The main objectives of SpendWise are to:

* Simplify personal expense tracking.
* Help users understand their spending patterns.
* Provide category-wise budget monitoring.
* Track upcoming financial obligations.
* Encourage saving through financial goals.
* Provide visual financial insights.
* Demonstrate practical use of JavaScript and browser APIs.
* Maintain data without requiring a backend database.

---

## Future Improvements

Possible future improvements include:

* User authentication and multiple accounts
* Cloud database integration
* Monthly financial reports
* Export transactions to CSV/PDF
* Recurring transactions
* Recurring bills
* More advanced charts
* Budget notifications
* Goal deadlines
* Monthly spending comparisons
* Data backup and restore
* Mobile/PWA support
* Backend API integration

---

## Important Note

SpendWise currently stores its information in the browser's **Local Storage**. Therefore, the application's data is tied to the browser/device where it was created and is not automatically synchronized across different devices.

---

## License

This project is intended for educational and personal project purposes.
