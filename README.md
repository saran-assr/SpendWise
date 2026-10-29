# SpendWise — Personal Finance Management & Intelligent Expense Analytics

> *"Understand your money. Control your spending. Build your future."*

SpendWise is a modern personal finance management and expense analytics web application designed for students, salaried employees, freelancers, and young professionals. It empowers users to understand their financial standing, track transactions, configure category budgets, automate recurring finances with idempotency protection, reach milestone savings goals, and glean data-driven insights.

---

## 🌟 Key Features

1. **Overview & Analytics Dashboard**
   - 4 Top KPI Cards: Total Inflow, Total Outflow, Net Cash Flow, and Savings Rate (`(Income - Expenses) / Income * 100`).
   - 6-Month Income vs Expense chronological trajectory chart.
   - Expense Category Distribution Donut Chart.
   - Rule-based financial spending insights (e.g. top spending categories, month-over-month variances, budget alerts).
   - Real-time recent ledger entries & active savings milestones.

2. **Transaction Ledger & Filtering**
   - Record both Income and Expense entries with decimal precision.
   - Strict validation: amount > 0, category must match transaction type, date integrity.
   - Multi-filtering: search by description/notes, transaction type, category, payment method, date range.
   - Multi-column sorting (date, amount, description) and responsive pagination.
   - One-click CSV export with spreadsheet formula-injection protection (`=, +, -, @`).

3. **Categories Studio**
   - Sensible default system categories for Income and Expense.
   - Custom category creator with dynamic Lucide icon picker and distinct color swatches.
   - Relational safety: protects foreign-key integrity by rejecting deletion if transactions or budgets depend on the category.

4. **Budget Management**
   - Monthly category limits and overall monthly expense ceilings.
   - Live utilization progress bars (`<80%`: On track, `80% - 99.99%`: Approaching limit, `>=100%`: Budget exceeded).
   - Dynamic spending calculation from transactions matching month and category.
   - Duplicate prevention for identical user, category, and month/year combinations.

5. **Savings Goals**
   - Goal targets with visual progress (0% - 100%), remaining balances, and countdown dates.
   - Deposit and withdrawal workflows with balance protection (withdrawals cannot make goal balance negative).
   - Celebratory confetti effects upon 100% goal completion.
   - Dedicated contribution audit log history.

6. **Recurring Engine**
   - Automate weekly, monthly, and yearly routine incomes (e.g. salary) and expenses (e.g. rent, subscriptions).
   - "Process Due Occurrences" with execution logs ensuring strict idempotency: running twice never duplicates entries.
   - Accurate date rollover handling month-end dates and leap years.

7. **In-App Notifications Center**
   - Real-time automated threshold warnings when budgets reach 80% and 100%.
   - Upcoming and overdue recurring alerts.
   - Milestone achievements with one-click direct navigation to affected modules.

8. **User Accounts & Data Portability**
   - Multi-user data isolation.
   - Pre-configured demo account ("Alex Morgan") with rich 3-month sample history.
   - 4-step onboarding wizard for newly registered users.
   - Multi-currency localization: INR (₹), USD ($), EUR (€), GBP (£), CAD (C$), AUD (A$), JPY (¥), AED, SGD.
   - Full JSON account backup and restore.

---

## 🛠️ Technology Stack

- **Frontend:** React 19, TypeScript, Vite, Tailwind CSS v4, Lucide React Icons, Recharts, Canvas-Confetti.
- **Backend / Storage Layer:** Per-user isolated client storage engine with full relational modeling, coupled with a Django REST Framework architectural reference (`DJANGO_ARCHITECTURE.md`).
- **Target Backend Integration:** Python 3.12, Django 5.x, Django REST Framework, MySQL / PostgreSQL, PyMySQL, Gunicorn.

---

## 🚀 Running SpendWise Locally

### 1. Web Application (React SPA)
\`\`\`bash
# Install dependencies
npm install

# Start Vite dev server on port 3000
npm run dev

# Build production bundle
npm run build
\`\`\`

---

## 🐍 Connecting to Django & MySQL (Backend Reference)

To connect the application to a Django REST Framework backend with MySQL:

1. Clone or refer to the Django structure documented in `DJANGO_ARCHITECTURE.md`.
2. Configure your MySQL database settings in `settings.py`:
\`\`\`python
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.mysql',
        'NAME': 'spendwise_db',
        'USER': os.environ.get('DB_USER', 'root'),
        'PASSWORD': os.environ.get('DB_PASSWORD', ''),
        'HOST': os.environ.get('DB_HOST', '127.0.0.1'),
        'PORT': os.environ.get('DB_PORT', '3306'),
    }
}
\`\`\`
3. Run migrations:
\`\`\`bash
python manage.py makemigrations
python manage.py migrate
\`\`\`
4. Seed default categories:
\`\`\`bash
python manage.py seed_categories
\`\`\`
5. Start Django development server:
\`\`\`bash
python manage.py runserver 8000
\`\`\`
