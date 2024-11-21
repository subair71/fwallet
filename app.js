const express = require('express');
const { v4: uuidv4 } = require('uuid');
const cors = require('cors'); // CORS middleware for cross-origin requests

const app = express();
const port = 3000; // Define the port

app.use(express.json()); // Middleware to parse JSON bodies
app.use(cors()); // Allow cross-origin requests (for Flutter app)

// Mock user data
const users = [
  {
    id: "user123",
    isVerified: true,
    monthlyLimitExceeded: false,
    transactionFee: 3.0,
    balance: 1200.5,
    beneficiaryMax: 5,  // Maximum of 5 beneficiaries
    beneficiaries: [
      { benId: "ben001", name: "John Doe", nickname: "Johnny" },
    ],
  },
  {
    id: "user456",
    isVerified: false,
    monthlyLimitExceeded: true,
    transactionFee: 2.5,
    balance: 800.0,
    beneficiaryMax: 5,
    beneficiaries: [
      { benId: "ben006", name: "Mike Jordan", nickname: "MJ" },
      { benId: "ben007", name: "Sarah Lee", nickname: "Sally" }
    ],
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

// API: Add Beneficiary
app.post('/addBeneficiary', (req, res) => {
  const { userId, name, nickname } = req.body;

  // Check if the required fields are provided
  if (!userId || !name || !nickname) {
    return res.status(400).json({
      success: false,
      message: 'userId, name, and nickname are required',
    });
  }

  // Find the user by ID
  const user = users.find((u) => u.id === userId);

  if (!user) {
    return res.status(404).json({
      success: false,
      message: 'User not found',
    });
  }

  // Check if the user has reached the max number of beneficiaries
  if (user.beneficiaries.length >= user.beneficiaryMax) {
    return res.status(400).json({
      success: false,
      message: 'Maximum beneficiaries limit reached',
    });
  }

  // Generate a unique beneficiary ID
  const beneficiaryId = uuidv4();

  // Add the new beneficiary to the user's list
  user.beneficiaries.push({
    benId: beneficiaryId,
    name: name,
    nickname: nickname,
  });

  // Respond with the updated list of beneficiaries
  res.status(200).json({
    success: true,
    data: user.beneficiaries,
  });
});

// API: Perform top-up
app.post('/performTopUp/:id', (req, res) => {
  const userId = req.params.id; // User ID from the URL
  const { beneficiaryId, amount } = req.body; // Beneficiary ID and amount from the request body

  // Find user by ID
  const user = users.find((u) => u.id === userId);

  if (user) {
    // Find the beneficiary within the user's beneficiaries list
    const beneficiary = user.beneficiaries.find((b) => b.benId === beneficiaryId);

    if (!beneficiary) {
      return res.status(404).json({
        success: false,
        message: "Beneficiary not found",
      });
    }

    // Check if the user has sufficient balance
    if (user.balance < amount) {
      return res.status(400).json({
        success: false,
        message: "Insufficient balance",
      });
    }

    // Deduct the amount from the user's balance
    user.balance -= amount;

    // Add the amount to the beneficiary's balance
    if (!beneficiary.balance) {
      beneficiary.balance = 0; // Initialize balance if it doesn't exist
    }
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
