const transactionPassKey = 'TRANSACTIONSDATA';
const billPassKey = 'BILLPASSKEY';
const GOALSPASSKEY = 'GOALSDATA';
const goalsData = JSON.parse(localStorage.getItem(GOALSPASSKEY)) ||[];
const transactions = JSON.parse(localStorage.getItem(transactionPassKey)) || [];
const billData = JSON.parse(localStorage.getItem(billPassKey)) || [];

let goalCount = 1;
let editedTransaction = null;
let currentActiveGoal = null;

const foodAndDiningRegex = /\b(swiggy|zomato|instamart|blinkit|zepto|milkbasket|bigbasket|grofers|tiffin|mess|restaurant|cafe|dining|dabbawala)\b/i;

const entertainmentRegex = /\b(netflix|prime|spotify|youtube|disney|hotstar|sonyliv|zee5|bookmyshow|cable|apple\s?music|playstation|xbox|steam|cinema)\b/i;

const utilitiesRegex = /\b(electricity|power|water|gas|cylinder|png|lpg|broadband|wifi|fiber|postpaid|recharge|maintenance|rent)\b/i;

const shoppingRegex = /\b(amazon|flipkart|myntra|ajio|nykaa|zudio|trends|mall|clothing|grocery)\b/i;
const investmentRegex = /\b(sip|mutual\s?fund|zerodha|groww|upstox|ppf|nps|stock|fd|rd|lic|insurance)\b/i;

const emojiRegex = /^(\p{Extended_Pictographic}|\p{Emoji_Component})+$/u;

const openAddTransactionBtn = document.getElementById('openAddTransactionBtn');
const transactionModal = document.getElementById('transactionModal');

document.addEventListener('DOMContentLoaded' , () => {

    renderBudgetLimit();
    renderRecentTransactions();
    renderSortTransactions();
    updateTotalBalanceIncomeExpense();
    renderBills();
    renderGoals();
    renderAnalytics();
    renderCashFlowChart();
})

openAddTransactionBtn.addEventListener('click' , () => {
    
    toggleAddEditModal('add');
    resetInputs();
    resetErrors();
    transactionModal.style.display = 'flex';
})

const categoryIconDict = {
    'Food & Dining' : '🍔',
    'Salary' : '💼',
    'Entertainment' : '🎧',
    'Utilities' : '🛠️',
    'Shopping' : '🛒',
    'Investment' : '📊',
    'Other' : '🗃️'
}

const sampleBudgetDict = {
    'Food & Dining' : 8000,
    'Entertainment' : 3000,
    'Utilities' : 6000,
    'Shopping' : 8000,
    'Investment' : 20000,
    'Other' : 2000
}

const budgetLimitDict = JSON.parse(localStorage.getItem('BUDGETOBJ')) || sampleBudgetDict;

const cancelModalBtn = document.getElementById('cancelModalBtn');

cancelModalBtn.addEventListener('click' , () => {

    transactionModal.style.display = 'none';
    resetInputs();
    resetErrors();
})

const closeModalBtn = document.getElementById('closeModalBtn');

closeModalBtn.addEventListener('click' , () => {

    transactionModal.style.display = 'none';
    resetInputs();
    resetErrors();
})

const modalTitle = document.getElementById('modalTitle');
const saveTransactionBtn = document.getElementById('saveTransactionBtn');

function toggleAddEditModal(source){

    if (source === 'add') {
        modalTitle.textContent = 'Add Transactions';
        saveTransactionBtn.innerText = 'Save Entry';
    } else {
        modalTitle.textContent = 'Edit Transactions';
        saveTransactionBtn.innerText = 'Update Entry';
    }
}

// Input Boxes

const txTitle = document.getElementById('txTitle');
const txAmount = document.getElementById('txAmount');
const txType = document.getElementById('txType');
const txCategory = document.getElementById('txCategory');
const txDate = document.getElementById('txDate');
const txNotes = document.getElementById('txNotes');

// Error Boxes

const txTitleError = document.getElementById('txTitleError');
const txAmountError = document.getElementById('txAmountError');
const txDateError = document.getElementById('txDateError');

function validateTransactionDate(dateInputString) {

    if (!dateInputString) {
        return [null, "Transaction date cannot be empty."];
    }

    const selectedDate = new Date(dateInputString);
  
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    selectedDate.setHours(0, 0, 0, 0);

    if (selectedDate > today) {
        return [null, "Transaction date cannot be in the future."];
    }

    const maxPastDays = 90;
    const cutoffDate = new Date(today);
    cutoffDate.setDate(today.getDate() - maxPastDays);

    if (selectedDate < cutoffDate) {
        return [null, `Transaction date cannot be older than ${maxPastDays} days.`];
    }

    return [dateInputString, null];
}

function validateTitle(inputTitle) {

    if (!inputTitle) {
        return [null , 'Transaction Title is required.'];
    }

    return [inputTitle , null];
}

function validateAmount(inputAmount) {

    if (!inputAmount) {
        return [null , 'Transaction Amount is required.'];
    }

    const amount = Number(inputAmount);

    if (isNaN(amount)) {
        return [null , 'Invalid Amount entered'];
    }

    if (amount <= 0) {
        return [null , 'Transaction Amount cannot be zero or negative.'];
    }

    return [amount , null];
}

