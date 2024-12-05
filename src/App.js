import "./App.css";
import { Route, Routes, useNavigate } from "react-router-dom";
import Login from "./components/Login";
import Signup from "./components/Signup";
import AdminPage from "./components/AdminPage";
import UserPage from "./components/UserPage";
import PrivateRoute from "./PrivateRoute";
import { onAuthStateChanged, getAuth, db, doc, getDoc } from "./firebase";
import { useEffect, useState } from "react";

function App() {
  const [user, setUser] = useState(null);
  const [userData, setUserData] = useState("");
  const navigate = useNavigate();
  const auth = getAuth();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUser(user);

        // Fetch additional user data (like email and station) from Firestore
        const fetchUserData = async () => {
          const userDocRef = doc(db, "users", user.uid); // Assuming users collection is structured by user UID
          const userDoc = await getDoc(userDocRef);

          if (userDoc.exists()) {
            const userData = userDoc.data();
            setUserData(userData);
            console.log("user Data:", userData.station);
            if (userData.isAdmin) {
              navigate("/admin");
            } else {
              navigate("/user");
            }
          }
        };

        fetchUserData(); // Call the function to fetch user data
      } // else {
      //   setUser(null); // User is logged out
      //   setUserData(null); // Clear user data when logged out
      //   navigate("/"); // Navigate to the login page if the user is logged out
      // }
    });

    return () => unsubscribe(); // Cleanup the listener when the component is unmounted
  }, [auth, navigate, db]);

  return (
    <div className="app">
      <header className="bg-dark text-white py-3">
        <div className="container">
          <h1 className="text-center mb-0">
            {userData.station ? userData.station : "Management System"}
          </h1>
        </div>
      </header>
      <main>
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          {/* Protected Route */}
          <Route
            path="/admin"
            element={
              <PrivateRoute user={user} element={<AdminPage user={user} />} />
            }
          />
          <Route
            path="/user"
            element={
              <PrivateRoute
                user={user}
                element={<UserPage user={user} userData={userData} />}
              />
            }
          />
        </Routes>
      </main>

      <footer className="bg-dark text-white py-3">
        <div className="container text-center">
          <p className="mb-0">
            &copy; {new Date().getFullYear()} Management System. All Rights
            Reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}

export default App;
