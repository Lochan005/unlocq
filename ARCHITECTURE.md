# UnLoQ1 - Architecture Documentation

## Table of Contents
1. [High-Level Architecture](#high-level-architecture)
2. [Detailed Architecture](#detailed-architecture)
3. [Data Models](#data-models)
4. [API Contracts](#api-contracts)
5. [Deployment Architecture](#deployment-architecture)

---

## High-Level Architecture

### System Overview
UnLoQ1 is a **Smart Loan Prepayment Calculator** web application that helps users analyze their loan scenarios and make informed financial decisions. The system combines frontend UI components with backend ML-powered transaction analysis and financial calculations.

### Architecture Pattern
- **Frontend**: Next.js 16.1.1 (App Router) - React-based SSR/SSG
- **Backend**: Hybrid approach
  - **Local Development**: FastAPI (Python) + Next.js API Routes (TypeScript)
  - **Production**: Python Serverless Functions (Vercel) + Next.js API Routes
- **ML Component**: Scikit-learn model for transaction categorization
- **Deployment**: Vercel (Serverless)

### Key Components
```
┌─────────────────────────────────────────────────────────┐
│                    User Browser                          │
└────────────────────┬────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────┐
│              Next.js Frontend (React)                   │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐ │
│  │   Pages      │  │  Components  │  │   Lib/Utils   │ │
│  │  (Routes)    │  │  (UI)        │  │  (Business)   │ │
│  └──────────────┘  └──────────────┘  └──────────────┘ │
└────────────────────┬────────────────────────────────────┘
                     │
         ┌───────────┴───────────┐
         │                       │
         ▼                       ▼
┌──────────────────┐   ┌──────────────────┐
│  Next.js API     │   │  Python API      │
│  Routes (TS)     │   │  Serverless      │
│  (Development)   │   │  (Production)    │
└────────┬─────────┘   └────────┬─────────┘
         │                      │
         └──────────┬───────────┘
                    │
                    ▼
         ┌──────────────────┐
         │  LoanAngel ML    │
         │  Model Service   │
         └──────────────────┘
```

### Technology Stack

**Frontend:**
- Next.js 16.1.1 (React 19.2.3)
- TypeScript 5
- Tailwind CSS 4
- Framer Motion 12.26.1 (Animations)
- Recharts 3.6.0 (Data Visualization)
- jsPDF 4.0.0 (PDF Generation)
- Decimal.js 10.6.0 (Precise Financial Calculations)

**Backend:**
- Python 3.x
- Scikit-learn 1.3.2 (ML Model)
- FastAPI (Local Development)
- Vercel Serverless Functions (Production)

**Infrastructure:**
- Vercel (Hosting & Serverless)
- Git (Version Control)

---

## Detailed Architecture

### Frontend Architecture

#### 1. Page Structure (App Router)

```
app/
├── page.tsx                    # Home page with loan input sliders
├── layout.tsx                  # Root layout with Header/Footer
├── globals.css                 # Global styles & theme
│
├── lump-sum/
│   └── page.tsx               # Lump sum prepayment calculator
├── monthly-extra/
│   └── page.tsx               # Monthly extra payment calculator
├── refinance/
│   └── page.tsx               # Refinance comparison calculator
│
├── about-us/
│   └── page.tsx               # About page
├── rewards/
│   └── page.tsx               # Rewards page
├── get-in-touch/
│   └── page.tsx               # Contact page
└── blog/
    └── page.tsx               # Blog page
```

#### 2. Component Hierarchy

**Layout Components:**
- `Header.tsx` - Navigation bar with logo and menu
- `Footer.tsx` - Footer with copyright and links

**Input Components:**
- `LoanSlider.tsx` - Reusable slider input for loan parameters
- `LoanInputs.tsx` - Form inputs for loan details
- `AnimatedInput.tsx` - Animated text input with validation
- `AnimatedToggle.tsx` - Toggle switch component

**Display Components:**
- `ResultsCard.tsx` - Card displaying calculation results
- `SavingsHighlight.tsx` - Large animated savings display
- `AnimatedNumber.tsx` - Number counter animation
- `AnimatedCharts.tsx` - Chart visualizations (Recharts)
- `ComparisionTable.tsx` - Comparison table component

**Interactive Components:**
- `AnimatedButton.tsx` - Button with hover/tap animations
- `AnimatedCard.tsx` - Card with hover effects
- `ExportButtons.tsx` - PDF/WhatsApp export functionality
- `BackButton.tsx` - Navigation back button
- `ToolTip.tsx` - Tooltip component

**Utility Components:**
- `Skeleton.tsx` - Loading skeleton
- `ResultsReveal.tsx` - Results reveal animation

#### 3. Business Logic Layer

**`app/lib/calculator.ts`**
- Core financial calculation functions
- Uses Decimal.js for precision
- Functions:
  - `calculateEMI()` - EMI calculation
  - `calculateOutstandingPrincipal()` - Outstanding balance
  - `calculateNewTenure()` - Tenure after prepayment
  - `calculateInterestSaved()` - Interest savings
  - `calculatePrepaymentScenario()` - Scenario 1A (Reduce Tenure)
  - `calculatePrepaymentScenario1B()` - Scenario 1B (Reduce EMI)
  - `calculateScenario2()` - Monthly extra payments
  - `calculateScenario3()` - Refinance comparison

**`app/lib/animation.ts`**
- Framer Motion animation presets
- Reusable animation configurations

#### 4. State Management
- **Local State**: React `useState` hooks
- **No Global State**: Each page manages its own state
- **Form State**: Controlled components with validation

### Backend Architecture

#### 1. API Structure

**Production (Vercel):**
```
api/
├── health.py                  # Health check endpoint
├── analyze.py                 # Transaction analysis endpoint
├── predict.py                 # Category prediction endpoint
├── utils/
│   └── loan_angel.py         # ML model wrapper class
└── saved_models/
    └── expense_classifier.pkl # Trained ML model
```

**Development (Local):**
```
app/api/
├── health/
│   └── route.ts              # Next.js API route (proxies to FastAPI)
├── analyze/
│   └── route.ts              # Next.js API route (proxies to FastAPI)
├── predict/
│   └── route.ts              # Next.js API route (proxies to FastAPI)
└── utils/
    └── loan_angel.py         # Shared LoanAngel class
```

**Local FastAPI Backend:**
```
app/loan_angel_backend/
├── main.py                   # FastAPI application
├── loan_angel.py            # LoanAngel ML class
├── train_model.py           # Model training script
├── generate_data.py         # Training data generator
├── data/
│   └── transactions.csv    # Training dataset
└── saved_models/
    └── expense_classifier.pkl
```

#### 2. ML Model Service

**LoanAngel Class** (`api/utils/loan_angel.py`):
- **Purpose**: Transaction categorization and financial analysis
- **Model**: Scikit-learn classifier (Random Forest with TF-IDF)
- **Methods**:
  - `predict_category(description)` - Predicts expense category
  - `analyze_finances(transactions)` - Analyzes transaction list
  - `get_advice(surplus, category_breakdown)` - Generates financial advice

**Model Details:**
- **Type**: Random Forest Classifier
- **Features**: TF-IDF vectorized transaction descriptions
- **Categories**: Salary, Food, Rent, Transportation, Entertainment, etc.
- **Storage**: Pickle file (`expense_classifier.pkl`)

#### 3. Request/Response Flow

**Development Flow:**
```
Client → Next.js API Route → FastAPI (localhost:8000) → LoanAngel → Response
```

**Production Flow:**
```
Client → Vercel Serverless Function (Python) → LoanAngel → Response
```

---

## Data Models

### Frontend Data Models

#### Loan Input Model
```typescript
interface LoanInputs {
  principal: number;              // Original loan amount (₹)
  interest: number;               // Annual interest rate (%)
  tenureMonths: number;           // Loan tenure in months
  monthsPaid: number;             // Months already paid
  prepaymentAmount?: number;      // Lump sum prepayment (₹)
  monthlyExtra?: number;          // Monthly extra payment (₹)
  newRate?: number;               // New refinance rate (%)
  refinanceCost?: number;          // Refinance processing cost (₹)
  newTenure?: number;             // New loan tenure (months)
}
```

#### Calculation Result Models

**Scenario 1A (Reduce Tenure):**
```typescript
interface ReduceTenureResult {
  emi: number;
  outstandingPrincipal: number;
  remainingTenure: number;
  newTenureAfterPrepay: number;
  tenureReduced: number;
  interestSaved: number;
  totalCostWithoutPrepay: number;
  totalCostWithPrepay: number;
}
```

**Scenario 1B (Reduce EMI):**
```typescript
interface ReduceEMIResult {
  emi: number;
  newEmi: number;
  emiReduction: number;
  outstandingPrincipal: number;
  remainingTenure: number;
  interestSaved: number;
  totalCostWithoutPrepay: number;
  totalCostWithPrepay: number;
  monthlyBenefit: number;
}
```

**Scenario 2 (Monthly Extra):**
```typescript
interface MonthlyExtraResult {
  emi: number;
  effectiveMonthlyPayment: number;
  outstandingPrincipal: number;
  remainingTenure: number;
  newTenure: number;
  tenureReduced: number;
  interestSaved: number;
  totalExtraPaid: number;
  totalCostWithoutExtra: number;
  totalCostWithExtra: number;
}
```

**Scenario 3 (Refinance):**
```typescript
interface RefinanceResult {
  emi: number;
  outstandingPrincipal: number;
  remainingTenure: number;
  stay: OptionResult;
  optionA: OptionResult;  // Prepay Only
  optionB: OptionResult;   // Refinance Only
  optionC: OptionResult;   // Prepay + Refinance
  bestOption: 'stay' | 'A' | 'B' | 'C';
  maxSavings: number;
}

interface OptionResult {
  totalCost: number;
  totalInterest: number;
  monthlyPayment: number;
  tenure: number;
  hasBenefit: boolean;
  status?: string;
}
```

### Backend Data Models

#### Transaction Model
```python
class Transaction:
    description: str    # Transaction description
    amount: float       # Transaction amount (₹)
```

#### Analysis Request Model
```python
class AnalyzeRequest:
    transactions: List[Transaction]
```

#### Analysis Response Model
```python
class AnalysisResponse:
    income: float                    # Total income
    expenses: float                  # Total expenses
    surplus: float                   # Income - Expenses
    category_breakdown: Dict[str, float]  # Category-wise breakdown
```

#### Prediction Request Model
```python
class PredictRequest:
    description: str    # Transaction description
```

#### Prediction Response Model
```python
class PredictResponse:
    description: str   # Original description
    category: str      # Predicted category
```

---

## API Contracts

### 1. Health Check API

**Endpoint:** `GET /api/health`

**Request:**
- No request body

**Response:**
```json
{
  "status": "healthy",
  "service": "UnLoQ1 Loan Angel API",
  "version": "1.0.0"
}
```

**Status Codes:**
- `200 OK` - Service is healthy

---

### 2. Transaction Analysis API

**Endpoint:** `POST /api/analyze`

**Request Headers:**
```
Content-Type: application/json
```

**Request Body:**
```json
{
  "transactions": [
    {
      "description": "SALARY CREDIT TCS",
      "amount": 90000
    },
    {
      "description": "UPI/SWIGGY",
      "amount": 500
    },
    {
      "description": "RENT TRANSFER",
      "amount": 20000
    }
  ]
}
```

**Response (Success - 200):**
```json
{
  "total_savings": 69500,
  "income": 90000,
  "expenses": 20500,
  "category_breakdown": {
    "Salary": 90000,
    "Food": 500,
    "Rent": 20000
  },
  "advice": "You have ₹69500.00 extra! Prepay this to your loan to save interest."
}
```

**Response (Error - 400):**
```json
{
  "error": "No transactions provided"
}
```

**Response (Error - 500):**
```json
{
  "error": "Internal server error message"
}
```

**CORS Headers:**
- `Access-Control-Allow-Origin: *`
- `Access-Control-Allow-Methods: POST, OPTIONS`
- `Access-Control-Allow-Headers: Content-Type`

---

### 3. Category Prediction API

**Endpoint:** `POST /api/predict`

**Request Headers:**
```
Content-Type: application/json
```

**Request Body:**
```json
{
  "description": "UPI/SWIGGY"
}
```

**Response (Success - 200):**
```json
{
  "description": "UPI/SWIGGY",
  "category": "Food"
}
```

**Response (Error - 400):**
```json
{
  "error": "No description provided"
}
```

**Response (Error - 500):**
```json
{
  "error": "Internal server error message"
}
```

**CORS Headers:**
- `Access-Control-Allow-Origin: *`
- `Access-Control-Allow-Methods: POST, OPTIONS`
- `Access-Control-Allow-Headers: Content-Type`

---

## Deployment Architecture

### Vercel Configuration

**`vercel.json`:**
```json
{
  "version": 2,
  "routes": [
    {
      "src": "/api/(.*)",
      "headers": {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type"
      },
      "continue": true
    }
  ]
}
```

### Environment-Specific Behavior

**Local Development:**
1. FastAPI backend runs on `localhost:8000`
2. Next.js dev server runs on `localhost:3000`
3. Next.js API routes proxy to FastAPI
4. Hot reload enabled for both

**Production (Vercel):**
1. Next.js builds static pages and API routes
2. Python serverless functions in `api/` directory are deployed
3. ML model file included in deployment
4. No FastAPI backend needed
5. All requests handled by serverless functions

### Build Process

1. **Next.js Build:**
   - Compiles TypeScript
   - Generates static pages
   - Bundles JavaScript
   - Optimizes assets

2. **Python Functions:**
   - Vercel detects Python files in `api/`
   - Installs dependencies from `api/requirements.txt`
   - Packages functions as serverless endpoints

3. **Model Deployment:**
   - `expense_classifier.pkl` included in git
   - Loaded at cold start of serverless function
   - Cached for subsequent requests

### File Structure Summary

```
credx/
├── api/                          # Production Python serverless functions
│   ├── health.py
│   ├── analyze.py
│   ├── predict.py
│   ├── requirements.txt
│   ├── utils/
│   │   └── loan_angel.py
│   └── saved_models/
│       └── expense_classifier.pkl
│
├── app/                          # Next.js application
│   ├── api/                      # Development API routes (TypeScript)
│   │   ├── health/route.ts
│   │   ├── analyze/route.ts
│   │   ├── predict/route.ts
│   │   └── utils/loan_angel.py
│   │
│   ├── components/               # React components
│   │   ├── Header.tsx
│   │   ├── Footer.tsx
│   │   ├── LoanSlider.tsx
│   │   ├── ResultsCard.tsx
│   │   └── ... (20+ components)
│   │
│   ├── lib/                      # Business logic
│   │   ├── calculator.ts         # Financial calculations
│   │   └── animation.ts         # Animation presets
│   │
│   ├── lump-sum/page.tsx        # Calculator pages
│   ├── monthly-extra/page.tsx
│   ├── refinance/page.tsx
│   ├── page.tsx                  # Home page
│   └── layout.tsx               # Root layout
│
├── app/loan_angel_backend/       # Local FastAPI backend
│   ├── main.py                   # FastAPI app
│   ├── loan_angel.py
│   ├── train_model.py
│   └── data/transactions.csv
│
├── vercel.json                   # Vercel configuration
├── package.json                  # Node.js dependencies
├── tsconfig.json                 # TypeScript config
└── tailwind.config.ts            # Tailwind CSS config
```

---

## Data Flow Diagrams

### Transaction Analysis Flow

```
User Input (Transactions)
    ↓
Frontend: Format & Validate
    ↓
POST /api/analyze
    ↓
Backend: LoanAngel.analyze_finances()
    ↓
For each transaction:
    ├─→ LoanAngel.predict_category()
    │   └─→ ML Model (TF-IDF + Random Forest)
    │       └─→ Category (Food, Rent, etc.)
    │
    └─→ Categorize as Income/Expense
    └─→ Add to category_breakdown
    ↓
Calculate:
    ├─→ Total Income
    ├─→ Total Expenses
    └─→ Surplus (Income - Expenses)
    ↓
LoanAngel.get_advice()
    ├─→ Check surplus > ₹10,000
    └─→ Check Food expense > 30% of total
    ↓
Response: {
    total_savings,
    income,
    expenses,
    category_breakdown,
    advice
}
```

### Loan Calculation Flow

```
User Input (Loan Parameters)
    ↓
Frontend: LoanSlider Components
    ↓
State Management (React useState)
    ↓
User Clicks "Calculate"
    ↓
Frontend: calculator.ts
    ├─→ calculateOutstandingPrincipal()
    ├─→ calculateEMI()
    ├─→ calculateNewTenure() [if prepayment]
    ├─→ calculateInterestSaved()
    └─→ calculateTotalCost()
    ↓
Results Display:
    ├─→ ResultsCard components
    ├─→ AnimatedCharts
    ├─→ SavingsHighlight
    └─→ ComparisonTable
    ↓
Export Options:
    ├─→ PDF Generation (jsPDF)
    └─→ WhatsApp Share
```

---

## Security Considerations

1. **CORS**: Configured for all origins (`*`) - consider restricting in production
2. **Input Validation**: Frontend and backend validation
3. **Data Privacy**: All calculations client-side; no user data stored
4. **Model Security**: ML model file committed to git (consider encryption for sensitive models)

---

## Performance Optimizations

1. **Static Generation**: Next.js pre-renders static pages
2. **Code Splitting**: Automatic with Next.js App Router
3. **Image Optimization**: Next.js Image component (if used)
4. **Serverless Cold Starts**: ML model loaded once per function instance
5. **Client-Side Calculations**: Financial calculations done in browser (no server round-trip)

---

## Future Enhancements (Not Implemented)

1. **Database**: Currently stateless; could add user accounts
2. **Caching**: ML model predictions could be cached
3. **Analytics**: User interaction tracking
4. **A/B Testing**: UI/UX optimization
5. **Progressive Web App**: Offline functionality
6. **Real-time Updates**: WebSocket for live calculations

---

## Conclusion

UnLoQ1 follows a modern serverless architecture with:
- **Frontend**: Next.js with React for rich UI/UX
- **Backend**: Hybrid Python/TypeScript API layer
- **ML**: Scikit-learn for transaction categorization
- **Deployment**: Vercel serverless platform

The architecture prioritizes:
- ✅ Client-side calculations (privacy & performance)
- ✅ Serverless scalability
- ✅ Type safety (TypeScript)
- ✅ Precise financial calculations (Decimal.js)
- ✅ Modern UI/UX (Framer Motion, Tailwind CSS)