function validateAllInputs() {

    resetErrors();

    const inputTitle = txTitle.value.trim();

    let [title , titleError] = validateTitle(inputTitle);
    if (titleError) {
        txTitleError.textContent = titleError;
        return;
    }

    const inputAmount = txAmount.value.trim();

    let [amount , amountError] = validateAmount(inputAmount);

    if (amountError) {
        txAmountError.textContent = amountError;
        return;
    }

    const transactionType = txType.value;

    const transactionCategory = txCategory.value;

    const inputDate = txDate.value;

    let [transactionDate , error] = validateTransactionDate(inputDate);

    if (error){
        txDateError.textContent = error;
        return;
    }

    const additionalInfo = txNotes.value.trim() || 'Not Available';

    if (editedTransaction) {

        const index = transactions.indexOf(editedTransaction);
        transactions[index] = {
            'id' : editedTransaction.id,
            'name' : title,
            'amount' : amount,
            'category' : transactionCategory,
            'type' : transactionType,
            'date' : transactionDate,
            'note' : additionalInfo, 
        }

        editedTransaction = null;
    } else {

        const transactionID = crypto.randomUUID();
    
        const transactionData = {
            'id' : transactionID,
            'name' : title,
            'amount' : amount,
            'type' : transactionType,
            'category' : transactionCategory,
            'date' : transactionDate,
            'note' : additionalInfo
        }
    
        transactions.push(transactionData);
    }

    localStorage.setItem(transactionPassKey , JSON.stringify(transactions));

    updateTotalBalanceIncomeExpense();
    renderRecentTransactions();
    renderBudgetLimit();
    renderSortTransactions();
    renderAnalytics();
    renderCashFlowChart();

    transactionModal.style.display = 'none';

}   

saveTransactionBtn.addEventListener('click' , (e) => {

    e.preventDefault();

    validateAllInputs();
})

function resetInputs() {

    txTitle.value = '';
    txAmount.value = '';
    txType.value = 'expense';
    txCategory.value = 'Food & Dining';
    txDate.value = '';
    txNotes.value = '';

}

function resetErrors(){

    txTitleError.textContent = '';
    txAmountError.textContent = '';
    txDateError.textContent = ''
}

const dashTotalBalance = document.getElementById('dashTotalBalance');
const dashTotalIncome = document.getElementById('dashTotalIncome');
const dashTotalExpenses = document.getElementById('dashTotalExpenses');
const dashSavingsRate = document.getElementById('dashSavingsRate');
const dashTotalBalanceByLine = document.getElementById('dashTotalBalanceByLine');
const dashSavingsRateByLine = document.getElementById('dashSavingsRateByLine');

function getSavingsRate(netIncome , netExpense) {

    if (netIncome === 0) {
        return 0;
    }

    const savingRate = (((netIncome - netExpense) / netIncome) * 100).toFixed(2);
    return savingRate;
}

function updateTotalBalanceIncomeExpense(){

    let totalIncome = 0;
    let totalExpense = 0;

    for (let transaction of transactions) {
        if (transaction.type === 'expense') {
            totalExpense += transaction.amount;
        } else {
            totalIncome += transaction.amount;
        }
    }

    const totalBalance = totalIncome - totalExpense;

    dashTotalIncome.textContent = `₹${totalIncome}`;
    dashTotalExpenses.textContent = `₹${totalExpense}`;

    dashTotalBalance.textContent = `₹${totalBalance}`;

    if (totalBalance > 0) {
        dashTotalBalanceByLine.textContent = '▲ Net Savings';
    } else if (totalBalance === 0) {
        dashTotalBalanceByLine.textContent = 'No Reserve Left';
    } else {
        dashTotalBalanceByLine.textContent = '▼ Deficit Ahead';
    }

    let savingRate = parseFloat(getSavingsRate(totalIncome , totalExpense));

    if (totalBalance < totalExpense) {
        dashSavingsRateByLine.textContent = '⚠️ Spending Outpaces Income';
    } else if (totalBalance === totalExpense) {
        dashSavingsRateByLine.textContent = 'Living Paycheck to Paycheck';
    } else {
        dashSavingsRateByLine.textContent = '▲ Target: 20%';
    }

    totalIncome !== 0 ? dashSavingsRate.textContent = `${savingRate}%` : dashSavingsRate.textContent = `N/A`; 
}

const themeToggleBtn = document.getElementById('themeToggleBtn');
const themeIcon = document.getElementById('themeIcon');
const themeText = document.getElementById('themeText');

let isDarkModeOn = false;

themeToggleBtn.addEventListener('click' , () => {

    if (!isDarkModeOn) {
        themeIcon.textContent = '☾⋆.˚';
        themeText.textContent = 'Dark Theme';
    } else {
        themeIcon.textContent = '⋆✴︎';
        themeText.textContent = 'Light Theme';
    }

    isDarkModeOn = !isDarkModeOn;
    document.body.classList.toggle('light-theme'); 
})

const recentEmptyState = document.getElementById('recentEmptyState');

function renderRecentTransactions(){

    recentTransactionsContainer.innerHTML = '';

    if (transactions.length === 0){
        recentEmptyState.style.display = 'block';
        return;
    } else {
        recentEmptyState.style.display = 'none';
    }

    if (transactions.length === 0) {
        recentEmptyState.style.display = 'block';
        return;
    } else {
        recentEmptyState.style.display = 'none';
    }

    let duplicateData = [...transactions];

    duplicateData.sort((a , b) => {
        return new Date(b.date) - new Date(a.date);
    })

    if (duplicateData.length <= 5) {
        displayRecentTransactions(duplicateData)
    } else {
        duplicateData = duplicateData.slice(0 , 5);
        displayRecentTransactions(duplicateData);
    }
}

const recentTransactionsContainer = document.getElementById('recentTransactionsContainer');

function displayRecentTransactions(transactionData) {

    for (let transaction of transactionData) {

        let transactionCard = document.createElement('div');

        transactionCard.classList.add('transaction-card');
        transactionCard.innerHTML = `
            <div class="tx-info-group">
                <div class="tx-icon-wrapper ${transaction['type']}-bg">
                    <span class="tx-icon">${categoryIconDict[transaction.category]}</span>
                </div>

                <div class="tx-details">
                    <strong class="tx-title">${transaction.name}</strong>
                    <div class="tx-meta">
                        <span class="tx-category">${transaction.category}</span>
                        <span class="tx-dot">•</span>
                        <span class="tx-date">${transaction.date}</span>
                    </div>
                </div>
            </div>

            <div class="tx-amount-group">
                <span class="tx-amount ${transaction['type']}-text">
                    ${transaction['type'] === 'income'
                        ? `₹ +${transaction['amount']}`
                        : `₹ -${transaction['amount']}`
                    }
                </span>
                <span class="badge ${transaction['type']}">${transaction['type']}</span>
            </div>
        
        `
        recentTransactionsContainer.appendChild(transactionCard);
    }
}

