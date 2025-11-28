import { body, validationResult } from 'express-validator';

export const handleValidation = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array()
    });
  }
  next();
};

export const validateUserRegistration = [
  body('username')
    .isLength({ min: 3 })
    .withMessage('Username must be at least 3 characters long')
    .matches(/^[a-zA-Z0-9_]+$/)
    .withMessage('Username can only contain letters, numbers and underscores'),
  body('email')
    .isEmail()
    .withMessage('Please provide a valid email'),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long'),
  body('isBuyer')
    .optional()
    .isBoolean()
    .withMessage('isBuyer must be a boolean value'),
  body('isSeller')
    .optional()
    .isBoolean()
    .withMessage('isSeller must be a boolean value'),
  body('role')
    .optional()
    .isIn(['user', 'admin', 'buyer', 'seller'])
    .withMessage('Role must be user, admin, buyer, or seller'),
  handleValidation
];

export const validateUserLogin = [
  body('email')
    .isEmail()
    .withMessage('Please provide a valid email'),
  body('password')
    .notEmpty()
    .withMessage('Password is required'),
  handleValidation
];

export const validateProduct = [
  body('product_model')
    .notEmpty()
    .withMessage('Product model is required')
    .isLength({ min: 3 })
    .withMessage('Product model must be at least 3 characters long'),
  body('model_year')
    .isInt({ min: 1, max: new Date().getFullYear() })
    .withMessage('Please provide a valid model year'),
  body('description')
    .notEmpty()
    .withMessage('Description is required')
    .isLength({ min: 50 })
    .withMessage('Description must be at least 50 characters long'),
  body('auction_date')
    .isISO8601()
    .withMessage('Please provide a valid date in YYYY-MM-DD format'),
  body('auction_time')
    .matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)
    .withMessage('Please provide a valid time in HH:MM format'),
  body('auction_duration')
    .isInt({ min: 1, max: 720 })
    .withMessage('Auction duration must be between 1 and 720 hours'),
  body('starting_price')
    .isFloat({ min: 1 })
    .withMessage('Starting price must be a positive number'),
  body('reserve_price')
    .isFloat({ min: 1 })
    .withMessage('Reserve price must be a positive number')
    .custom((value, { req }) => {
      if (parseFloat(value) < parseFloat(req.body.starting_price)) {
        throw new Error('Reserve price must be greater than or equal to starting price');
      }
      return true;
    }),
  body('category')
    .optional()
    .isIn(['General', 'Automotive', 'Electronics', 'Art & Collectibles', 'Sports Memorabilia', 'Jewelry & Watches', 'Antiques', 'Books & Literature', 'Fashion', 'Home & Garden'])
    .withMessage('Invalid category'),
  handleValidation
];

export const validateAuction = [
  body('productId')
    .optional()
    .notEmpty()
    .withMessage('Product ID cannot be empty if provided'),
  body('auctionId')
    .optional()
    .notEmpty()
    .withMessage('Auction ID cannot be empty if provided'),
  body().custom((body) => {
    if (!body.productId && !body.auctionId) {
      throw new Error('Either productId or auctionId must be provided');
    }
    return true;
  }),
  handleValidation
];

export const validateBid = [
  body('amount')
    .isFloat({ min: 0.01 })
    .withMessage('Bid amount must be a positive number'),
  body().custom((body) => {
    if (!body.auctionId && !body.productId) {
      throw new Error('Either auctionId or productId must be provided');
    }
    return true;
  }),
  handleValidation
];

export const validateReview = [
  body('rating')
    .isInt({ min: 1, max: 5 })
    .withMessage('Rating must be between 1 and 5'),
  body('comment')
    .optional()
    .isLength({ min: 5 })
    .withMessage('Comment must be at least 5 characters long if provided'),
  body().custom((body) => {
    if (!body.productId && !body.sellerId) {
      throw new Error('Either productId or sellerId must be provided');
    }
    return true;
  }),
  handleValidation
];


