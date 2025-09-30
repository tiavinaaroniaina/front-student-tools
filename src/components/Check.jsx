@@ .. @@
 import React, { useState, useEffect } from "react";
 import { Doughnut } from "react-chartjs-2";
 import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";
 import API_BASE_URL from "../config.js";
-import ErrorPopup from "./ErrorPopup.jsx";
+import SearchAndFilter from "./SearchAndFilter.jsx";
+import { useAlerts } from "./AnimatedAlert.jsx";
 
 ChartJS.register(ArcElement, Tooltip, Legend);
 
@@ -1,5 +1,7 @@
 const ITEMS_PER_PAGE = 10;
 
 const Check = ({ user, kind }) => {
+  const { showError, showSuccess } = useAlerts();
   const [today, setToday] = useState(new Date());
   const [startDate, setStartDate] = useState(today.setMonth(today.getMonth() - 1) > new Date().getMonth() - 1
     ? new Date(new Date().setMonth(new Date().getMonth() - 1)).toISOString().split('T')[0]
     : new Date(new Date().setMonth(new Date().getMonth() - 2)).toISOString().split('T')[0]);
   const [endDate, setEndDate] = useState(today.toISOString().split('T')[0] > new Date().toISOString().split('T')[0]
     ? new Date().toISOString().split('T')[0]
     : new Date(new Date().setDate(new Date().getDate() + 1)).toISOString().split('T')[0]);
   const [userStats, setUserStats] = useState([]);
+  const [filteredStats, setFilteredStats] = useState([]);
   const [globalRate, setGlobalRate] = useState(0);
-  const [error, setError] = useState(null);
   const [loading, setLoading] = useState(false);
-  const [filterLogin, setFilterLogin] = useState("");
-  const [suggestions, setSuggestions] = useState([]);
   const [currentPage, setCurrentPage] = useState(1);
 
   const fetchStats = async () => {
     setLoading(true);
-    setError(null);
     try {
       const resGlobal = await fetch(
         `${API_BASE_URL}/stats/global?startDate=${startDate}&endDate=${endDate}`,
         { credentials: "include" }
       );
       if (!resGlobal.ok) {
         if (resGlobal.status === 401) {
-          setError("Authentication required. Redirecting to login...");
+          showError("Authentication required. Redirecting to login...");
           setTimeout(() => {
             window.location.href = `${API_BASE_URL}/login`;
           }, 2000);
           return;
         }
         const errorData = await resGlobal.json().catch(() => ({}));
         throw new ResponseStatusException(resGlobal.status, errorData.error || `HTTP error! status: ${resGlobal.status}`);
       }
       const global = await resGlobal.json();
       setGlobalRate(global || 0);
 
       if (kind === "admin") {
         const resUsers = await fetch(
           `${API_BASE_URL}/stats/users?startDate=${startDate}&endDate=${endDate}`,
           { credentials: "include" }
         );
         if (!resUsers.ok) {
           if (resUsers.status === 401) {
-            setError("Authentication required. Redirecting to login...");
+            showError("Authentication required. Redirecting to login...");
             setTimeout(() => {
               window.location.href = `${API_BASE_URL}/login`;
             }, 2000);
             return;
           }
           if (resUsers.status === 403) {
             setUserStats([]);
             return;
           }
           const errorData = await resUsers.json().catch(() => ({}));
           throw new ResponseStatusException(resUsers.status, errorData.error || `HTTP error! status: ${resUsers.status}`);
         }
         const users = await resUsers.json();
         setUserStats(users);
       } else {
         setUserStats([]);
       }
+      showSuccess("Statistiques mises à jour avec succès");
     } catch (err) {
       console.error("Error fetching stats:", err.message);
-      setError(err.message || "Failed to fetch statistics. Please try again.");
+      showError(err.message || "Failed to fetch statistics. Please try again.");
     } finally {
       setLoading(false);
     }
   };
 
   useEffect(() => {
     fetchStats();
   }, [startDate, endDate, kind]);
 
-  useEffect(() => {
-    if (filterLogin) {
-      const matches = userStats
-        .map((u) => u.login)
-        .filter((login) =>
-          login.toLowerCase().includes(filterLogin.toLowerCase())
-        );
-      setSuggestions(matches.slice(0, 5));
-    } else {
-      setSuggestions([]);
-    }
-    setCurrentPage(1);
-  }, [filterLogin, userStats]);
-
-  const filteredStats = filterLogin
-    ? userStats.filter((u) =>
-        u.login.toLowerCase().includes(filterLogin.toLowerCase())
-      )
-    : userStats;
+  // Search and filter configuration
+  const searchFields = ['login', 'firstName', 'lastName'];
+  
+  const filterOptions = {
+    tauxPresence: {
+      label: 'Taux de présence',
+      values: [
+        { value: 'high', label: 'Élevé (≥80%)' },
+        { value: 'medium', label: 'Moyen (50-79%)' },
+        { value: 'low', label: 'Faible (<50%)' }
+      ]
+    }
+  };
+  
+  const sortOptions = {
+    login: 'Login',
+    firstName: 'Prénom',
+    lastName: 'Nom',
+    tauxPresence: 'Taux de présence',
+    joursPresent: 'Jours présents',
+    joursTotaux: 'Jours totaux'
+  };
+  
+  // Apply custom filters
+  const handleFilteredData = (data) => {
+    let filtered = [...data];
+    
+    // Apply presence rate filter if needed
+    filtered = filtered.map(user => {
+      const rate = parseFloat(user.tauxPresence);
+      let category = 'low';
+      if (rate >= 80) category = 'high';
+      else if (rate >= 50) category = 'medium';
+      
+      return { ...user, presenceCategory: category };
+    });
+    
+    setFilteredStats(filtered);
+    setCurrentPage(1);
+  };
 
   const totalPages = Math.ceil(filteredStats.length / ITEMS_PER_PAGE);
   const paginatedStats = filteredStats.slice(
     (currentPage - 1) * ITEMS_PER_PAGE,
     currentPage * ITEMS_PER_PAGE
   );
 
   const doughnutData = {
     labels: ["Present", "Absent"],
     datasets: [
       {
         data: [globalRate, 100 - globalRate],
-        backgroundColor: ["#00ffc0", "#333"],
-        hoverBackgroundColor: ["#00ffd0", "#555"],
+        backgroundColor: ["var(--accent-cyan)", "var(--surface-bg)"],
+        hoverBackgroundColor: ["var(--accent-blue)", "var(--tertiary-bg)"],
         borderWidth: 0,
       },
     ],
   };
 
   const doughnutOptions = {
     responsive: true,
     cutout: "70%",
     plugins: {
       legend: { display: false },
       tooltip: { enabled: false },
     },
   };
 
   return (
-    <div className="checking-admin">
-      <ErrorPopup error={error} setError={setError} />
-
-      <form
-        onSubmit={(e) => {
-          e.preventDefault();
-          fetchStats();
-        }}
-        className="checking-form"
-      >
-        <div className="date-group">
-          <div>
-            <label htmlFor="startDate">Start Date</label>
-            <input
-              type="date"
-              id="startDate"
-              value={startDate}
-              onChange={(e) => setStartDate(e.target.value)}
-              required
-            />
-          </div>
-          <div>
-            <label htmlFor="endDate">End Date</label>
-            <input
-              type="date"
-              id="endDate"
-              value={endDate}
-              onChange={(e) => setEndDate(e.target.value)}
-              required
-            />
+    <div className="container-fluid">
+      <div className="checking-admin">
+        <div className="checking-header">
+          <h1 className="page-title">Statistiques de Présence</h1>
+          <p className="page-subtitle">
+            Consultez les statistiques de présence pour la période sélectionnée
+          </p>
+        </div>
+
+        <form
+          onSubmit={(e) => {
+            e.preventDefault();
+            fetchStats();
+          }}
+          className="checking-form"
+        >
+          <div className="date-group">
+            <div className="date-input-group">
+              <label htmlFor="startDate">Date de début</label>
+              <input
+                type="date"
+                id="startDate"
+                value={startDate}
+                onChange={(e) => setStartDate(e.target.value)}
+                required
+                className="date-input"
+              />
+            </div>
+            <div className="date-input-group">
+              <label htmlFor="endDate">Date de fin</label>
+              <input
+                type="date"
+                id="endDate"
+                value={endDate}
+                onChange={(e) => setEndDate(e.target.value)}
+                required
+                className="date-input"
+              />
+            </div>
           </div>
-        </div>
-        <button type="submit" className="codepen-button" disabled={loading}>
-          Fetch Stats
-        </button>
-      </form>
-
-      {loading && <p>Loading data...</p>}
-
-      {!loading && (
-        <div className="results-section">
-          {
-            kind === "admin" && (
-              <>
-                <h3>Global Attendance</h3>
-                <div style={{ position: "relative", width: "200px", margin: "0 auto" }}>
-                  <Doughnut data={doughnutData} options={doughnutOptions} />
-                  <div
-                    style={{
-                    position: "absolute",
-                    top: "50%",
-                    left: "50%",
-                    transform: "translate(-50%, -50%)",
-                    fontSize: "1.5rem",
-                    fontWeight: "700",
-                    color: "#00ffc0",
-                  }}
-                >
-                  {globalRate}%
-                </div>
-              </div>
-            </>
-            )
-          }
-
-          {kind === "admin" && (
-            <div className="filter-box">
-              <label htmlFor="filterLogin">Filter by Login</label>
-              <input
-                type="text"
-                id="filterLogin"
-                placeholder="Enter login..."
-                value={filterLogin}
-                onChange={(e) => setFilterLogin(e.target.value)}
-                autoComplete="off"
+          <button 
+            type="submit" 
+            className="fetch-stats-btn" 
+            disabled={loading}
+          >
+            {loading ? (
+              <>
+                <div className="spinner-small"></div>
+                <span>Chargement...</span>
+              </>
+            ) : (
+              <span>Actualiser les statistiques</span>
+            )}
+          </button>
+        </form>
+
+        {!loading && (
+          <div className="results-section">
+            {kind === "admin" && (
+              <div className="global-stats-section">
+                <h2 className="section-title">Présence Globale</h2>
+                <div className="global-chart-container">
+                  <div className="chart-wrapper">
+                    <Doughnut data={doughnutData} options={doughnutOptions} />
+                    <div className="chart-center-text">
+                      <span className="chart-percentage">{globalRate}%</span>
+                      <span className="chart-label">Présence</span>
+                    </div>
+                  </div>
+                  <div className="chart-legend">
+                    <div className="legend-item">
+                      <div className="legend-color present"></div>
+                      <span>Présent ({globalRate}%)</span>
+                    </div>
+                    <div className="legend-item">
+                      <div className="legend-color absent"></div>
+                      <span>Absent ({100 - globalRate}%)</span>
+                    </div>
+                  </div>
+                </div>
+              </div>
+            )}
+
+            {kind === "admin" && userStats.length > 0 && (
+              <>
+                <SearchAndFilter
+                  data={userStats}
+                  onFilteredData={handleFilteredData}
+                  searchFields={searchFields}
+                  filterOptions={filterOptions}
+                  sortOptions={sortOptions}
+                  placeholder="Rechercher par login, prénom ou nom..."
+                  className="stats-search-filter"
+                />
+
+                <div className="stats-summary">
+                  <div className="summary-card">
+                    <span className="summary-number">{filteredStats.length}</span>
+                    <span className="summary-label">Utilisateurs trouvés</span>
+                  </div>
+                  <div className="summary-card">
+                    <span className="summary-number">{userStats.length}</span>
+                    <span className="summary-label">Total utilisateurs</span>
+                  </div>
+                </div>
+              </>
+            )}
+
+            {paginatedStats.length > 0 ? (
+              <div className="table-section">
+                <div className="table-container">
+                  <table className="results-table">
+                    <thead>
+                      <tr>
+                        <th>Utilisateur</th>
+                        <th>Login</th>
+                        <th>Jours présents</th>
+                        <th>Jours totaux</th>
+                        <th>Taux de présence</th>
+                      </tr>
+                    </thead>
+                    <tbody>
+                      {paginatedStats.map((u, i) => (
+                        <tr key={i} className={`presence-${u.presenceCategory || 'medium'}`}>
+                          <td className="user-cell">
+                            <div className="user-info">
+                              <span className="user-name">
+                                {u.firstName} {u.lastName?.toUpperCase()}
+                              </span>
+                            </div>
+                          </td>
+                          <td className="login-cell">
+                            <code className="login-code">{u.login}</code>
+                          </td>
+                          <td className="numeric-cell">
+                            <span className="number-badge present">
+                              {u.joursPresent}
+                            </span>
+                          </td>
+                          <td className="numeric-cell">
+                            <span className="number-badge total">
+                              {u.joursTotaux}
+                            </span>
+                          </td>
+                          <td className="percentage-cell">
+                            <div className="percentage-container">
+                              <span className="percentage-text">
+                                {u.tauxPresence}%
+                              </span>
+                              <div className="percentage-bar">
+                                <div 
+                                  className="percentage-fill"
+                                  style={{ width: `${u.tauxPresence}%` }}
+                                ></div>
+                              </div>
+                            </div>
+                          </td>
+                        </tr>
+                      ))}
+                    </tbody>
+                  </table>
+                </div>
+
+                {totalPages > 1 && (
+                  <div className="pagination">
+                    <button
+                      disabled={currentPage === 1}
+                      onClick={() => setCurrentPage((p) => p - 1)}
+                      className="pagination-btn"
+                    >
+                      Précédent
+                    </button>
+                    
+                    <div className="pagination-info">
+                      <span className="page-numbers">
+                        Page {currentPage} sur {totalPages}
+                      </span>
+                      <span className="items-info">
+                        {((currentPage - 1) * ITEMS_PER_PAGE) + 1}-{Math.min(currentPage * ITEMS_PER_PAGE, filteredStats.length)} sur {filteredStats.length}
+                      </span>
+                    </div>
+                    
+                    <button
+                      disabled={currentPage === totalPages}
+                      onClick={() => setCurrentPage((p) => p + 1)}
+                      className="pagination-btn"
+                    >
+                      Suivant
+                    </button>
+                  </div>
+                )}
+              </div>
+            ) : (
+              <div className="no-data-message">
+                <div className="no-data-icon">📊</div>
+                <h3>Aucune donnée trouvée</h3>
+                <p>Aucun enregistrement de présence n'a été trouvé pour cette période.</p>
+                <button 
+                  onClick={fetchStats}
+                  className="retry-btn"
+                  disabled={loading}
+                >
+                  Réessayer
+                </button>
+              </div>
+            )}
+          </div>
+        )}
+
+        {loading && (
+          <div className="loading-section">
+            <div className="loading-spinner">
+              <div className="spinner"></div>
+            </div>
+            <p className="loading-text">Chargement des statistiques...</p>
+          </div>
+        )}
+      </div>
+    </div>
+  );
+};
+
+export default Check;