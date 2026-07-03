// Expense Tracker Application
class ExpenseTracker {
    constructor() {
        this.transactions = [];
        this.loadFromLocalStorage();
        this.initializeElements();
        this.attachEventListeners();
        this.setTodayDate();
        this.render();
    }

    initializeElements() {
        this.form = document.getElementById('transactionForm');
        this.descriptionInput = document.getElementById('description');
        this.amountInput = document.getElementById('amount');
        this.categorySelect = document.getElementById('category');
        this.typeRadios = document.querySelectorAll('input[name="type"]');
        this.dateInput = document.getElementById('date');
        this.transactionsList = document.getElementById('transactionsList');
        this.incomeAmount = document.querySelector('.income-amount');
        this.expenseAmount = document.querySelector('.expense-amount');
        this.balanceAmount = document.querySelector('.balance-amount');
        this.filterType = document.getElementById('filterType');
        this.filterCategory = document.getElementById('filterCategory');
        this.clearFiltersBtn = document.getElementById('clearFilters');
        this.exportBtn = document.getElementById('exportBtn');
    }

    attachEventListeners() {
        this.form.addEventListener('submit', (e) => this.addTransaction(e));
        this.filterType.addEventListener('change', () => this.render());
        this.filterCategory.addEventListener('change', () => this.render());
        this.clearFiltersBtn.addEventListener('click', () => this.clearFilters());
        this.exportBtn.addEventListener('click', () => this.exportToCSV());
    }

    setTodayDate() {
        const today = new Date().toISOString().split('T')[0];
        this.dateInput.value = today;
    }

    addTransaction(e) {
        e.preventDefault();

        const description = this.descriptionInput.value.trim();
        const amount = parseFloat(this.amountInput.value);
        const category = this.categorySelect.value;
        const type = document.querySelector('input[name="type"]:checked').value;
        const date = this.dateInput.value;

        if (!description || !amount || !category || !date) {
            alert('Please fill in all fields');
            return;
        }

        if (amount <= 0) {
            alert('Amount must be greater than 0');
            return;
        }

        const transaction = {
            id: Date.now(),
            description,
            amount,
            category,
            type,
            date,
            timestamp: new Date()
        };

        this.transactions.unshift(transaction);
        this.saveToLocalStorage();
        this.form.reset();
        this.setTodayDate();
        this.render();
    }

    deleteTransaction(id) {
        if (confirm('Are you sure you want to delete this transaction?')) {
            this.transactions = this.transactions.filter(t => t.id !== id);
            this.saveToLocalStorage();
            this.render();
        }
    }

    getFilteredTransactions() {
        const selectedType = this.filterType.value;
        const selectedCategory = this.filterCategory.value;

        return this.transactions.filter(transaction => {
            const typeMatch = !selectedType || transaction.type === selectedType;
            const categoryMatch = !selectedCategory || transaction.category === selectedCategory;
            return typeMatch && categoryMatch;
        });
    }

    calculateTotals() {
        let income = 0;
        let expenses = 0;

        this.transactions.forEach(transaction => {
            if (transaction.type === 'income') {
                income += transaction.amount;
            } else {
                expenses += transaction.amount;
            }
        });

        return {
            income: income.toFixed(2),
            expenses: expenses.toFixed(2),
            balance: (income - expenses).toFixed(2)
        };
    }

    formatCurrency(amount) {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD'
        }).format(amount);
    }

    formatDate(dateString) {
        const options = { year: 'numeric', month: 'short', day: 'numeric' };
        return new Date(dateString + 'T00:00:00').toLocaleDateString('en-US', options);
    }

    render() {
        this.updateSummary();
        this.renderTransactions();
    }

    updateSummary() {
        const { income, expenses, balance } = this.calculateTotals();
        this.incomeAmount.textContent = this.formatCurrency(income);
        this.expenseAmount.textContent = this.formatCurrency(expenses);
        
        this.balanceAmount.textContent = this.formatCurrency(balance);
        this.balanceAmount.style.color = balance >= 0 ? '#4caf50' : '#f44336';
    }

    renderTransactions() {
        const filteredTransactions = this.getFilteredTransactions();

        if (filteredTransactions.length === 0) {
            this.transactionsList.innerHTML = '<p class="no-transactions">No transactions found. Add one to get started!</p>';
            return;
        }

        this.transactionsList.innerHTML = filteredTransactions.map(transaction => `
            <div class="transaction-item ${transaction.type}">
                <div class="transaction-info">
                    <span class="transaction-description">${this.escapeHtml(transaction.description)}</span>
                    <span class="transaction-category">${transaction.category}</span>
                    <span class="transaction-date">${this.formatDate(transaction.date)}</span>
                </div>
                <span class="transaction-amount ${transaction.type}">
                    ${transaction.type === 'income' ? '+' : '-'}${this.formatCurrency(transaction.amount)}
                </span>
                <button class="btn-delete" onclick="tracker.deleteTransaction(${transaction.id})">Delete</button>
            </div>
        `).join('');
    }

    clearFilters() {
        this.filterType.value = '';
        this.filterCategory.value = '';
        this.render();
    }

    exportToCSV() {
        if (this.transactions.length === 0) {
            alert('No transactions to export!');
            return;
        }

        let csv = 'Date,Description,Category,Type,Amount\n';

        this.transactions.forEach(transaction => {
            const row = [
                transaction.date,
                `"${transaction.description}"`,
                transaction.category,
                transaction.type.toUpperCase(),
                transaction.amount
            ].join(',');
            csv += row + '\n';
        });

        const element = document.createElement('a');
        element.setAttribute('href', 'data:text/csv;charset=utf-8,' + encodeURIComponent(csv));
        element.setAttribute('download', `expense-tracker-${new Date().toISOString().split('T')[0]}.csv`);
        element.style.display = 'none';
        document.body.appendChild(element);
        element.click();
        document.body.removeChild(element);
    }

    saveToLocalStorage() {
        localStorage.setItem('expenseTrackerData', JSON.stringify(this.transactions));
    }

    loadFromLocalStorage() {
        const data = localStorage.getItem('expenseTrackerData');
        this.transactions = data ? JSON.parse(data) : [];
    }

    escapeHtml(text) {
        const map = {
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            '"': '&quot;',
            "'": '&#039;'
        };
        return text.replace(/[&<>"']/g, m => map[m]);
    }
}

// Initialize the expense tracker when DOM is ready
let tracker;
document.addEventListener('DOMContentLoaded', () => {
    tracker = new ExpenseTracker();
});