const quickBudgetContainer = document.getElementById('quickBudgetContainer');
const fullBudgetList = document.getElementById('fullBudgetList');

function renderBudgetLimit() {

    quickBudgetContainer.innerHTML = '';
    fullBudgetList.innerHTML = '';

    const budgetCategories = ['Food & Dining', 'Entertainment', 'Utilities', 'Shopping', 'Investment', 'Other'];

    for (let category of budgetCategories) {
        const totalSpent = transactions
            .filter(tx => tx.category === category && tx.type === 'expense')
            .reduce((sum, tx) => sum + tx.amount, 0);

        if (totalSpent !== 0) {
            displayBudgetLimit(category, totalSpent);
        }

        displayBudgetLimitForBudgetView(category , totalSpent)
    }
}

function displayBudgetLimit(category, totalSpent) {

    const limit = parseFloat(budgetLimitDict[category]) || 1;
    const usagePercentage = parseFloat(((totalSpent / limit) * 100).toFixed(1));
    const barWidth = Math.min(usagePercentage, 100);
    const remainingAmount = limit - totalSpent;

    const isOver = remainingAmount < 0;
    const remainingText = isOver 
        ? `⚠️ Over Budget by ₹${Math.abs(remainingAmount).toLocaleString('en-IN')}`
        : `₹${remainingAmount.toLocaleString('en-IN')} remaining`;
    
    const tag = isOver ? 'expense' : 'income';

    let budgetCard = document.createElement('div');
    budgetCard.classList.add('goal-card');

    budgetCard.innerHTML = `
        <div class="goal-header">
            <div class="bill-info">
                <span class="bill-icon">${categoryIconDict[category] || '🗃️'}</span>
                <strong>${category}</strong>
            </div>
            <span class="goal-badge">${usagePercentage}% Used</span>
        </div>

        <div class="goal-amount">
            Spent: <strong>₹${totalSpent.toLocaleString('en-IN')}</strong> of ₹${limit.toLocaleString('en-IN')}
        </div>

        <div class="progress-bar-track">
            <div class="progress-bar-fill" style="width: ${barWidth}%;"></div>
        </div>

        <div class="stat-foot" style="margin-top: 8px;">
            <span class="${tag}-text">${remainingText}</span>
        </div>
    `;

    quickBudgetContainer.appendChild(budgetCard);
}

const transactionsNav = document.getElementById('transactionsNav');

transactionsNav.addEventListener('click' , () => {

    viewToSet('transactionsView' , 'transactionsNav');
})

const dashboardNav = document.getElementById('dashboardNav');

dashboardNav.addEventListener('click' , () => {

    viewToSet('dashboardView' , 'dashboardNav');
})

const viewAllTransactionsBtn = document.getElementById('viewAllTransactionsBtn');

viewAllTransactionsBtn.addEventListener('click' , () => {

    viewToSet('transactionsView' , 'transactionsNav');
})


function viewToSet(sourceView , sourceButton) {

    const currentVisibleView = document.querySelector('.page-view.active-view');
    const viewToMakeVisible = document.getElementById(sourceView);

    currentVisibleView.classList.remove('active-view');
    viewToMakeVisible.classList.add('active-view');

    const currentVisibleButton = document.querySelector('.nav-item.active');
    const buttonToMakeVisible = document.getElementById(sourceButton);

    currentVisibleButton.classList.remove('active');
    buttonToMakeVisible.classList.add('active');

}

const sortTransactionsSelect = document.getElementById('sortTransactionsSelect');
const transactionsTableBody = document.getElementById('transactionsTableBody');

function renderSortTransactions(){

    const sortValue = sortTransactionsSelect.value;

    let duplicateData = [...transactions];
    if (sortValue === 'newest') {
        duplicateData.sort((a , b) => {
            return new Date(b.date) - new Date(a.date);
        })
    } else if (sortValue === 'oldest') {
        duplicateData.sort((a , b) => {
            return new Date(a.date) - new Date(b.date);
        })
    } else if (sortValue === 'highest') {
        duplicateData.sort((a , b) => {
            return b.amount - a.amount;
        })
    } else if (sortValue === 'lowest') {
        duplicateData.sort((a , b) => {
            return a.amount - b.amount;
        })
    }

    filterByCategory(duplicateData);

}

const categoryFilterSelect = document.getElementById('categoryFilterSelect');

function filterByCategory(duplicateData) {

    const filterValue = categoryFilterSelect.value;

    if (filterValue === 'all'){
        filterByType(duplicateData);
        return;
    }

    duplicateData = duplicateData.filter(transaction => transaction.category === filterValue);
    filterByType(duplicateData);

}

const typeFilterSelect = document.getElementById('typeFilterSelect');

function filterByType(duplicateData){

    const filterValue = typeFilterSelect.value;

    if (filterValue === 'all') {
        searchInData(duplicateData);
        return;
    }

    duplicateData = duplicateData.filter(transaction => transaction.type === filterValue);
    searchInData(duplicateData);
}

const transactionSearchInput = document.getElementById('transactionSearchInput');
const tableEmptyState = document.getElementById('tableEmptyState');

function searchInData(duplicateData){

    const searchText = transactionSearchInput.value.trim().toLowerCase();

    duplicateData = duplicateData.filter(transaction => transaction.name.toLowerCase().includes(searchText) || transaction.category.toLowerCase().includes(searchText))

    transactionsTableBody.innerHTML = '';

    if (duplicateData.length === 0) {
        tableEmptyState.style.display = 'block';
        return;
    }
    tableEmptyState.style.display = 'none';
    for (let transaction of duplicateData) {
        displayTransactionsInViewTab(transaction);
    }
}

