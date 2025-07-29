import "./App.css";
import { Route, Routes, useNavigate, Navigate } from "react-router-dom";
import Login from "./components/Login";
import Signup from "./components/Signup";
import AdminPage from "./components/AdminPage";
import UserPage from "./components/UserPage";
import PrivateRoute from "./PrivateRoute";
import { onAuthStateChanged, getAuth, db, doc, getDoc } from "./firebase";
import { useEffect, useState } from "react";
import StationDetails from "./components/StationDetails";

function App() {
  const [user, setUser] = useState(null);
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const auth = getAuth();

  const publicRoutes = ["/login", "/signup"];

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setLoading(true);
        setUser(user);

        try {
          const userDocRef = doc(db, "users", user.uid);
          const userDocSnap = await getDoc(userDocRef);

          if (userDocSnap.exists()) {
            const userData = userDocSnap.data();
            setUserData(userData);

            // Only redirect if on public route
            const currentPath = window.location.pathname;
            if (publicRoutes.includes(currentPath)) {
              if (userData.isAdmin) {
                navigate("/admin", { replace: true });
              } else {
                navigate("/user", { replace: true });
              }
            }
          }
        } catch (error) {
          console.error("Error fetching user data:", error);
        } finally {
          setLoading(false);
        }
      } else {
        setUser(null);
        setUserData(null);
        setLoading(false);
        if (!publicRoutes.includes(window.location.pathname)) {
          navigate("/login", { replace: true });
        }
      }
    });

    return () => unsubscribe();
  }, [auth, navigate]);

  if (loading) {
    return <div className="text-center py-5">Loading user data...</div>;
  }

  //check if we need  to redirect from root path
  if (window.location.pathname === "/" && user) {
    return userData?.isAdmin ? (
      <Navigate to="/admin" replace />
    ) : (
      <Navigate to="/user" replace />
    );
  }

  return (
    <div className="app">
      <header className="bg-dark text-white py-3">
        <div className="container">
          <h1 className="text-center mb-0">
            {userData?.station || "Management System"}
          </h1>
        </div>
      </header>

      <main>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />

          {/* Admin-only routes */}
          <Route
            path="/admin"
            element={
              <PrivateRoute
                user={user}
                userData={userData}
                adminOnly={true}
                element={<AdminPage user={user} />}
              />
            }
          />
          <Route
            path="/station-details/:email"
            element={
              <PrivateRoute
                user={user}
                userData={userData}
                adminOnly={true}
                element={<StationDetails />}
              />
            }
          />

          {/* Regular user route */}
          <Route
            path="/user"
            element={
              <PrivateRoute
                user={user}
                userData={userData}
                element={<UserPage user={user} userData={userData} />}
              />
            }
          />
          <Route
            path="*"
            element={<Navigate to={user ? "/user" : "/login"} replace />}
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

// import "./App.css";
// import { Route, Routes, useNavigate } from "react-router-dom";
// import Login from "./components/Login";
// import Signup from "./components/Signup";
// import AdminPage from "./components/AdminPage";
// import UserPage from "./components/UserPage";
// import PrivateRoute from "./PrivateRoute";
// import { onAuthStateChanged, getAuth, db, doc, getDoc } from "./firebase";
// import { useEffect, useState } from "react";
// import StationDetails from "./components/StationDetails";

// function App() {
//   const [user, setUser] = useState(null);
//   const [userData, setUserData] = useState("");
//   const navigate = useNavigate();
//   const auth = getAuth();

//   useEffect(() => {
//     const unsubscribe = onAuthStateChanged(auth, (user) => {
//       if (user) {
//         setUser(user);

//         // Fetch additional user data (like email and station) from Firestore
//         const fetchUserData = async () => {
//           const userDocRef = doc(db, "users", user.uid); // Assuming users collection is structured by user UID
//           const userDoc = await getDoc(userDocRef);

//           if (userDoc.exists()) {
//             const userData = userDoc.data();
//             setUserData(userData);
//             console.log("user Data:", userData.station);
//             if (userData.isAdmin) {
//               navigate("/admin");
//             } else {
//               navigate("/user");
//             }
//           }
//         };

//         fetchUserData(); // Call the function to fetch user data
//       } // else {
//       //   setUser(null); // User is logged out
//       //   setUserData(null); // Clear user data when logged out
//       //   navigate("/"); // Navigate to the login page if the user is logged out
//       // }
//     });

//     return () => unsubscribe(); // Cleanup the listener when the component is unmounted
//   }, [auth, navigate, db]);

//   return (
//     <div className="app">
//       <header className="bg-dark text-white py-3">
//         <div className="container">
//           <h1 className="text-center mb-0">
//             {userData.station ? userData.station : "Management System"}
//           </h1>
//         </div>
//       </header>
//       <main>
//         <Routes>
//           <Route path="/" element={<Login />} />
//           <Route path="/login" element={<Login />} />
//           <Route path="/signup" element={<Signup />} />
//           {/* Protected Route */}
//           <Route
//             path="/admin"
//             element={
//               <PrivateRoute user={user} element={<AdminPage user={user} />} />
//             }
//           />
//           <Route
//             path="/station-details"
//             element={<PrivateRoute user={user} element={<StationDetails />} />}
//           />
//           <Route
//             path="/user"
//             element={
//               <PrivateRoute
//                 user={user}
//                 element={<UserPage user={user} userData={userData} />}
//               />
//             }
//           />
//         </Routes>
//       </main>

//       <footer className="bg-dark text-white py-3">
//         <div className="container text-center">
//           <p className="mb-0">
//             &copy; {new Date().getFullYear()} Management System. All Rights
//             Reserved.
//           </p>
//         </div>
//       </footer>
//     </div>
//   );
// }

// export default App;
