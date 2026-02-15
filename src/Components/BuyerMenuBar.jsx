import React, { useState } from "react";

const styles = {
  sidenav: {
    height: "100%",
    width: 0,
    position: "fixed",
    zIndex: 1,
    top: 80,
    left: 0,
    backgroundColor: "#456882",
    overflowX: "hidden",
    transition: "0.5s",
    paddingTop: "60px",
  },
  sidenavOpen: {
    width: "250px",
  },
  sidenavLink: {
    padding: "8px 8px 8px 32px",
    textDecoration: "none",
    fontSize: "25px",
    color: "#818181",
    display: "block",
    transition: "0.3s",
  },
  closebtn: {
    position: "absolute",
    top: 10,
    right: "25px",
    fontSize: "36px",
    marginLeft: "50px",
    color: "#818181",
    background: "none",
    // backgroundColor: "#456882",
    border: "none",
    cursor: "pointer",
  },
  mainShift: {
    marginLeft: "250px",
  },
};

function BuyerMenuBar() {
  const [open, setOpen] = useState(false);

  return (
    <>
      {/* Side Navigation */}
      <div
        style={{
          ...styles.sidenav,
          ...(open ? styles.sidenavOpen : {}),
        }}
      >
        <button
          style={styles.closebtn}
          onClick={() => setOpen(false)}
          aria-label="Close"
        >
          &times;
        </button>
        <a href="#" style={styles.sidenavLink}>
          <button className="btn">
            Home
            </button>
            
        </a>
        <a href="../Pages/BuyerPaymentPage" style={styles.sidenavLink}>
         <button className="btn">
          Payments
         </button>
        </a>
        <a href="#" style={styles.sidenavLink}>
          <button className="btn">
          Histroy
          </button>
        </a>
        <a href="#" style={styles.sidenavLink}>
          <button className="btn">
            Reviews
            </button>

        </a>
      </div>

      {/* Main Content */}
      <div
        id="main"
        style={{
          ...styles.main,
          ...(open ? styles.mainShift : {}),
        }}
      >
        <button
          className="btn"
          style={{ cursor: "pointer" }}
          onClick={() => setOpen(true)}
        >
          Menu
        </button>
      </div>
    </>
  );
}

export default BuyerMenuBar;