function displayTransactionsInViewTab(transaction) {
    let row = document.createElement('tr');
    row.dataset.id = transaction.id;

    row.innerHTML = `
        <td>
            <div class="tx-info-group">
                <div class="tx-icon-wrapper ${transaction.type}-bg">
                    <span class="tx-icon">${categoryIconDict[transaction.category] || '🗃️'}</span>
                </div>
                <div class="tx-details">
                    <strong class="tx-title">${transaction.name}</strong>
                    <small class="tx-notes">${transaction.note}</small>
                </div>
            </div>
        </td>
        <td>
            <span class="tx-category">${transaction.category}</span>
        </td>
        <td>
            <span class="tx-date">${transaction.date}</span>
        </td>
        <td>
            <span class="badge ${transaction.type}">${transaction.type}</span>
        </td>
        <td>
            <strong class="tx-amount ${transaction.type}-text">${transaction.type === 'income' 
                ? `₹ +${transaction.amount}`
                : `₹ -${transaction.amount}`
            }</strong>
        </td>
        <td>
            <div class="tx-card-actions">
                <button class="icon-link-btn edit-tx-btn" title="Edit Entry">✏️</button>
                <button class="icon-link-btn delete-tx-btn" title="Delete Entry">🗑️</button>
            </div>
        </td>
    `;

    const deleteButton = row.querySelector('.icon-link-btn.delete-tx-btn');
    deleteButton.addEventListener('click' , () => {
        deleteTransaction(transaction);
    })

    const editButton = row.querySelector('.icon-link-btn.edit-tx-btn');
    editButton.addEventListener('click' , () => {

        toggleAddEditModal('edit');
        editedTransaction = transaction;
        fillInputsForEdit(transaction);
        transactionModal.style.display = 'flex';

    })

    transactionsTableBody.appendChild(row);
}

transactionSearchInput.addEventListener('input' , renderSortTransactions);
typeFilterSelect.addEventListener('change' , renderSortTransactions);
categoryFilterSelect.addEventListener('change' , renderSortTransactions);
sortTransactionsSelect.addEventListener('change' , renderSortTransactions);

const resetFiltersBtn = document.getElementById('resetFiltersBtn');

resetFiltersBtn.addEventListener('click' , () => {

    transactionSearchInput.value = '';
    typeFilterSelect.value = 'all';
    categoryFilterSelect.value = 'all';
    sortTransactionsSelect.value = 'newest';

    renderSortTransactions();
})

function deleteTransaction(transaction){

    for (let index = 0; index < transactions.length; index++) {
        if (transaction.id === transactions[index].id){
            transactions.splice(index , 1);
            break;
        }
    }

    localStorage.setItem(transactionPassKey , JSON.stringify(transactions));

    renderRecentTransactions();
    renderBudgetLimit();
    renderSortTransactions();
    updateTotalBalanceIncomeExpense();
    renderAnalytics();
    renderCashFlowChart();

}

const budgetsNav = document.getElementById('budgetsNav');
budgetsNav.addEventListener('click' , () => {
    viewToSet('budgetsView' , 'budgetsNav');
})

const manageBudgetsNavBtn = document.getElementById('manageBudgetsNavBtn');
manageBudgetsNavBtn.addEventListener('click' , () => {
    viewToSet('budgetsView' , 'budgetsNav');
})

const openBudgetModalBtn = document.getElementById('openBudgetModalBtn');
const budgetModal = document.getElementById('budgetModal');
openBudgetModalBtn.addEventListener('click' , () => {
    budgetModal.style.display = 'flex';

    resetBudgetError();
    resetBudgetInputs();
})

const closeBudgetModalBtn = document.getElementById('closeBudgetModalBtn');
closeBudgetModalBtn.addEventListener('click' , () => {
    budgetModal.style.display = 'none';
})

const cancelBudgetModalBtn = document.getElementById('cancelBudgetModalBtn');
cancelBudgetModalBtn.addEventListener('click' , () => {
    budgetModal.style.display = 'none';
})

const saveBudgetBtn = document.getElementById('saveBudgetBtn');
const budgetCategorySelect = document.getElementById('budgetCategorySelect');
const budgetLimitInput = document.getElementById('budgetLimitInput');

const budgetLimitError = document.getElementById('budgetLimitError');

saveBudgetBtn.addEventListener('click' , (e) => {

    e.preventDefault();
    resetBudgetError();

    const budgetCategory = budgetCategorySelect.value;
    const inputBudgetLimit = budgetLimitInput.value.trim();

    if (!inputBudgetLimit) {
        budgetLimitError.textContent = 'Budget Limit is required.';
        return;
    }

    const budgetLimit = Number(inputBudgetLimit);

    if (isNaN(budgetLimit)) {
        budgetLimitError.textContent = 'Invalid Budget Limit entered.';
        return;
    }

    if (budgetLimit <= 0) {
        budgetLimitError.textContent = 'Budget limit cannot be negative or zero.';
        return;
    }

    budgetLimitDict[budgetCategory] = budgetLimit;
    localStorage.setItem('BUDGETOBJ' , JSON.stringify(budgetLimitDict));
    resetBudgetInputs();

    budgetModal.style.display = 'none';
    renderBudgetLimit();

})

function resetBudgetInputs(){
    budgetCategorySelect.value = 'Food & Dining';
    budgetLimitInput.value = '';
}

function resetBudgetError(){
    budgetLimitError.textContent = '';
}

