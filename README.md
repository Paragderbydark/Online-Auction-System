# Online Auction System

Welcome to the Online Auction System, a modern, feature-rich platform for bidding on a wide range of products. This application is designed to provide a seamless and engaging experience for buyers, sellers, and administrators. Our goal is to create a transparent and efficient marketplace for unique and valuable items.

## 🚀 Features

- **Role-Based Access Control:** Dedicated interfaces and functionalities for Buyers, Sellers, and Administrators, ensuring a tailored user experience.
- **Comprehensive Product Management:** Sellers can easily add products with detailed descriptions and images, set auction start and end times, and manage their listings.
- **Dynamic Real-time Bidding:** Buyers can participate in exciting real-time auctions with instant updates on bidding status.
- **Secure and Integrated Payments:** A reliable payment system for smooth and secure transactions between buyers and sellers.
- **Powerful Admin Dashboard:** A central hub for administrators to oversee all platform activities, including user management, product verification, auction monitoring, and payment tracking.
- **Fully Responsive Design:** The user interface is built to be fully responsive, ensuring a great experience on both desktop and mobile devices.
- **Instant Notifications:** Real-time notifications for new bids, auction wins, payment confirmations, and other important events to keep users informed.

## 📸 Screenshots

*A picture is worth a thousand words. Here are some glimpses of our application.*

| Landing Page | Buyer Dashboard | Seller Dashboard |
| :---: | :---: | :---: |
| ![Landing Page](https://i.imgur.com/example-landing.png) | ![Buyer Dashboard](https://i.imgur.com/example-buyer.png) | ![Seller Dashboard](https://i.imgur.com/example-seller.png) |

*(Note: These are placeholder images. You can replace them with actual screenshots of your application.)*

## 🛠️ Tech Stack

This project is built with a modern and robust tech stack, chosen for performance, scalability, and developer experience.

- **Frontend:**
  - **React:** A JavaScript library for building dynamic and component-based user interfaces.
  - **Vite:** A next-generation frontend build tool that provides a significantly faster and leaner development experience.
  - **React Router:** For declarative routing and navigation within the single-page application.
  - **Tailwind CSS:** A utility-first CSS framework that enables rapid and custom UI development.
  - **Material-UI:** A popular React UI framework that provides a set of comprehensive and customizable UI components.
  - **Axios:** A promise-based HTTP client for making requests to the backend API.
- **Styling:**
    - **CSS Modules:** For locally scoped and modular CSS, preventing style conflicts.
    - **Sass:** A powerful CSS preprocessor that adds features like variables, nesting, and mixins to CSS.
- **Linting & Formatting:**
    - **ESLint:** To statically analyze the code to find and fix problems in JavaScript.

## 📂 Project Structure

The project follows a well-organized and scalable structure to maintain clean and manageable code:

```
/src
|-- /assets
|   |-- Contains all static assets like images, videos, and fonts.
|-- /Components
|   |-- Contains reusable React components used across the application (e.g., Navbar, Footer, ProductCard).
|-- /Pages
|   |-- Contains the main pages of the application, organized by user roles (Admin, Buyer, Seller, User).
|   |   |-- /Admin: Components for the admin dashboard.
|   |   |-- /Buyer: Components for the buyer's experience.
|   |   |-- /Seller: Components for the seller's dashboard.
|   |   |-- /User: Components for user authentication and profile management.
|-- /Styles
|   |-- Contains global and component-specific stylesheets, including CSS Modules and Sass files.
|-- /Utils
|   |-- Contains utility functions and helper modules, such as authentication logic and API configuration.
|-- App.jsx
|   |-- The main application component where routing is handled.
|-- main.jsx
|   |-- The entry point of the application.
```

## 🏁 Getting Started

To get a local copy up and running, follow these simple steps.

### Prerequisites

- **Node.js:** Make sure you have Node.js (v14 or newer) installed. You can download it from [nodejs.org](https://nodejs.org/).
- **npm:** Node Package Manager, which is included with Node.js.

### Installation

1.  **Clone the repository:**
    ```sh
    git clone https://github.com/Paragderbydark/Online-Auction-System-Frontend.git
    ```
2.  **Navigate to the project directory:**
    ```sh
    cd Online-Auction-System-Frontend
    ```
3.  **Install dependencies:**
    ```sh
    npm install
    ```
4.  **Start the development server:**
    ```sh
    npm run dev
    ```
    The application will be available at `http://localhost:5173` by default.

### Available Scripts

In the project directory, you can run:

- `npm run dev`: Runs the app in development mode.
- `npm run build`: Builds the app for production to the `dist` folder.
- `npm run lint`: Lints the codebase using ESLint.
- `npm run preview`: Serves the production build locally for preview.

## 👥 User Roles

The application is designed with three distinct user roles, each with specific permissions and capabilities:

-   **Buyer:** Can browse and search for products, view auction details, place bids, and manage their payments and won items.
-   **Seller:** Can list products for auction, manage their inventory, view bidding history on their items, and track their sales and payments.
-   **Admin:** Has full administrative control over the platform, including managing users (buyers and sellers), verifying products, overseeing auctions, and resolving any issues.

## 🤝 Contributing

Contributions are what make the open-source community such an amazing place to learn, inspire, and create. Any contributions you make are **greatly appreciated**.

1.  Fork the Project
2.  Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3.  Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4.  Push to the Branch (`git push origin feature/AmazingFeature`)
5.  Open a Pull Request

## 📄 License

This project is licensed under the MIT License. See the `LICENSE` file for more information.

---

Thank you for checking out our Online Auction System! We hope you find it as exciting to use as we did to build it. If you have any suggestions or feedback, please feel free to open an issue.
