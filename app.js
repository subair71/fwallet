const express = require('express');
const bodyParser = require('body-parser');

const app = express();
const port = 3000;

// Middleware for parsing JSON bodies
app.use(bodyParser.json());

// Mock user data
const users = [
  {
    id: "user123",
    isVerified: true,
    monthlyLimitExceeded: false,
    transactionFee: 5.0,
    balance: 1200.5,
    beneficiaryMax: 3,
    beneficiaries: [],
  },
  {
    id: "user456",
    isVerified: false,
    monthlyLimitExceeded: true,
    transactionFee: 2.5,
    balance: 800.0,
    beneficiaryMax: 5,
    beneficiaries: [],
  },
];

// API: Get user details
app.get('/getUserDetails/:id', (req, res) => {
  const userId = req.params.id;

  // Find user by ID
  const user = users.find((u) => u.id === userId);

  if (user) {
    res.status(200).json({
      success: true,
      data: user,
    });
  } else {
    res.status(404).json({
      success: false,
      message: "User not found",
    });
  }
});

// API: Add beneficiary
app.post('/addBeneficiary/:id', (req, res) => {
  const userId = req.params.id;
  const { beneficiaryId } = req.body;

  // Find user by ID
  const user = users.find((u) => u.id === userId);

  if (user) {
    if (user.beneficiaries.length >= user.beneficiaryMax) {
      return res.status(400).json({
        success: false,
        message: "Maximum beneficiaries limit reached",
      });
    }

    user.beneficiaries.push({
      beneficiaryId: beneficiaryId,
      balance: 0,
    });

    res.status(200).json({
      success: true,
      message: "Beneficiary added successfully",
    });
  } else {
    res.status(404).json({
      success: false,
      message: "User not found",
    });
  }
});

// API: List all beneficiaries
app.get('/listBeneficiaries/:id', (req, res) => {
  const userId = req.params.id;

  // Find user by ID
  const user = users.find((u) => u.id === userId);

  if (user) {
    res.status(200).json({
      success: true,
      data: user.beneficiaries,
    });
  } else {
    res.status(404).json({
      success: false,
      message: "User not found",
    });
  }
});

// API: Perform top-up
app.post('/performTopUp/:id', (req, res) => {
  const userId = req.params.id;
  const { beneficiaryId, amount } = req.body;

  // Find user by ID
  const user = users.find((u) => u.id === userId);

  if (user) {
    const beneficiary = user.beneficiaries.find((b) => b.beneficiaryId === beneficiaryId);

    if (!beneficiary) {
      return res.status(404).json({
        success: false,
        message: "Beneficiary not found",
      });
    }

    if (user.balance < amount) {
      return res.status(400).json({
        success: false,
        message: "Insufficient balance",
      });
    }

    // Deduct from user balance
    user.balance -= amount;

    // Add to beneficiary balance
    beneficiary.balance += amount;

    res.status(200).json({
      success: true,
      message: "Top-up successful",
      userBalance: user.balance,
      beneficiaryBalance: beneficiary.balance,
    });
  } else {
    res.status(404).json({
      success: false,
      message: "User not found",
    });
  }
});

// Start the server
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