function displayBudgetLimitForBudgetView(category , totalSpent){

    const limit = parseFloat(budgetLimitDict[category]) || 1;
    const usagePercentage = parseFloat(((totalSpent / limit) * 100).toFixed(1));
    const barWidth = Math.min(usagePercentage, 100);
    
    let budgetCard = document.createElement('div');
    budgetCard.classList.add('budget-card');

    budgetCard.innerHTML = `
        <div class="budget-card-header">
            <div class="budget-info">
                <span class="budget-icon">${categoryIconDict[category]}</span>
                <div class="budget-title-group">
                    <strong class="budget-category">${category}</strong>
                    <span class="budget-status-badge">${usagePercentage}% Used</span>
                </div>
            </div>
            <div class="budget-amount">
                <strong class="spent-amount">₹${totalSpent}</strong>
                <span class="limit-amount">/ ₹${limit}</span>
            </div>
        </div>

        <div class="progress-bar-track">
            <div class="progress-bar-fill" style="width: ${barWidth}%;"></div>
        </div>
    `;

    fullBudgetList.appendChild(budgetCard);
}

const addBillBtn = document.getElementById('addBillBtn');
const billModal = document.getElementById('billModal');

addBillBtn.addEventListener('click' , () => {
    resetBillErrors();
    resetBillInputs()

    billModal.style.display = 'flex';
})

const closeBillModalBtn = document.getElementById('closeBillModalBtn');

closeBillModalBtn.addEventListener('click' , () => {
    billModal.style.display = 'none';
})

const cancelBillModalBtn = document.getElementById('cancelBillModalBtn');

cancelBillModalBtn.addEventListener('click' , () => {
    billModal.style.display = 'none';
})

const saveBillBtn = document.getElementById('saveBillBtn');
const billTitle = document.getElementById('billTitle');
const billTitleError = document.getElementById('billTitleError');
const billAmount = document.getElementById('billAmount');
const billAmountError = document.getElementById('billAmountError');
const billIcon = document.getElementById('billIcon');
const billDueDate = document.getElementById('billDueDate');
const billDueDateError = document.getElementById('billDueDateError');

function validateBillDueDate(dateInputString) {

    if (!dateInputString) {
        return [null, "Bill date cannot be empty."];
    }

    const selectedDate = new Date(dateInputString);
  
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    selectedDate.setHours(0, 0, 0, 0);

    if (selectedDate < today) {
        return [null, "Bill due date cannot be in the past."];
    }

    const maxFutureDays = 90;
    const cutoffDate = new Date(today);
    cutoffDate.setDate(today.getDate() + maxFutureDays);

    if (selectedDate > cutoffDate) {
        return [null, `Bill due date cannot be greater than ${maxFutureDays} days.`];
    }

    return [dateInputString, null];
}

saveBillBtn.addEventListener('click' , (e) => {
    
    e.preventDefault();
    resetBillErrors();

    const inputTitle = billTitle.value.trim();

    if (!inputTitle) {
        billTitleError.textContent = 'Bill Title is required.';
        return;
    }

    const inputAmount = billAmount.value.trim();

    if (!inputAmount){
        billAmountError.textContent = 'Bill Amount is required.';
        return;
    }

    const amount = Number(inputAmount);
    if (isNaN(amount)){
        billAmountError.textContent = 'Invalid Amount entered.';
        return;
    }

    if (amount <= 0) {
        billAmountError.textContent = 'Bill Amount cannot be negative or zero.';
        return;
    }

    let inputBillIcon = billIcon.value.trim();
    if (!inputBillIcon){
        inputBillIcon = '🌐';
    }

    if (!emojiRegex.test(inputBillIcon)){
        inputBillIcon = '🌐';
    }

    const inputBillDueDate = billDueDate.value.trim();

    let [dueDate , error] = validateBillDueDate(inputBillDueDate);
    if (error){
        billDueDateError.textContent = error;
        return;
    }

    const billID = crypto.randomUUID();

    const billCredentials = {
        'id' : billID,
        'name' : inputTitle,
        'amount': amount,
        'icon' : inputBillIcon,
        'dueDate' : dueDate
    }

    billData.push(billCredentials);
    localStorage.setItem(billPassKey , JSON.stringify(billData));

    billModal.style.display = 'none';
    renderBills();
    resetBillInputs()
})

function resetBillErrors(){
    billTitleError.textContent = '';
    billAmountError.textContent = '';
    billDueDateError.textContent = '';
}

function resetBillInputs(){
    billTitle.value = '';
    billAmount.value = '';
    billIcon.value = '';
    billDueDate.value = '';
}

function getRemainingDays(dueDate) {

    const futureDate = new Date(dueDate);
  
    const today = new Date();
  
    futureDate.setHours(0, 0, 0, 0);
    today.setHours(0, 0, 0, 0);
  
    const diffInMs = futureDate - today;
  
    const diffInDays = Math.ceil(diffInMs / (1000 * 60 * 60 * 24));
  
    return diffInDays;
}

const upcomingBillsContainer = document.getElementById('upcomingBillsContainer');

function renderBills(){

    upcomingBillsContainer.innerHTML = '';

    for (let bill of billData) {
        let daysText;

        const remainingDays = getRemainingDays(bill.dueDate)

        if (remainingDays === 0){
            daysText = 'Due Today';
        } else {
            daysText = `Due in ${remainingDays} Days`;
        }

        displayBillCards(bill , daysText);
    }

}

function displayBillCards(bill , remainingDaysText){

    let billCard = document.createElement('div');
    billCard.classList.add('bill-card');

    billCard.innerHTML = `
        <div class="bill-info">
            <span class="bill-icon">${bill.icon}</span>
            <div>
                <strong>${bill.name}</strong>
                <small>${remainingDaysText}</small>
            </div>
        </div>
        <div class="bill-actions">
            <span class="bill-amount">₹${bill.amount}</span>
            <button class="secondary-btn small-btn mark-paid-btn" title="Mark as Paid">✓ Paid</button>
        </div>
    `

    const markAsPaidButton = billCard.querySelector('.secondary-btn.small-btn.mark-paid-btn');

    markAsPaidButton.addEventListener('click' , () => {
        markTheBillAsPaid(bill);

        const billTitle = bill.name.toLowerCase();

        let billCategory;
        if (foodAndDiningRegex.test(billTitle)){
            billCategory = 'Food & Dining';
        } else if (entertainmentRegex.test(billTitle)) {
            billCategory = 'Entertainment';
        } else if (utilitiesRegex.test(billTitle)){
            billCategory = 'Utilities';
        } else if (shoppingRegex.test(billTitle)){
            billCategory = 'Shopping';
        } else if (investmentRegex.test(billTitle)) {
            billCategory = 'Investment';
        } else {
            billCategory = 'Other';
        }

        const transactionID = crypto.randomUUID();
        const currentDate = new Date().toISOString().split('T')[0];
        const title = bill.name + ' Bill Paid';

        const billTransaction = {
            'id' : transactionID,
            'date' : currentDate,
            'name' : title,
            'amount' : bill.amount,
            'category': billCategory,
            'note' : `${bill.name} Bill Paid on ${currentDate}`,
            'type' : 'expense'

        }

        transactions.push(billTransaction);
        localStorage.setItem(transactionPassKey , JSON.stringify(transactions));

        renderBudgetLimit();
        renderRecentTransactions();
        renderSortTransactions();
        updateTotalBalanceIncomeExpense();
        renderAnalytics();
        renderCashFlowChart();

    })
    upcomingBillsContainer.appendChild(billCard);
}

function markTheBillAsPaid(bill){

    for (let index = 0; index < billData.length; index++) {
        if (bill.id === billData[index].id){
            billData.splice(index , 1);
            break;
        }
    }

    renderBills();
    localStorage.setItem(billPassKey , JSON.stringify(billData));
}

const addGoalBtn = document.getElementById('addGoalBtn');
const goalModal = document.getElementById('goalModal');

addGoalBtn.addEventListener('click' , () => {
    resetGoalErrors();
    resetGoalInputs();
    goalModal.style.display = 'flex';
})

const closeGoalModalBtn = document.getElementById('closeGoalModalBtn');
closeGoalModalBtn.addEventListener('click' , () => {
    goalModal.style.display = 'none';
})

const cancelGoalModalBtn = document.getElementById('cancelGoalModalBtn');
cancelGoalModalBtn.addEventListener('click' , () => {
    goalModal.style.display = 'none';
})

const saveGoalBtn = document.getElementById('saveGoalBtn');
const goalTitle = document.getElementById('goalTitle');
const goalTitleError = document.getElementById('goalTitleError');
const goalTargetAmount = document.getElementById('goalTargetAmount');
const goalTargetAmountError = document.getElementById('goalTargetAmountError');
const goalIcon = document.getElementById('goalIcon');
const goalInitialAmount = document.getElementById('goalInitialAmount');
const goalInitialAmountError = document.getElementById('goalInitialAmountError');

saveGoalBtn.addEventListener('click' , (e) => {

    e.preventDefault();
    resetGoalErrors();

    const inputTitle = goalTitle.value.trim();

    if (!inputTitle){
        goalTitleError.textContent = 'Goal Title is required.';
        return;
    }

    const inputTargetAmount = goalTargetAmount.value;

    if (!inputTargetAmount){
        goalTargetAmountError.textContent = 'Goal Target Amount is required.';
        return;
    }

    const targetAmount = Number(inputTargetAmount);
    if (isNaN(targetAmount)){
        goalTargetAmountError.textContent = 'Invalid Amount';
        return;
    }

    if (targetAmount <= 0){
        goalTargetAmountError.textContent = 'Goal Target Amount cannot be negative or zero.';
        return;
    }
    
    let inputIcon = goalIcon.value.trim();
    
    if (!emojiRegex.test(inputIcon)){
        inputIcon = '💾';
    }
    
    const inputInitialAmount = goalInitialAmount.value;
    if (!inputInitialAmount){
        goalInitialAmountError.textContent = 'Goal Initial Amount is required.';
        return;
    }

    const initialAmount = Number(inputInitialAmount);
    if (isNaN(initialAmount)){
        goalInitialAmountError.textContent = 'Invalid Amount';
        return;
    }

    if (initialAmount < 0){
        goalInitialAmountError.textContent = 'Goal Target Amount cannot be negative.';
        return;
    }

    if (initialAmount >= targetAmount) {
        goalInitialAmountError.textContent = 'Goal Initial Amount cannot be greater than or equal to Target Amount.';
        return;
    }

    const goalID = crypto.randomUUID();
    const transactionID = crypto.randomUUID();

    const goalCredentials = {
        'id' : goalID,
        'name' : inputTitle,
        'targetAmount' : targetAmount,
        'initialAmount' : initialAmount,
        'icon' : inputIcon,
    }

    const currentDate = new Date().toISOString().split('T')[0];
    const transaction = {
        'id' : transactionID,
        'name' : inputTitle,
        'amount' : initialAmount,
        'category' : 'Investment',
        'type' : 'expense',
        'date' : currentDate,
        'note' : `Fund raised for ${inputTitle}`
    }
    
    goalsData.push(goalCredentials);
    transactions.push(transaction);

    localStorage.setItem(transactionPassKey , JSON.stringify(transactions));
    localStorage.setItem(GOALSPASSKEY , JSON.stringify(goalsData));
    
    renderGoals();
    updateTotalBalanceIncomeExpense();
    renderRecentTransactions();
    renderSortTransactions();
    renderBudgetLimit();
    renderAnalytics();
    renderCashFlowChart();

    goalModal.style.display = 'none';
    
})

function resetGoalErrors(){
    goalTargetAmountError.textContent = '';
    goalInitialAmountError.textContent = '';
    goalTitleError.textContent = '';
}

function resetGoalInputs(){
    goalTitle.value = '';
    goalTargetAmount.value = '';
    goalIcon.value = '';
    goalInitialAmount.value = '';
}

const savingsGoalsContainer = document.getElementById('savingsGoalsContainer');
const goalsEmptyState = document.getElementById('goalsEmptyState');

function renderGoals(){

    savingsGoalsContainer.innerHTML = '';

    if(goalsData.length === 0){
        goalsEmptyState.style.display = 'block';
        return;
    } else {
        goalsEmptyState.style.display = 'none';
    }

    goalCount = 1;

    for (let goal of goalsData){
        if (goal.initialAmount < goal.targetAmount){
            displayIncompleteGoals(goal);
        } else {
            displayCompleteGoals(goal);
        }
    }

}

const addFundsModal = document.getElementById('addFundsModal');

function displayIncompleteGoals(goal){

    const completed = parseFloat(((goal.initialAmount / goal.targetAmount) * 100).toFixed(1));

    let goalCard = document.createElement('div');
    goalCard.classList.add('goal-card');
    goalCard.dataset.id = `goal_${goalCount}`;
    
    goalCard.innerHTML = `
    
        <div class="goal-header">
            <div class="goal-info">
                <span class="goal-icon">${goal.icon}</span>
                <div class="goal-title-group">
                    <strong class="goal-title">${goal.name}</strong>
                </div>
            </div>
            <span class="goal-badge">${completed}%</span>
        </div>
                
        <div class="goal-amount-details">
            <span class="current-saved">Saved: <strong>₹${goal.initialAmount}</strong></span>
            <span class="total-target">of ₹${goal.targetAmount}</span>
        </div>
                
        <div class="progress-bar-track">
            <div class="progress-bar-fill" style="width: ${completed}%;"></div>
        </div>
                
        <div class="goal-footer">
            <span class="goal-remaining">₹${goal.targetAmount - goal.initialAmount} left to reach target</span>
            <button class="secondary-btn small-btn add-funds-btn" data-goal-id="goal_${goalCount}">
                <span>+</span> Add Funds
            </button>
        </div>
                
    `;

    const addFundButton = goalCard.querySelector('.secondary-btn.small-btn.add-funds-btn');
    addFundButton.addEventListener('click' , () => {
        resetAddFundErrors();
        resetAddFundInput();
        currentActiveGoal = goal;
        addFundsModal.style.display = 'flex';
    })
                
    savingsGoalsContainer.appendChild(goalCard);
    goalCount++;
                
}
            
function displayCompleteGoals(goal){
                
    let goalCard = document.createElement('div');
    goalCard.classList.add('goal-card' , 'goal-completed');
    goalCard.dataset.id = `goal_${goalCount}`;

    goalCard.innerHTML = `

        <div class="goal-header">
            <div class="goal-info">
                <span class="goal-icon">${goal.icon}</span>
                <div class="goal-title-group">
                    <strong class="goal-title">${goal.name}</strong>
                    <span class="goal-target-date">Achieved</span>
                </div>
            </div>
            <span class="goal-badge completed-badge">100%</span>
        </div>

        <div class="goal-amount-details">
            <span class="current-saved">Saved: <strong>₹${goal.initialAmount}</strong></span>
            <span class="total-target">of ₹${goal.targetAmount}</span>
        </div>

        <div class="progress-bar-track">
            <div class="progress-bar-fill completed-fill" style="width: 100%;"></div>
        </div>

        <div class="goal-footer">
            <span class="goal-remaining positive-text">🎉 Target Achieved!</span>
            <button class="secondary-btn small-btn" disabled>Completed</button>
        </div>
    
    `;

    savingsGoalsContainer.appendChild(goalCard);
    goalCount++;
                         
}

const closeAddFundsModalBtn = document.getElementById('closeAddFundsModalBtn');
closeAddFundsModalBtn.addEventListener('click' , () => {
    addFundsModal.style.display = 'none';
})

const cancelAddFundsModalBtn = document.getElementById('cancelAddFundsModalBtn');
cancelAddFundsModalBtn.addEventListener('click' , () => {
    addFundsModal.style.display = 'none';
})

const addFundsAmount = document.getElementById('addFundsAmount');
const addFundsAmountError = document.getElementById('addFundsAmountError');

const saveAddFundsBtn = document.getElementById('saveAddFundsBtn');
saveAddFundsBtn.addEventListener('click' , (event) => {

    event.preventDefault();
    resetAddFundErrors();

    const inputAmount = addFundsAmount.value;
    if (!inputAmount){
        addFundsAmountError.textContent = `Enter the Fund before proceeding.`;
        return;
    }

    const amount = Number(inputAmount);
    if (isNaN(amount)){
        addFundsAmountError.textContent = `Invalid Amount entered.`;
        return;
    }

    if (amount <= 0){
        addFundsAmountError.textContent = 'Fund Amount cannot be negative or zero.';
        return;
    }

    if (currentActiveGoal.initialAmount + amount > currentActiveGoal.targetAmount){
        addFundsAmountError.textContent = `Maximum Fund of ₹${currentActiveGoal.targetAmount - currentActiveGoal.initialAmount} can be added. `;
        addFundsAmount.value = currentActiveGoal.targetAmount - currentActiveGoal.initialAmount;
        return;
    }

    for (let goal of goalsData){
        const targetID = currentActiveGoal.id;

        if (goal.id === targetID){
            goal.initialAmount = goal.initialAmount + amount;
            break;
        }
    }
    addFundsModal.style.display = 'none';

    const transactionID = crypto.randomUUID();
    const currentDate = new Date().toISOString().split('T')[0];

    const transaction = {
        'id' : transactionID,
        'name' : currentActiveGoal.name,
        'amount' : amount,
        'category' : 'Investment',
        'type' : 'expense',
        'date' : currentDate,
        'note' : `Fund Added for ${currentActiveGoal.name}`
    }
    transactions.push(transaction);
    renderBudgetLimit();
    renderRecentTransactions();
    renderSortTransactions();
    updateTotalBalanceIncomeExpense();
    renderGoals();
    renderAnalytics();
    renderCashFlowChart();

    localStorage.setItem(transactionPassKey , JSON.stringify(transactions));
    localStorage.setItem(GOALSPASSKEY , JSON.stringify(goalsData));

    currentActiveGoal = null;
})

function resetAddFundErrors(){
    addFundsAmountError.textContent = '';
}
function resetAddFundInput(){
    addFundsAmount.value = '';
}

const analyticsNav = document.getElementById('analyticsNav');
analyticsNav.addEventListener('click' , () => {

    viewToSet('analyticsView' , 'analyticsNav');
})

const analyticsCategoryBreakdown = document.getElementById('analyticsCategoryBreakdown');
const analyticsPanel = document.getElementById('analyticsPanel');

function renderAnalytics() {
    analyticsCategoryBreakdown.innerHTML = '';
    analyticsPanel.innerHTML = '';

    const categoryGroup = {};
    let totalExpense = 0;
    let totalIncome = 0;

    for (let transaction of transactions) {
        const category = transaction.category;
        const amount = Number(transaction.amount) || 0;

        if (transaction.type === 'expense') {
            categoryGroup[category] = (categoryGroup[category] || 0) + amount;
            totalExpense += amount;
        } else if (transaction.type === 'income') {
            totalIncome += amount;
        }
    }

    if (totalExpense === 0) {
        analyticsCategoryBreakdown.innerHTML = '<p class="empty-state">No expense data available.</p>';
    } else {
        for (let category in categoryGroup) {
            const categoryAmount = categoryGroup[category];
            const percentage = Math.round((categoryAmount / totalExpense) * 100);
            displayAnalyticsData(category, categoryAmount, percentage);
        }
    }

    const totalVolume = totalIncome + totalExpense;
    let incomePercentage = 0;
    let expensePercentage = 0;

    if (totalVolume > 0) {
        incomePercentage = Math.round((totalIncome / totalVolume) * 100);
        expensePercentage = 100 - incomePercentage;
    }

    updateRatioOverView(incomePercentage, expensePercentage);
}

function displayAnalyticsData(category, categoryAmount, percentage) {
    let categoryCard = document.createElement('div');
    categoryCard.classList.add('category-breakdown-item');

    categoryCard.innerHTML = `
        <div class="category-info">
            <div class="category-header">
                <span class="category-name">${category}</span>
                <span class="category-amount">₹${categoryAmount.toLocaleString('en-IN')} (${percentage}%)</span>
            </div>
        </div>

        <div class="progress-bar-track">
            <div class="progress-bar-fill" style="width: ${percentage}%;"></div>
        </div>
    `;

    analyticsCategoryBreakdown.appendChild(categoryCard);
}

function updateRatioOverView(incomePercentage, expensePercentage) {
    let overviewCard = document.createElement('div');
    overviewCard.classList.add('cashflow-visual');

    overviewCard.innerHTML = `
        <div class="ratio-bar-container">
            <div class="ratio-fill income-fill" id="ratioIncomeFill" style="width: ${incomePercentage}%;"></div>
            <div class="ratio-fill expense-fill" id="ratioExpenseFill" style="width: ${expensePercentage}%;"></div>
        </div>

        <div class="ratio-legend">
            <div class="legend-item">
                <span class="dot income-dot"></span>
                <span>Income (<strong id="analyticsIncomePercent">${incomePercentage}%</strong>)</span>
            </div>
            <div class="legend-item">
                <span class="dot expense-dot"></span>
                <span>Expense (<strong id="analyticsExpensePercent">${expensePercentage}%</strong>)</span>
            </div>
        </div>
    `;

    analyticsPanel.appendChild(overviewCard);
}

function fillInputsForEdit(transaction){
    txTitle.value = transaction.name;
    txAmount.value = transaction.amount;
    txType.value = transaction.type;
    txCategory.value = transaction.category;
    txDate.value = transaction.date;
    txNotes.value = transaction.note;
}

const chartPeriodSelect = document.getElementById('chartPeriodSelect');
const dashBarChart = document.getElementById('dashBarChart');

function renderCashFlowChart() {

    const periodDays = parseInt(chartPeriodSelect.value, 10) || 7;
    const today = new Date();
    today.setHours(23, 5, 59, 999);

    const daysData = [];
    for (let i = periodDays - 1; i >= 0; i--) {
        const d = new Date(today);
        d.setDate(today.getDate() - i);
        
        const dateString = d.toISOString().split('T')[0];
        const dayLabel = periodDays === 7 
            ? d.toLocaleDateString('en-US', { weekday: 'short' }) 
            : `${d.getDate()} ${d.toLocaleDateString('en-US', { month: 'short' })}`;

        daysData.push({
            date: dateString,
            label: dayLabel,
            income: 0,
            expense: 0
        });
    }

    for (let tx of transactions) {
        const match = daysData.find(day => day.date === tx.date);
        if (match) {
            const amount = Number(tx.amount) || 0;
            if (tx.type === 'income') {
                match.income += amount;
            } else if (tx.type === 'expense') {
                match.expense += amount;
            }
        }
    }

    const maxAmount = Math.max(
        ...daysData.map(d => Math.max(d.income, d.expense)),
        1
    );

    let chartHTML = `<div class="bar-chart-container">`;

    for (let day of daysData) {
        const incomeHeight = Math.round((day.income / maxAmount) * 100);
        const expenseHeight = Math.round((day.expense / maxAmount) * 100);

        chartHTML += `
            <div class="bar-group">
                <div class="bar-track">
                    <div class="bar-fill income-bar" style="height: ${incomeHeight}%;" title="Income: ₹${day.income.toLocaleString('en-IN')}"></div>
                    <div class="bar-fill expense-bar" style="height: ${expenseHeight}%;" title="Expense: ₹${day.expense.toLocaleString('en-IN')}"></div>
                </div>
                <span class="bar-label">${day.label}</span>
            </div>
        `;
    }

    chartHTML += `
        </div>
        <div class="chart-legend">
            <span class="legend-item"><i class="dot income-dot"></i> Income</span>
            <span class="legend-item"><i class="dot expense-dot"></i> Expense</span>
        </div>
    `;

    dashBarChart.innerHTML = chartHTML;
}

chartPeriodSelect.addEventListener('change', renderCashFlowChart);
